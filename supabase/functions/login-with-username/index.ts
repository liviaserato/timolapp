import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_USERNAME_ATTEMPTS = 5;
const MAX_IP_ATTEMPTS = 10;
const LOCKOUT_MINUTES = 10;
const LOCKOUT_MS = LOCKOUT_MINUTES * 60 * 1000;

type SecurityRow = {
  id: string;
  username: string;
  failed_attempts: number;
  locked_until: string | null;
  last_failed_at: string | null;
  last_ip: string | null;
};

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const candidate = forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "";

  if (!candidate || candidate.length > 64) {
    return null;
  }

  return candidate;
}

function isActiveLock(record: SecurityRow | null, now: Date) {
  if (!record?.locked_until) return false;
  return new Date(record.locked_until).getTime() > now.getTime();
}

function getRetryAfterSeconds(record: SecurityRow | null, now: Date) {
  if (!record?.locked_until) return undefined;
  return Math.max(1, Math.ceil((new Date(record.locked_until).getTime() - now.getTime()) / 1000));
}

async function findSecurityRecord(
  adminClient: ReturnType<typeof createClient>,
  key: string,
): Promise<SecurityRow | null> {
  const { data, error } = await adminClient
    .from("login_security")
    .select("id, username, failed_attempts, locked_until, last_failed_at, last_ip")
    .eq("username", key)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[login-with-username] Security lookup error:", error);
    throw error;
  }

  return data as SecurityRow | null;
}

async function resetSecurityRecord(
  adminClient: ReturnType<typeof createClient>,
  key: string,
  clientIp: string | null,
) {
  const existing = await findSecurityRecord(adminClient, key);

  if (!existing) return;

  const { error } = await adminClient
    .from("login_security")
    .update({
      failed_attempts: 0,
      locked_until: null,
      last_failed_at: null,
      last_ip: clientIp,
    })
    .eq("id", existing.id);

  if (error) {
    console.error("[login-with-username] Security reset error:", error);
    throw error;
  }
}

async function registerFailure(
  adminClient: ReturnType<typeof createClient>,
  key: string,
  clientIp: string | null,
  limit: number,
) {
  const now = new Date();
  const existing = await findSecurityRecord(adminClient, key);
  const shouldResetWindow =
    !existing?.last_failed_at || now.getTime() - new Date(existing.last_failed_at).getTime() > LOCKOUT_MS;
  const nextAttempts = (shouldResetWindow ? 0 : existing?.failed_attempts ?? 0) + 1;
  const lockedUntil = nextAttempts >= limit ? new Date(now.getTime() + LOCKOUT_MS).toISOString() : null;
  const payload = {
    failed_attempts: nextAttempts,
    locked_until: lockedUntil,
    last_failed_at: now.toISOString(),
    last_ip: clientIp,
  };

  if (existing) {
    const { error } = await adminClient.from("login_security").update(payload).eq("id", existing.id);

    if (error) {
      console.error("[login-with-username] Security update error:", error);
      throw error;
    }
  } else {
    const { error } = await adminClient.from("login_security").insert({ username: key, ...payload });

    if (error) {
      console.error("[login-with-username] Security insert error:", error);
      throw error;
    }
  }

  return {
    attempts: nextAttempts,
    lockedUntil,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const username = typeof body.username === "string" ? normalizeUsername(body.username) : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || username.length > 50 || !/^[a-z0-9_]+$/i.test(username) || !password || password.length > 128) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_credentials" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const clientIp = getClientIp(req);
    const ipKey = clientIp ? `ip:${clientIp}` : null;
    const now = new Date();

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const [usernameSecurity, ipSecurity] = await Promise.all([
      findSecurityRecord(adminClient, username),
      ipKey ? findSecurityRecord(adminClient, ipKey) : Promise.resolve(null),
    ]);

    const activeUsernameLock = isActiveLock(usernameSecurity, now);
    const activeIpLock = isActiveLock(ipSecurity, now);

    if (activeUsernameLock || activeIpLock) {
      const retryAfterSeconds = Math.max(
        getRetryAfterSeconds(usernameSecurity, now) ?? 0,
        getRetryAfterSeconds(ipSecurity, now) ?? 0,
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "temporarily_locked",
          retry_after_seconds: retryAfterSeconds,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 },
      );
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("email")
      .ilike("username", username)
      .limit(1)
      .maybeSingle();

    if (profileError) {
      console.error("[login-with-username] Profile lookup error:", profileError);
      throw profileError;
    }

    if (!profile?.email) {
      await Promise.all([
        registerFailure(adminClient, username, clientIp, MAX_USERNAME_ATTEMPTS),
        ipKey ? registerFailure(adminClient, ipKey, clientIp, MAX_IP_ATTEMPTS) : Promise.resolve(null),
      ]);

      return new Response(
        JSON.stringify({ success: false, error: "invalid_credentials" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
      );
    }

    const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (signInError || !signInData.session) {
      const [usernameFailure, ipFailure] = await Promise.all([
        registerFailure(adminClient, username, clientIp, MAX_USERNAME_ATTEMPTS),
        ipKey ? registerFailure(adminClient, ipKey, clientIp, MAX_IP_ATTEMPTS) : Promise.resolve(null),
      ]);

      const locked = Boolean(usernameFailure.lockedUntil || ipFailure?.lockedUntil);

      return new Response(
        JSON.stringify({
          success: false,
          error: locked ? "temporarily_locked" : "invalid_credentials",
          retry_after_seconds: locked ? LOCKOUT_MINUTES * 60 : undefined,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: locked ? 429 : 401,
        },
      );
    }

    await resetSecurityRecord(adminClient, username, clientIp);

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[login-with-username] Error:", error);

    return new Response(
      JSON.stringify({ success: false, error: "server_error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});

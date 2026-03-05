import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const timolHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (compatible; TimolApp/1.0)",
  Origin: "https://timolsystem.com.br",
  Referer: "https://timolsystem.com.br/",
};

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isEmailIdentifier(identifier: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
}

function parseExistsValue(payload: unknown): boolean | null {
  if (!payload || typeof payload !== "object") return null;

  const exists = (payload as { exists?: unknown }).exists;
  if (typeof exists === "boolean") return exists;
  if (typeof exists === "string") return exists.toLowerCase() === "true";

  const person = (payload as { person?: unknown }).person;
  if (Array.isArray(person)) return person.length > 0;

  return null;
}

async function checkExternalIdentifierExists(identifier: string): Promise<boolean> {
  const emailIdentifier = isEmailIdentifier(identifier);
  const url = new URL(
    emailIdentifier
      ? "https://www.timolweb.com.br/api/people/email-check"
      : "https://www.timolweb.com.br/api/people/username-check"
  );

  url.searchParams.set(emailIdentifier ? "email" : "username", identifier);

  const response = await fetch(url.toString(), {
    headers: timolHeaders,
  });

  if (!response.ok) {
    throw new Error(`upstream_${response.status}`);
  }

  const payload = await response.json();
  const exists = parseExistsValue(payload);

  if (exists === null) {
    throw new Error("unexpected_response");
  }

  return exists;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { identifier } = await req.json();

    if (!identifier || typeof identifier !== "string" || identifier.trim().length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_identifier" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const trimmed = identifier.trim().toLowerCase();
    const identifierColumn = isEmailIdentifier(trimmed) ? "email" : "username";

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, email, username")
      .ilike(identifierColumn, trimmed)
      .limit(1)
      .maybeSingle();

    if (profileError) {
      console.error("[forgot-password] Profile lookup error:", profileError);
      throw profileError;
    }

    let exists = false;

    try {
      exists = await checkExternalIdentifierExists(trimmed);
    } catch (validationError) {
      console.warn("[forgot-password] External validation fallback:", validationError);
      exists = Boolean(profile);
    }

    if (!exists) {
      return new Response(
        JSON.stringify({ success: false, error: "not_found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    if (!profile?.user_id || !profile.email) {
      return new Response(
        JSON.stringify({ success: false, error: "email_unavailable" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
      );
    }

    const { error: invalidateError } = await supabase
      .from("password_reset_pins")
      .update({ used: true })
      .eq("user_id", profile.user_id)
      .eq("used", false);

    if (invalidateError) {
      console.error("[forgot-password] PIN invalidation error:", invalidateError);
      throw invalidateError;
    }

    const pin = generatePin();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from("password_reset_pins").insert({
      user_id: profile.user_id,
      user_identifier: trimmed,
      email: profile.email,
      pin,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error("[forgot-password] PIN insert error:", insertError);
      throw insertError;
    }

    console.log(`[forgot-password] Email sending stub ready for noreply@timol.com.br -> ${profile.email}; PIN: ${pin}; expires_at: ${expiresAt}`);

    return new Response(
      JSON.stringify({ success: true, message: "pin_sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[forgot-password] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "server_error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

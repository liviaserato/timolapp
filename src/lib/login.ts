import { supabase } from "@/integrations/supabase/client";

export type LoginErrorCode =
  | "temporarily_locked"
  | "invalid_credentials"
  | "server_error";

interface LoginFunctionSuccess {
  success: true;
  session: {
    access_token: string;
    refresh_token: string;
  };
}

interface LoginFunctionFailure {
  success?: false;
  error?: LoginErrorCode;
  retry_after_seconds?: number;
}

export async function loginWithUsername({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<{ success: true } | { success: false; error: LoginErrorCode; retryAfterSeconds?: number }> {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/login-with-username`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        username: username.trim(),
        password,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as LoginFunctionSuccess | LoginFunctionFailure;

    if (!response.ok || !payload || payload.success !== true) {
      return {
        success: false,
        error:
          payload && "error" in payload && payload.error
            ? payload.error
            : response.status === 429
              ? "temporarily_locked"
              : "server_error",
        retryAfterSeconds:
          payload && "retry_after_seconds" in payload && typeof payload.retry_after_seconds === "number"
            ? payload.retry_after_seconds
            : undefined,
      };
    }

    const { error } = await supabase.auth.setSession({
      access_token: payload.session.access_token,
      refresh_token: payload.session.refresh_token,
    });

    if (error) {
      return { success: false, error: "server_error" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "server_error" };
  }
}

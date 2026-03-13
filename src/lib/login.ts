/**
 * Login helper — delegates to the centralized API client.
 */

import { login as apiLogin, ApiRequestError } from "@/lib/api";

export type LoginErrorCode =
  | "temporarily_locked"
  | "invalid_credentials"
  | "system_access_denied"
  | "server_error";

export async function loginWithUsername({
  username,
  password,
  rememberMe = false,
}: {
  username: string;
  password: string;
  rememberMe?: boolean;
}): Promise<{ success: true } | { success: false; error: LoginErrorCode; retryAfterSeconds?: number }> {
  try {
    await apiLogin({ username, password, rememberMe });
    return { success: true };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      if (err.status === 429 || err.code === "temporarily_locked") {
        const raw = err.raw as Record<string, unknown> | undefined;
        return {
          success: false,
          error: "temporarily_locked",
          retryAfterSeconds: typeof raw?.retryAfterSeconds === "number" ? raw.retryAfterSeconds : undefined,
        };
      }
      if (err.status === 401 || err.code === "invalid_credentials") {
        return { success: false, error: "invalid_credentials" };
      }
    }
    return { success: false, error: "server_error" };
  }
}

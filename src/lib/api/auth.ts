/**
 * Authentication API endpoints
 * POST /api/auth/login
 * GET  /api/auth/me
 * POST /api/auth/password/recovery-target
 * POST /api/auth/password/request-pin
 * POST /api/auth/password/verify-pin
 * POST /api/auth/password/reset
 * POST /api/auth/username/forgot
 */

import { api, setAccessToken, clearAccessToken } from "./client";

// ─── Login ─────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  franchiseId?: string;
  fullName?: string;
}

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const raw = await api.post<LoginResponse & { token?: string; user?: Record<string, unknown> }>("/api/auth/login", {
    username: req.username.trim().toLowerCase(),
    password: req.password,
    rememberMe: req.rememberMe,
    systemId: "timol-app",
  }, { auth: false });

  // Accept both `accessToken` (Timol API) and `token` (Manus backend)
  const token = raw.accessToken || raw.token || "";
  const data: LoginResponse = {
    accessToken: token,
    expiresAt: raw.expiresAt || "",
    franchiseId: raw.franchiseId || (raw.user as Record<string, unknown>)?.franchiseId as string | undefined,
    fullName: raw.fullName || (raw.user as Record<string, unknown>)?.fullName as string | undefined,
  };

  // Store the token
  setAccessToken(data.accessToken, req.rememberMe);

  return data;
}

export function logout(): void {
  clearAccessToken();
  window.location.href = "/";
}

// ─── Password Recovery ─────────────────────────────────────────

export interface RecoveryTargetResponse {
  maskedEmail: string;
}

/** Step 1: Get masked email for confirmation */
export async function passwordRecoveryTarget(username: string): Promise<RecoveryTargetResponse> {
  return api.post<RecoveryTargetResponse>("/api/auth/password/recovery-target", {
    username: username.trim().toLowerCase(),
  }, { auth: false });
}

/** Step 2: Request PIN (sends email) */
export async function passwordRequestPin(username: string): Promise<void> {
  await api.post("/api/auth/password/request-pin", {
    username: username.trim().toLowerCase(),
  }, { auth: false });
}

export interface VerifyPinResponse {
  resetToken: string;
  expiresAt: string;
}

/** Step 3: Verify PIN */
export async function passwordVerifyPin(username: string, pin: string): Promise<VerifyPinResponse> {
  return api.post<VerifyPinResponse>("/api/auth/password/verify-pin", {
    username: username.trim().toLowerCase(),
    pin,
  }, { auth: false });
}

/** Step 4: Reset password */
export async function passwordReset(resetToken: string, newPassword: string): Promise<void> {
  await api.post("/api/auth/password/reset", {
    resetToken,
    newPassword,
  }, { auth: false });
}

// ─── Username Recovery ──────────────────────────────────────────

export interface ForgotUsernameByEmail {
  method: "email";
  email: string;
  birthDate: string; // ISO format YYYY-MM-DD
}

export interface ForgotUsernameByDocument {
  method: "document";
  document: string;
  documentCountryCode: string;
  birthDate: string; // ISO format YYYY-MM-DD
}

export type ForgotUsernameRequest = ForgotUsernameByEmail | ForgotUsernameByDocument;

export interface ForgotUsernameResponse {
  username: string;
  fullName?: string;
}

/** Recover username by email or document */
export async function forgotUsername(req: ForgotUsernameRequest): Promise<ForgotUsernameResponse> {
  return api.post<ForgotUsernameResponse>("/api/auth/username/forgot", req, { auth: false });
}

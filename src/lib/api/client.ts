/**
 * Centralized HTTP client for the Timol backend API.
 * All API calls go through this module.
 */

const TOKEN_KEY = "timol_access_token";
const STORAGE_MODE_KEY = "timol_remember_me";

// Base URL — supports VITE_API_URL (Manus) or VITE_API_BASE_URL (legacy)
function getBaseUrl(): string {
  return import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "https://3001-islx8717rpj8ilx2h03mq-b2e90ed3.us2.manus.computer";
}

// ─── Token Management ──────────────────────────────────────────

function getStorage(): Storage {
  return localStorage.getItem(STORAGE_MODE_KEY) === "true"
    ? localStorage
    : sessionStorage;
}

export function getAccessToken(): string | null {
  // Check both storages — token could be in either
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string, rememberMe: boolean): void {
  // Clear from both, then store in the correct one
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.setItem(STORAGE_MODE_KEY, rememberMe ? "true" : "false");

  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(STORAGE_MODE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// ─── HTTP Methods ──────────────────────────────────────────────

export interface ApiError {
  status: number;
  code?: string;
  message?: string;
  raw?: unknown;
}

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  raw?: unknown;

  constructor(apiError: ApiError) {
    super(apiError.message || `API error ${apiError.status}`);
    this.name = "ApiRequestError";
    this.status = apiError.status;
    this.code = apiError.code;
    this.raw = apiError.raw;
  }
}

interface RequestOptions {
  /** If false, don't send Authorization header. Default: true */
  auth?: boolean;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
  /** Additional headers */
  headers?: Record<string, string>;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true, signal, headers: extraHeaders } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extraHeaders,
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = `${getBaseUrl()}${path}`;

  // Debug log for development
  console.log(`[API] ${method} ${url}`);

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  // Handle 401 → redirect to login
  if (res.status === 401) {
    clearAccessToken();
    // Only redirect if we're not already on the login page
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
    throw new ApiRequestError({ status: 401, code: "unauthorized", message: "Session expired" });
  }

  // Parse response
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const errObj = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    throw new ApiRequestError({
      status: res.status,
      code: (errObj.error as string) || (errObj.code as string) || undefined,
      message: (errObj.message as string) || `Request failed with status ${res.status}`,
      raw: data,
    });
  }

  return data as T;
}

// Convenience methods
export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>("GET", path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("POST", path, body, opts),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PUT", path, body, opts),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PATCH", path, body, opts),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>("DELETE", path, undefined, opts),
};

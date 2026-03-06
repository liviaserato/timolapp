/**
 * People/Registration API endpoints
 * POST /api/people/check-document
 * POST /api/people/check-email
 * POST /api/people/check-username
 * POST /api/people/register (pending — 1st send)
 * POST /api/people/register/continue
 * POST /api/people/register (completed — 2nd send)
 */

import { api } from "./client";

// ─── Validation Checks ─────────────────────────────────────────

export interface CheckDocumentRequest {
  document: string;
  documentCountryCode: string;
}

export interface CheckDocumentResponse {
  available: boolean;
  exists: boolean;
  person?: Record<string, unknown>;
  franchises?: {
    count: number;
    items: Array<{ id?: string; franchiseType?: string }>;
  };
}

export async function checkDocument(req: CheckDocumentRequest, signal?: AbortSignal): Promise<CheckDocumentResponse> {
  return api.post<CheckDocumentResponse>("/api/people/check-document", req, { auth: false, signal });
}

export interface CheckEmailResponse {
  available: boolean;
}

export async function checkEmail(email: string, signal?: AbortSignal): Promise<CheckEmailResponse> {
  return api.post<CheckEmailResponse>("/api/people/check-email", { email }, { auth: false, signal });
}

export interface CheckUsernameResponse {
  available: boolean;
}

export async function checkUsername(username: string, signal?: AbortSignal): Promise<CheckUsernameResponse> {
  return api.post<CheckUsernameResponse>("/api/people/check-username", { username }, { auth: false, signal });
}

// ─── Registration (1st send — pending) ──────────────────────────

export interface RegisterPendingRequest {
  sponsorFranchiseId: string;
  sponsorSelectionMethod: "search" | "suggest";
  sourceLanguage: string;
  // Personal data
  fullName: string;
  birthDate: string;
  document: string;
  documentCountryCode: string;
  gender: string;
  // Contact
  email: string;
  phone: string;
  // Address
  country: string;
  countryIso2: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  // Login
  username: string;
  password: string;
}

export interface RegisterPendingResponse {
  franchiseId: string;
}

export async function registerPending(req: RegisterPendingRequest): Promise<RegisterPendingResponse> {
  return api.post<RegisterPendingResponse>("/api/people/register", req, { auth: false });
}

// ─── Continue Registration ──────────────────────────────────────

export interface ContinueRegistrationResponse {
  franchiseId: string;
  status: string;
  // May include additional data to restore the UI
  data?: Record<string, unknown>;
}

export async function continueRegistration(token: string): Promise<ContinueRegistrationResponse> {
  return api.post<ContinueRegistrationResponse>("/api/people/register/continue", { token }, { auth: false });
}

// ─── Registration (2nd send — completed) ────────────────────────

export interface RegisterCompleteRequest {
  franchiseId: string;
  franchiseTypeCode: string;
  couponCode?: string;
  agreeContract: boolean;
  agreeCommunications: boolean;
  // Payment
  paymentMethod: string;
  amountPaid: number;
  currencyCode: string;
  installments?: number;
  cardData?: {
    cardNumber: string;
    holderName: string;
    expirationDate: string;
    cvv: string;
    brand: string;
  };
  // Contract
  contractVersion: string;
  acceptedAt: string; // ISO datetime
  ipAddress: string;
  userAgent: string;
}

export interface RegisterCompleteResponse {
  success: boolean;
  status: string;
}

export async function registerComplete(req: RegisterCompleteRequest): Promise<RegisterCompleteResponse> {
  return api.post<RegisterCompleteResponse>("/api/people/register", req);
}

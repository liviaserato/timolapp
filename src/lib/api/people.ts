/**
 * People/Registration API endpoints
 * POST /api/people/check-document
 * POST /api/people/check-email
 * POST /api/people/check-username
 * POST /api/people/register (1st send — pending)
 * POST /api/people/register/pending (validate pending registration)
 * POST /api/people/register/pending-email (trigger pending email)
 * POST /api/people/register/continue
 * POST /api/people/register/complete (2nd send — completed)
 */

import { api } from "./client";

// ─── Validation Checks ─────────────────────────────────────────

export interface CheckDocumentRequest {
  document: string;
  documentCountryCode: string;
}

export interface CheckDocumentResponse {
  isAvailable: boolean;
  reason?: string;
}

export async function checkDocument(req: CheckDocumentRequest, signal?: AbortSignal): Promise<CheckDocumentResponse> {
  return api.post<CheckDocumentResponse>("/api/people/check-document", req, { auth: false, signal });
}

export interface CheckEmailResponse {
  isAvailable: boolean;
  reason?: string;
}

export async function checkEmail(email: string, signal?: AbortSignal): Promise<CheckEmailResponse> {
  return api.post<CheckEmailResponse>("/api/people/check-email", { email }, { auth: false, signal });
}

export interface CheckUsernameResponse {
  isAvailable: boolean;
  reason?: string;
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
  gender: string;
  document: string;
  documentCountryCode: string;
  // Contact
  email: string;
  phoneNumber: string;
  // Address
  countryIso2: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood?: string;
  cityId: string;
  stateId: string;
  // Login
  username: string;
  password: string;
}

export interface RegisterPendingResponse {
  franchiseId: string;
  registrationStatus: string;
}

export async function registerPending(req: RegisterPendingRequest): Promise<RegisterPendingResponse> {
  return api.post<RegisterPendingResponse>("/api/people/register", req, { auth: false });
}

// ─── Validate Pending Registration ──────────────────────────────

export interface RegisterPendingCheckRequest {
  franchiseId: string;
  document: string;
  documentCountryCode: string;
  birthDate: string;
}

export interface RegisterPendingCheckResponse {
  found: boolean;
  registrationStatus: string;
  maskedEmail: string;
}

export async function registerPendingCheck(req: RegisterPendingCheckRequest): Promise<RegisterPendingCheckResponse> {
  return api.post<RegisterPendingCheckResponse>("/api/people/register/pending", req, { auth: false });
}

// ─── Trigger Pending Email ──────────────────────────────────────

export interface SendPendingEmailRequest {
  franchiseId: string;
  languageCode: string;
}

export async function sendPendingEmail(req: SendPendingEmailRequest): Promise<void> {
  await api.post("/api/people/register/pending-email", req, { auth: false });
}

// ─── Continue Registration ──────────────────────────────────────

export interface ContinueRegistrationResponse {
  isValid: boolean;
  franchiseId: string;
  registrationStatus: string;
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
  paymentMethod: "pix" | "credit-card" | "deposit";
  installments?: number;
  amountPaid: number;
  currencyCode: string;
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
  return api.post<RegisterCompleteResponse>("/api/people/register/complete", req);
}

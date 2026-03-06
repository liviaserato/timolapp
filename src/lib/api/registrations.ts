/**
 * Pending Registrations API endpoints
 * GET /api/registrations/pending
 * POST /api/registrations/:id/touchpoints
 * POST /api/registrations/:id/approve-payment
 */

import { api } from "./client";

// ─── List Pending ───────────────────────────────────────────────

export interface PendingRegistration {
  id: string;
  franchiseId: string | null;
  fullName: string | null;
  document: string | null;
  documentCountryCode: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  sponsorId: string | null;
  sponsorName: string | null;
  sponsorSource: string | null;
  franchiseName: string | null;
  franchiseSelected: boolean;
  paymentCompleted: boolean;
  paymentMethod: string | null;
  paymentStatus: string | null;
  approvalMethod: string | null;
  status: string;
  gender: string | null;
  preferredLanguage: string | null;
  createdAt: string;
  updatedAt: string;
  // Touchpoint tracking
  whatsappSentAt: string | null;
  sponsorNotifiedAt: string | null;
  recoveryEmailSentAt: string | null;
}

export interface PendingRegistrationsResponse {
  data: PendingRegistration[];
}

export async function getPendingRegistrations(): Promise<PendingRegistrationsResponse> {
  return api.get<PendingRegistrationsResponse>("/api/registrations/pending");
}

// ─── Touchpoints ────────────────────────────────────────────────

export interface RecordTouchpointRequest {
  type: "whatsapp" | "sponsor";
}

export interface RecordTouchpointResponse {
  sentAt: string;
}

export async function recordTouchpoint(registrationId: string, type: "whatsapp" | "sponsor"): Promise<RecordTouchpointResponse> {
  return api.post<RecordTouchpointResponse>(
    `/api/registrations/${registrationId}/touchpoints`,
    { type },
  );
}

// ─── Manual Payment Approval ────────────────────────────────────

export interface ApprovePaymentResponse {
  success: boolean;
  status: string;
}

export async function approvePayment(registrationId: string): Promise<ApprovePaymentResponse> {
  return api.post<ApprovePaymentResponse>(
    `/api/registrations/${registrationId}/approve-payment`,
  );
}

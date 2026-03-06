/**
 * Pending Registrations API endpoints
 * GET  /api/registrations/pending
 * GET  /api/registrations/{franchiseId}/notes
 * POST /api/registrations/{franchiseId}/notes
 * POST /api/registrations/{franchiseId}/touchpoints/whatsapp
 * POST /api/registrations/{franchiseId}/touchpoints/sponsor-notified
 */

import { api } from "./client";

// ─── List Pending ───────────────────────────────────────────────

export interface PendingRegistrationItem {
  franchiseId: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  document: string | null;
  documentCountryCode: string | null;
  sponsorFranchiseId: string | null;
  sponsorName?: string | null;
  franchiseTypeCode: string | null;
  paymentStatus: string | null;
  approvalMethod: string | null;
  createdAt: string;
  // Extended fields (may be included by API)
  cityId?: string | null;
  stateId?: string | null;
  country?: string | null;
  gender?: string | null;
  preferredLanguage?: string | null;
  sponsorSelectionMethod?: string | null;
  // Touchpoint tracking (may be embedded)
  whatsappSentAt?: string | null;
  sponsorNotifiedAt?: string | null;
  recoveryEmailSentAt?: string | null;
}

export interface PendingRegistrationsResponse {
  total: number;
  page: number;
  pageSize: number;
  items: PendingRegistrationItem[];
}

export async function getPendingRegistrations(): Promise<PendingRegistrationsResponse> {
  return api.get<PendingRegistrationsResponse>("/api/registrations/pending");
}

// ─── Notes ──────────────────────────────────────────────────────

export interface RegistrationNote {
  registrationNoteId: string;
  franchiseId: string;
  note: string;
  createdAt: string;
  createdByUserId: string;
}

export interface RegistrationNotesResponse {
  notes: RegistrationNote[];
}

export async function getRegistrationNotes(franchiseId: string): Promise<RegistrationNotesResponse> {
  return api.get<RegistrationNotesResponse>(`/api/registrations/${encodeURIComponent(franchiseId)}/notes`);
}

export async function createRegistrationNote(franchiseId: string, note: string): Promise<RegistrationNote> {
  return api.post<RegistrationNote>(`/api/registrations/${encodeURIComponent(franchiseId)}/notes`, { note });
}

// ─── Touchpoints ────────────────────────────────────────────────

export interface TouchpointResponse {
  sentAt: string;
}

export async function recordWhatsappTouchpoint(franchiseId: string, note?: string): Promise<TouchpointResponse> {
  return api.post<TouchpointResponse>(
    `/api/registrations/${encodeURIComponent(franchiseId)}/touchpoints/whatsapp`,
    note ? { note } : undefined,
  );
}

export async function recordSponsorNotifiedTouchpoint(franchiseId: string, note?: string): Promise<TouchpointResponse> {
  return api.post<TouchpointResponse>(
    `/api/registrations/${encodeURIComponent(franchiseId)}/touchpoints/sponsor-notified`,
    note ? { note } : undefined,
  );
}

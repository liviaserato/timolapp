/**
 * Payment API endpoints
 * POST /api/payments/manual-approve
 */

import { api } from "./client";

// ─── Manual Approval ────────────────────────────────────────────

export interface ManualApproveRequest {
  franchiseId: string;
  approved: boolean;
  note?: string;
}

export interface ManualApproveResponse {
  success: boolean;
  status: string;
}

export async function manualApprovePayment(req: ManualApproveRequest): Promise<ManualApproveResponse> {
  return api.post<ManualApproveResponse>("/api/payments/manual-approve", req);
}

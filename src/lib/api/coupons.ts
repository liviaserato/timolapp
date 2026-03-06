/**
 * Coupon API endpoints
 * POST /api/coupons/validate
 */

import { api } from "./client";

// ─── Discount Preview ───────────────────────────────────────────

export interface DiscountPreview {
  discountType: "percentage" | "fixed";
  value: number;
  capAmount?: number;
  discountAmount: number;
  finalAmount: number;
  currencyCode: string;
}

// ─── Validate ───────────────────────────────────────────────────

export interface ValidateCouponRequest {
  couponCode: string;
  scope: string; // e.g. "franchisePurchase"
  franchiseId?: string;
  franchiseTypeCode?: string;
  amount: number;
  currencyCode: string;
}

export interface ValidateCouponResponse {
  isValid: boolean;
  reasonCode?: string;
  discountPreview?: DiscountPreview;
}

export async function validateCoupon(req: ValidateCouponRequest): Promise<ValidateCouponResponse> {
  return api.post<ValidateCouponResponse>("/api/coupons/validate", req, { auth: false });
}

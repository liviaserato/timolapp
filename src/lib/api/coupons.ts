/**
 * Coupon API endpoints
 * POST /api/coupons/validate
 */

import { api } from "./client";

export interface ValidateCouponRequest {
  couponCode: string;
  franchiseTypeCode?: string;
  currencyCode?: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  finalAmount?: number;
  message?: string;
}

export async function validateCoupon(req: ValidateCouponRequest): Promise<ValidateCouponResponse> {
  return api.post<ValidateCouponResponse>("/api/coupons/validate", req, { auth: false });
}

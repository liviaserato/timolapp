/**
 * Centralized API module — re-exports all API functions and types.
 * 
 * Usage:
 *   import { login, searchSponsor, checkDocument } from "@/lib/api";
 */

// Client utilities
export { getAccessToken, setAccessToken, clearAccessToken, isAuthenticated, api, ApiRequestError } from "./client";
export type { ApiError } from "./client";

// Auth
export { login, logout, passwordRecoveryTarget, passwordRequestPin, passwordVerifyPin, passwordReset, forgotUsername } from "./auth";
export type { LoginRequest, LoginResponse, RecoveryTargetResponse, VerifyPinResponse, ForgotUsernameRequest, ForgotUsernameByEmail, ForgotUsernameByDocument, ForgotUsernameResponse } from "./auth";

// Sponsors
export { searchSponsor, suggestSponsors } from "./sponsors";
export type { SponsorResult, SponsorSearchResponse, SponsorSuggestResponse } from "./sponsors";

// People / Registration
export { checkDocument, checkEmail, checkUsername, registerPending, continueRegistration, registerComplete } from "./people";
export type { CheckDocumentRequest, CheckDocumentResponse, CheckEmailResponse, CheckUsernameResponse, RegisterPendingRequest, RegisterPendingResponse, ContinueRegistrationResponse, RegisterCompleteRequest, RegisterCompleteResponse } from "./people";

// Registrations (admin)
export { getPendingRegistrations, recordTouchpoint, approvePayment } from "./registrations";
export type { PendingRegistration, PendingRegistrationsResponse, RecordTouchpointResponse, ApprovePaymentResponse } from "./registrations";

// Coupons
export { validateCoupon } from "./coupons";
export type { ValidateCouponRequest, ValidateCouponResponse } from "./coupons";

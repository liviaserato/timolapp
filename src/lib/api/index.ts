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
export { login, logout, passwordRecoveryTarget, passwordRequestPin, passwordVerifyPin, passwordReset, forgotUsername, getMe } from "./auth";
export type { LoginRequest, LoginResponse, RecoveryTargetResponse, VerifyPinResponse, ForgotUsernameRequest, ForgotUsernameByEmail, ForgotUsernameByDocument, ForgotUsernameResponse, GetMeResponse } from "./auth";

// Sponsors
export { searchSponsor, suggestSponsors } from "./sponsors";
export type { SponsorResult, SponsorSearchResponse, SponsorSuggestResponse } from "./sponsors";

// People / Registration
export { checkDocument, checkEmail, checkUsername, registerPending, registerPendingCheck, sendPendingEmail, continueRegistration, registerComplete } from "./people";
export type { CheckDocumentRequest, CheckDocumentResponse, CheckEmailResponse, CheckUsernameResponse, RegisterPendingRequest, RegisterPendingResponse, RegisterPendingCheckRequest, RegisterPendingCheckResponse, SendPendingEmailRequest, ContinueRegistrationResponse, RegisterCompleteRequest, RegisterCompleteResponse } from "./people";

// Registrations (admin)
export { getPendingRegistrations, getRegistrationNotes, createRegistrationNote, recordWhatsappTouchpoint, recordSponsorNotifiedTouchpoint } from "./registrations";
export type { PendingRegistrationItem, PendingRegistrationsResponse, RegistrationNote, RegistrationNotesResponse, TouchpointResponse } from "./registrations";

// Payments
export { manualApprovePayment } from "./payments";
export type { ManualApproveRequest, ManualApproveResponse } from "./payments";

// Coupons
export { validateCoupon } from "./coupons";
export type { ValidateCouponRequest, ValidateCouponResponse, DiscountPreview } from "./coupons";

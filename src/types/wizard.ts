// Shared wizard context to pass data between all screens
// Field names MUST match the backend API contract (camelCase)
export interface WizardData {
  // Sponsor
  sponsorFranchiseId?: string;
  sponsorName?: string;
  sponsorCity?: string;
  sponsorState?: string;
  sponsorCountryIso2?: string;
  sponsorCountryFlag?: string;
  sponsorSelectionMethod?: "search" | "suggest";

  // Personal (Step 1)
  fullName?: string;
  birthDate?: string;
  document?: string;
  foreignerNoCpf?: string; // "true" | "false" — UI-only toggle
  documentCountryCode?: string;
  documentCountry?: string; // display name (UI-only)
  documentCountryFlag?: string; // display (UI-only)
  gender?: string;

  // Contact (Step 2)
  email?: string;
  phoneNumber?: string;

  // Address (Step 3)
  country?: string; // display name (UI-only)
  countryIso2?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  cityId?: string;
  stateId?: string;

  // Login (Step 4)
  username?: string;
  password?: string;
  confirmPassword?: string;

  // Franchise
  franchiseTypeCode?: string;
  franchisePrice?: number;

  // Agreements
  agreeContract?: boolean;
  agreeCommunications?: boolean;

  // Franchise ID after registration
  franchiseId?: string;

  // Registration status
  registrationStatus?: string;

  // Payment info
  paymentMethod?: "pix" | "credit-card" | "deposit";
  cardLast4?: string;
  installments?: number;
  cardHolderName?: string;
  amountPaid?: number;
  currencyCode?: string;

  // Contract
  contractVersion?: string;
  acceptedAt?: string;
  ipAddress?: string;
  userAgent?: string;

  // Coupon
  couponCode?: string;

  // Language
  sourceLanguage?: string;

  // Document check — already registered document was validated
  documentCheckPassed?: boolean;

  // Auth UUID (for updating registration_status)
  authUserId?: string;
}

export type AppScreen =
  | "sponsor"
  | "registration"
  | "registrationAddress"
  | "franchise"
  | "summary"
  | "payment"
  | "paymentPending"
  | "paymentConfirmation";

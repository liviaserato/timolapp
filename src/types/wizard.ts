// Shared wizard context to pass data between all screens
export interface WizardData {
  // Sponsor
  sponsorId?: string;
  sponsorName?: string;
  sponsorCity?: string;
  sponsorState?: string;
  sponsorCountryFlag?: string;

  // Personal (Step 1)
  fullName?: string;
  birthDate?: string;
  document?: string;
  foreignerNoCpf?: string; // "true" | "false"
  documentCountry?: string;
  documentCountryIso2?: string;
  documentCountryFlag?: string;
  gender?: string;

  // Contact (Step 2)
  email?: string;
  phone?: string;

  // Address (Step 3)
  country?: string;
  countryIso2?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;

  // Login (Step 4)
  username?: string;
  password?: string;
  confirmPassword?: string;

  // Franchise
  franchise?: string;
  franchisePrice?: number;

  // Agreements
  agreeRules?: boolean;
  agreeCommunications?: boolean;

  // User ID after registration
  userId?: string;

  // Payment info
  paymentMethod?: "pix" | "credit";
  cardLast4?: string;
  cardInstallments?: number;
  cardHolderName?: string;

  // Document check — already registered document was validated
  documentCheckPassed?: boolean;
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

/**
 * Sponsor API endpoints
 * GET /api/sponsors/search?sponsorFranchiseId=...
 * GET /api/sponsors/suggest?countryIso2=...&stateId=...&cityId=...
 */

import { api } from "./client";

// ─── Shared Sponsor Result ─────────────────────────────────────

export interface SponsorResult {
  franchiseId: string;
  sponsorName: string;
  sponsorCity: string;
  sponsorState: string;
  sponsorCountryIso2: string;
  sponsorCountryFlag?: string;
  photo?: string;
}

// ─── Search ─────────────────────────────────────────────────────

export interface SponsorSearchResponse {
  exists: boolean;
  sponsor?: SponsorResult;
}

/** Search sponsor by franchise ID */
export async function searchSponsor(sponsorFranchiseId: string): Promise<SponsorSearchResponse> {
  return api.get<SponsorSearchResponse>(
    `/api/sponsors/search?sponsorFranchiseId=${encodeURIComponent(sponsorFranchiseId.trim())}`,
    { auth: false },
  );
}

// ─── Suggest ────────────────────────────────────────────────────

export interface SponsorSuggestResponse {
  sponsors: SponsorResult[];
}

/** Get random eligible sponsors by location */
export async function suggestSponsors(params: {
  countryIso2: string;
  stateId?: string;
  cityId?: string;
}): Promise<SponsorSuggestResponse> {
  const qs = new URLSearchParams();
  qs.set("countryIso2", params.countryIso2);
  if (params.stateId) qs.set("stateId", params.stateId);
  if (params.cityId) qs.set("cityId", params.cityId);

  return api.get<SponsorSuggestResponse>(
    `/api/sponsors/suggest?${qs.toString()}`,
    { auth: false },
  );
}

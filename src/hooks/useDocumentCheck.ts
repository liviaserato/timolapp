import { useState, useEffect, useRef, useCallback } from "react";

export interface DocumentCheckPhone {
  ddi?: string;
  number?: string;
}

export interface DocumentCheckPerson {
  fullName?: string;
  birthDate?: string;
  email?: string;
  document?: string;
  issuerCountryIso2?: string;
  phones?: {
    preferred?: DocumentCheckPhone;
    mobile?: DocumentCheckPhone;
    home?: DocumentCheckPhone;
    work?: DocumentCheckPhone;
  };
  address?: {
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface DocumentCheckFranchiseItem {
  id?: string;
  franchiseType?: string;
}

export interface DocumentCheckResult {
  exists: boolean;
  person: DocumentCheckPerson | null;
  franchises: {
    count: number;
    items: DocumentCheckFranchiseItem[];
  };
}

interface UseDocumentCheckOpts {
  document: string;
  isForeigner: boolean;
  issuerCountryIso2: string;
  enabled?: boolean;
}

export function resolvePhone(phones?: DocumentCheckPerson["phones"]): string | null {
  if (!phones) return null;
  const pick = phones.preferred ?? phones.mobile ?? phones.home ?? phones.work ?? null;
  if (!pick || !pick.number) return null;
  return pick.ddi ? `${pick.ddi} ${pick.number}` : pick.number;
}

// CPF validation (same logic as RegistrationWizard)
function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(clean[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(clean[10]);
}

export function useDocumentCheck({ document, isForeigner, issuerCountryIso2, enabled = true }: UseDocumentCheckOpts) {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<DocumentCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const rawClean = isForeigner ? document.trim() : document.replace(/\D/g, "");
  // API expects CPF with mask (xxx.xxx.xxx-xx)
  const cleanDoc = !isForeigner && rawClean.length === 11
    ? `${rawClean.slice(0,3)}.${rawClean.slice(3,6)}.${rawClean.slice(6,9)}-${rawClean.slice(9)}`
    : rawClean;
  const country = isForeigner ? issuerCountryIso2 : "BR";

  // Readiness checks:
  // - Brazilian: CPF must be 11 digits AND pass validation
  // - Foreigner: document must be filled AND country must be selected
  const isReady = isForeigner
    ? rawClean.length > 0 && !!issuerCountryIso2
    : rawClean.length === 11 && isValidCPF(rawClean);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setChecking(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  useEffect(() => {
    // Reset on any dependency change
    setResult(null);
    setError(null);

    if (!enabled || !isReady) {
      setChecking(false);
      return;
    }

    // Debounce 600ms
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    timerRef.current = setTimeout(async () => {
      setChecking(true);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-check`,
          {
            method: "POST",
            headers: {
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              document: cleanDoc,
              issuerCountryIso2: country,
            }),
            signal: controller.signal,
          }
        );

        if (controller.signal.aborted) return;

        if (res.status === 400) {
          const data = await res.json();
          setError(data.detail || data.error || "invalid_request");
          setChecking(false);
          return;
        }

        if (!res.ok) {
          // Network/server error → blocks advancement
          setError("network");
          setChecking(false);
          return;
        }

        const raw = await res.json();
        // API returns person as array and exists as string — normalize
        const normalized: DocumentCheckResult = {
          exists: raw.exists === "true" || raw.exists === true,
          person: Array.isArray(raw.person) ? raw.person[0] ?? null : raw.person ?? null,
          franchises: {
            count: raw.franchises?.count ?? 0,
            items: raw.franchises?.itens ?? raw.franchises?.items ?? [],
          },
        };
        setResult(normalized);
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
        setError("network");
      } finally {
        if (!controller.signal.aborted) {
          setChecking(false);
        }
      }
    }, 600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [cleanDoc, country, enabled, isReady, isForeigner, issuerCountryIso2]);

  return { checking, result, error, reset };
}

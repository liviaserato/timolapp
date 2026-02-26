import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Info, X, XCircle, Loader2, CheckCircle } from "lucide-react";
import { countries, getCountryName } from "@/data/countries";

interface Props {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  docCheckError?: string;
  docBlocked?: boolean;
  showDocCheck?: boolean;
  docChecking?: boolean;
  docCheckResult?: { exists: boolean } | null;
  resetDocCheck?: () => void;
}

// CPF mask: 000.000.000-00
function maskCPF(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// CPF digit validation
function isValidCPF(clean: string): boolean {
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

export const StepPersonal = ({ data, onChange, errors, docCheckError, docBlocked, showDocCheck, docChecking, docCheckResult, resetDocCheck }: Props) => {
  const { t, language } = useLanguage();
  const isForeigner = data.foreignerNoCpf === "true";
  const [foreignerHintDismissed, setForeignerHintDismissed] = useState(false);

  // Inline CPF validation: show error when 11 digits entered but invalid
  const cpfDigits = data.document?.replace(/\D/g, "") || "";
  const cpfComplete = !isForeigner && cpfDigits.length === 11;
  const cpfInvalid = cpfComplete && !isValidCPF(cpfDigits);

  // Document country selector state
  const [docCountrySearch, setDocCountrySearch] = useState("");
  const [showDocCountryList, setShowDocCountryList] = useState(false);
  const docCountryRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (docCountryRef.current && !docCountryRef.current.contains(e.target as Node)) {
        setShowDocCountryList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredDocCountries = countries
    .filter((c) => c.iso2 !== "BR") // Exclude Brazil since they're foreigners
    .filter((c) =>
      getCountryName(c, language).toLowerCase().includes(docCountrySearch.toLowerCase())
    );

  const selectDocCountry = (iso2: string) => {
    const c = countries.find((x) => x.iso2 === iso2);
    if (c) {
      onChange("documentCountry", getCountryName(c, language));
      onChange("documentCountryIso2", iso2);
      onChange("documentCountryFlag", c.flag);
    }
    setShowDocCountryList(false);
    setDocCountrySearch("");
  };

  const clearDocCountry = () => {
    onChange("documentCountry", "");
    onChange("documentCountryIso2", "");
    onChange("documentCountryFlag", "");
    setDocCountrySearch("");
  };

  const genderOptions = [
    { value: "male", label: t("step1.gender.male") },
    { value: "female", label: t("step1.gender.female") },
    { value: "other", label: t("step1.gender.other") },
    { value: "preferNotSay", label: t("step1.gender.preferNotSay") },
  ];

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];

  return (
    <div className="space-y-4">
      {/* Document / CPF — first for early validation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Label htmlFor="document">
            {isForeigner ? t("step1.document.foreigner") : t("step1.document")}
          </Label>
          <div className="flex items-center gap-2">
            <Checkbox
              id="foreignerNoCpf"
              checked={isForeigner}
              onCheckedChange={(v) => {
                onChange("foreignerNoCpf", v ? "true" : "false");
                // Reset API validation state (but keep document value)
                resetDocCheck?.();
                if (!v) {
                  // Switching back to Brazilian: clear foreign country fields
                  onChange("documentCountry", "");
                  onChange("documentCountryIso2", "");
                  onChange("documentCountryFlag", "");
                }
              }}
            />
            <Label htmlFor="foreignerNoCpf" className="text-sm font-normal cursor-pointer">
              {t("step1.notBrazilian")}
            </Label>
          </div>
        </div>

        <div className="relative">
          <Input
            id="document"
            placeholder={isForeigner ? t("step1.document.foreigner.placeholder") : t("step1.document.placeholder")}
            value={data.document || ""}
            onChange={(e) =>
              onChange(
                "document",
                isForeigner ? e.target.value : maskCPF(e.target.value)
              )
            }
            maxLength={isForeigner ? 50 : 14}
            className={docCheckResult && !docCheckResult.exists && !cpfInvalid ? "pr-10" : ""}
          />
          {docCheckResult && !docCheckResult.exists && !cpfInvalid && (
            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
          )}
        </div>
        {errors.document && <p className="text-sm text-destructive">{errors.document}</p>}
        {!errors.document && cpfInvalid && (
          <p className="text-sm text-destructive flex items-start gap-1.5">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            {t("validation.cpfInvalid")}
          </p>
        )}
        {errors.documentRegistered && (
          <p className="text-sm text-destructive flex items-start gap-1.5">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            {errors.documentRegistered}
          </p>
        )}
        {docChecking && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("docCheck.checking") || "Verificando documento..."}</span>
          </div>
        )}
        {docCheckError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-start gap-2">
            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{docCheckError === "network" ? t("docCheck.error.network") : t("docCheck.error.invalid")}</span>
          </div>
        )}
        {docBlocked && !showDocCheck && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-start gap-2">
            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{t("docCheck.exists.line1")}</span>
          </div>
        )}

        {/* Document Country selector — only for foreigners */}
        {isForeigner && (
          <div className="space-y-2 relative" ref={docCountryRef}>
            <Label htmlFor="documentCountry">{t("step1.documentCountry")}</Label>
            <div className="relative">
              {data.documentCountry ? (
                <>
                  <Input
                    id="documentCountry"
                    value={`${data.documentCountryFlag || ""} ${data.documentCountry}`}
                    readOnly
                    className="pr-8"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={clearDocCountry}
                    title={t("step3.country.clear")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <Input
                  id="documentCountry"
                  placeholder={t("step1.documentCountry.placeholder")}
                  value={docCountrySearch}
                  onChange={(e) => {
                    setDocCountrySearch(e.target.value);
                    setShowDocCountryList(true);
                  }}
                  onFocus={() => setShowDocCountryList(true)}
                />
              )}
            </div>
            {showDocCountryList && !data.documentCountry && (
              <div className="absolute z-50 w-full bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                {filteredDocCountries.length > 0 ? (
                  filteredDocCountries.map((c) => (
                    <button
                      key={c.iso2}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                      onClick={() => selectDocCountry(c.iso2)}
                    >
                      <span>{c.flag}</span>
                      <span>{getCountryName(c, language)}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {t("step1.documentCountry.notFound")}
                  </div>
                )}
              </div>
            )}
            {errors.documentCountry && <p className="text-sm text-destructive">{errors.documentCountry}</p>}
          </div>
        )}

        {isForeigner && !foreignerHintDismissed && (
          <div className="relative rounded-md border bg-amber-50 border-amber-200 px-3 py-2 pr-8 text-sm text-amber-700 flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{t("step1.foreignerHint")}</span>
            <button
              type="button"
              onClick={() => setForeignerHintDismissed(true)}
              className="absolute right-2 top-2 text-amber-400 hover:text-amber-600 transition-colors"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">{t("step1.fullName")}</Label>
        <Input
          id="fullName"
          placeholder={t("step1.fullName.placeholder")}
          value={data.fullName || ""}
          onChange={(e) => onChange("fullName", e.target.value)}
        />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
      </div>

      {/* Birth Date */}
      <div className="space-y-2">
        <Label htmlFor="birthDate">{t("step1.birthDate")}</Label>
        <Input
          id="birthDate"
          type="date"
          max={maxDate}
          value={data.birthDate || ""}
          onChange={(e) => onChange("birthDate", e.target.value)}
        />
        {errors.birthDate && (
          <p className="text-sm text-destructive flex items-start gap-1.5">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            {errors.birthDate}
          </p>
        )}
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label>{t("step1.gender")}</Label>
        <RadioGroup
          value={data.gender || ""}
          onValueChange={(value) => onChange("gender", value)}
          className="flex flex-wrap gap-4"
        >
          {genderOptions.map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <RadioGroupItem value={opt.value} id={`gender-${opt.value}`} />
              <Label htmlFor={`gender-${opt.value}`} className="font-normal cursor-pointer">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
      </div>
    </div>
  );
};

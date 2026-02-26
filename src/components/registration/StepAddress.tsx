import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { countries, getCountryByDialCode, getCountryName } from "@/data/countries";
import { X } from "lucide-react";
import { TimolLoader } from "@/components/ui/timol-loader";

interface Props {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export const StepAddress = ({ data, onChange, errors }: Props) => {
  const { t, language } = useLanguage();
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryList, setShowCountryList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-fill country from phone DDI
  useEffect(() => {
    if (data.countryDetected && !data.country) {
      const detected = countries.find((c) => c.iso2 === data.countryDetected);
      if (detected) {
        onChange("country", getCountryName(detected, language));
        onChange("countryIso2", detected.iso2);
      }
    }
  }, [data.countryDetected]);

  // Also try from phone field on mount
  useEffect(() => {
    if (data.phone && !data.country) {
      const c = getCountryByDialCode(data.phone);
      if (c) {
        onChange("country", getCountryName(c, language));
        onChange("countryIso2", c.iso2);
      }
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowCountryList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isBrazil = data.countryIso2 === "BR";

  const fetchCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setLoadingCep(true);
    setCepError("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const json: ViaCepResponse = await res.json();
      if (json.erro) {
        setCepError(t("step3.cep.notFound"));
      } else {
        if (json.logradouro) onChange("street", json.logradouro);
        if (json.bairro) onChange("neighborhood", json.bairro);
        if (json.localidade) onChange("city", json.localidade);
        if (json.uf) onChange("state", json.uf);
      }
    } catch {
      setCepError(t("step3.cep.error"));
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (val: string) => {
    const masked = val
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/(\d{5})(\d)/, "$1-$2");
    onChange("zipCode", masked);
    if (masked.replace(/\D/g, "").length === 8 && isBrazil) {
      fetchCep(masked);
    }
  };

  const filteredCountries = countries.filter((c) =>
    getCountryName(c, language).toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectCountry = (iso2: string) => {
    const c = countries.find((x) => x.iso2 === iso2);
    if (c) {
      onChange("country", getCountryName(c, language));
      onChange("countryIso2", iso2);
    }
    setShowCountryList(false);
    setCountrySearch("");
  };

  const clearCountry = () => {
    onChange("country", "");
    onChange("countryIso2", "");
    setCountrySearch("");
  };

  const addressFields = [
    { key: "street", prefix: "step3.street", maxLength: 200, colSpan: "sm:col-span-2" },
    { key: "number", prefix: "step3.number", maxLength: 10 },
    { key: "complement", prefix: "step3.complement", maxLength: 100 },
    { key: "neighborhood", prefix: "step3.neighborhood", maxLength: 100 },
    { key: "city", prefix: "step3.city", maxLength: 100 },
    { key: "state", prefix: "step3.state", maxLength: 100 },
  ];

  return (
    <div className="space-y-4">
      {/* Country — single field with inline search */}
      <div className="space-y-2 relative" ref={containerRef}>
        <Label htmlFor="country">{t("step3.country")}</Label>
        <div className="relative">
          {data.country ? (
            <>
              <Input
                id="country"
                value={data.country}
                readOnly
                className="pr-8"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={clearCountry}
                title={t("step3.country.clear")}
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Input
              id="country"
              placeholder={t("step3.country.placeholder")}
              value={countrySearch}
              onChange={(e) => {
                setCountrySearch(e.target.value);
                setShowCountryList(true);
              }}
              onFocus={() => setShowCountryList(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  // If there's exactly one match, select it
                  if (filteredCountries.length === 1) {
                    selectCountry(filteredCountries[0].iso2);
                  }
                }
              }}
            />
          )}
        </div>
        {/* Country dropdown */}
        {showCountryList && !data.country && (
          <div className="absolute z-50 w-full bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
            {filteredCountries.map((c) => (
              <button
                type="button"
                key={c.iso2}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                onClick={() => selectCountry(c.iso2)}
              >
                <span>{getCountryName(c, language)}</span>
              </button>
            ))}
          </div>
        )}
        {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
      </div>

      {/* CEP (Brazil) / Zip */}
      <div className="space-y-2">
        <Label htmlFor="zipCode">{t("step3.zipCode")}</Label>
        <div className="relative">
          <Input
            id="zipCode"
            placeholder={isBrazil ? "00000-000" : t("step3.zipCode.placeholder")}
            value={data.zipCode || ""}
            onChange={(e) => handleCepChange(e.target.value)}
            maxLength={9}
          />
          {loadingCep && (
            <TimolLoader size={16} className="absolute right-3 top-1/2 -translate-y-1/2" />
          )}
        </div>
        {cepError && <p className="text-sm text-destructive">{cepError}</p>}
        {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {addressFields.map((field) => (
          <div key={field.key} className={`space-y-2 ${field.colSpan ?? ""}`}>
            <Label htmlFor={field.key}>{t(field.prefix)}</Label>
            <Input
              id={field.key}
              placeholder={t(`${field.prefix}.placeholder`)}
              value={data[field.key] || ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              maxLength={field.maxLength}
            />
            {errors[field.key] && <p className="text-sm text-destructive">{errors[field.key]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
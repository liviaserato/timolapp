import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { countries, getCountryName } from "@/data/countries";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ResumeRegistrationPopup = ({ open, onClose }: Props) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const documentCountryRef = useRef<HTMLDivElement>(null);
  const defaultCountry = useMemo(() => countries.find((country) => country.iso2 === "BR") ?? countries[0], []);

  const [userId, setUserId] = useState("");
  const [document, setDocument] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [documentCountryIso2, setDocumentCountryIso2] = useState(defaultCountry.iso2);
  const [documentCountrySearch, setDocumentCountrySearch] = useState(getCountryName(defaultCountry, language));
  const [showDocumentCountryList, setShowDocumentCountryList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const selectedCountry = countries.find((country) => country.iso2 === documentCountryIso2) ?? defaultCountry;
    setDocumentCountrySearch(getCountryName(selectedCountry, language));
  }, [defaultCountry, documentCountryIso2, language]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (documentCountryRef.current && !documentCountryRef.current.contains(event.target as Node)) {
        setShowDocumentCountryList(false);
      }
    };

    window.document.addEventListener("mousedown", handleOutsideClick);
    return () => window.document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredCountries = useMemo(
    () => countries.filter((country) => getCountryName(country, language).toLowerCase().includes(documentCountrySearch.toLowerCase())),
    [documentCountrySearch, language],
  );

  const resetForm = () => {
    setUserId("");
    setDocument("");
    setBirthDate("");
    setDocumentCountryIso2(defaultCountry.iso2);
    setDocumentCountrySearch(getCountryName(defaultCountry, language));
    setShowDocumentCountryList(false);
    setError("");
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isBrazilDocument = documentCountryIso2 === "BR";
  // Format birth date input as DD/MM/YYYY
  const handleBirthDateChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length > 2) formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    if (digits.length > 4) formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    setBirthDate(formatted);
    setError("");
  };

  const handleDocumentCountryChange = (value: string) => {
    setDocumentCountrySearch(value);
    setDocumentCountryIso2("");
    setShowDocumentCountryList(true);
    setError("");
  };

  const handleSelectDocumentCountry = (iso2: string) => {
    const selectedCountry = countries.find((country) => country.iso2 === iso2);
    if (!selectedCountry) return;

    setDocumentCountryIso2(iso2);
    setDocumentCountrySearch(getCountryName(selectedCountry, language));
    setShowDocumentCountryList(false);
    setDocument("");
    setError("");
  };

  const resolveSelectedCountry = () => {
    if (documentCountryIso2) {
      return countries.find((country) => country.iso2 === documentCountryIso2) ?? defaultCountry;
    }

    return countries.find(
      (country) => getCountryName(country, language).toLowerCase() === documentCountrySearch.trim().toLowerCase(),
    ) ?? null;
  };

  // Format document as CPF mask if Brazil is selected
  const handleDocumentChange = (val: string) => {
    if (isBrazilDocument) {
      const stripped = val.replace(/[^\d]/g, "").slice(0, 11);
      let masked = stripped;
      if (stripped.length > 3) masked = stripped.slice(0, 3) + "." + stripped.slice(3);
      if (stripped.length > 6) masked = stripped.slice(0, 3) + "." + stripped.slice(3, 6) + "." + stripped.slice(6);
      if (stripped.length > 9) masked = stripped.slice(0, 3) + "." + stripped.slice(3, 6) + "." + stripped.slice(6, 9) + "-" + stripped.slice(9);
      setDocument(masked);
    } else {
      setDocument(val.slice(0, 50));
    }
    setError("");
  };

  const handleSubmit = async () => {
    const selectedCountry = resolveSelectedCountry();

    if (!userId.trim()) {
      setError(t("resume.error.idRequired"));
      return;
    }
    if (!selectedCountry) {
      setError(t("resume.error.documentCountryRequired"));
      return;
    }
    if (!document.trim()) {
      setError(t("resume.error.documentRequired"));
      return;
    }
    if (!birthDate || birthDate.length < 10) {
      setError(t("resume.error.birthDateRequired"));
      return;
    }

    const parts = birthDate.split("/");
    const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const rawDoc = document.replace(/[^\dA-Za-z]/g, "");

    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("resume-registration", {
        body: {
          franchise_id: userId.trim(),
          document: rawDoc,
          birth_date: isoDate,
          document_country_iso2: selectedCountry.iso2,
        },
      });

      if (fnError || !data?.success) {
        const errKey = data?.error;
        if (errKey === "already_completed") {
          setError(t("resume.error.alreadyCompleted"));
        } else if (errKey === "validation_failed") {
          setError(t("resume.error.validationFailed"));
        } else if (errKey === "not_found") {
          setError(t("resume.error.notFound"));
        } else {
          setError(data?.error || t("resume.error.notFound"));
        }
        setLoading(false);
        return;
      }

      sessionStorage.setItem(
        "continueData",
        JSON.stringify({
          ...data.data,
          documentCountry: getCountryName(selectedCountry, language),
          documentCountryIso2: selectedCountry.iso2,
          documentCountryFlag: selectedCountry.flag,
          foreignerNoCpf: selectedCountry.iso2 === "BR" ? "false" : "true",
        }),
      );
      handleClose();
      navigate("/?continue=1", { replace: true });
    } catch {
      setError(t("resume.error.generic"));
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center space-y-2">
          <img src={timolLogoDark} alt="Timol" className="h-8 mx-auto" />
          <DialogTitle className="text-base">{t("resume.title")}</DialogTitle>
          <DialogDescription className="text-xs text-center">
            {t("resume.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* User ID */}
          <div className="space-y-1.5">
            <Label htmlFor="resume-id" className="text-xs">{t("resume.userId")}</Label>
            <Input
              id="resume-id"
              placeholder={t("resume.userId.placeholder")}
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              maxLength={20}
              inputMode="numeric"
            />
          </div>

          <div className="space-y-1.5 relative" ref={documentCountryRef}>
            <Label htmlFor="resume-document-country" className="text-xs">{t("step1.documentCountry")}</Label>
            <Input
              id="resume-document-country"
              placeholder={t("step1.documentCountry.placeholder")}
              value={documentCountrySearch}
              onChange={(e) => handleDocumentCountryChange(e.target.value)}
              onFocus={() => setShowDocumentCountryList(true)}
              autoComplete="off"
            />
            {showDocumentCountryList && (
              <div className="absolute top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border bg-popover shadow-lg">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.iso2}
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted"
                      onClick={() => handleSelectDocumentCountry(country.iso2)}
                    >
                      <span>{country.flag}</span>
                      <span>{getCountryName(country, language)}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">{t("step1.documentCountry.notFound")}</div>
                )}
              </div>
            )}
          </div>

          {/* Document */}
          <div className="space-y-1.5">
            <Label htmlFor="resume-doc" className="text-xs">{t("resume.document")}</Label>
            <Input
              id="resume-doc"
              placeholder={isBrazilDocument ? t("resume.document.placeholder") : t("step1.document.foreigner.placeholder")}
              value={document}
              onChange={(e) => handleDocumentChange(e.target.value)}
              maxLength={isBrazilDocument ? 14 : 50}
            />
          </div>

          {/* Birth date */}
          <div className="space-y-1.5">
            <Label htmlFor="resume-birth" className="text-xs">{t("resume.birthDate")}</Label>
            <Input
              id="resume-birth"
              placeholder="DD/MM/AAAA"
              value={birthDate}
              onChange={(e) => handleBirthDateChange(e.target.value)}
              maxLength={10}
              inputMode="numeric"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            className="w-full gap-2 mt-1"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("resume.submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

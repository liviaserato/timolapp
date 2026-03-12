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
import { AlertCircle, ArrowLeft, CheckCircle2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { countries, getCountryName } from "@/data/countries";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";
import { FullScreenTimolLoader } from "@/components/ui/full-screen-timol-loader";

interface Props {
  open: boolean;
  onClose: () => void;
}

// CPF checksum validation
function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;
  for (let t = 9; t < 11; t++) {
    let d = 0;
    for (let c = 0; c < t; c++) d += parseInt(clean[c]) * (t + 1 - c);
    d = ((10 * d) % 11) % 10;
    if (parseInt(clean[t]) !== d) return false;
  }
  return true;
}

type PopupView = "form" | "not-found" | "already-active";

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
  const [view, setView] = useState<PopupView>("form");

  useEffect(() => {
    if (!documentCountryIso2) return;
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
    setView("form");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isBrazilDocument = documentCountryIso2 === "BR";

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

  const handleClearDocumentCountry = () => {
    setDocumentCountryIso2("");
    setDocumentCountrySearch("");
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

  // CPF inline validation
  const cpfDigits = document.replace(/\D/g, "");
  const cpfComplete = isBrazilDocument && cpfDigits.length === 11;
  const cpfInvalid = cpfComplete && !isValidCPF(cpfDigits);

  // Form completeness check
  const selectedCountry = resolveSelectedCountry();
  const isDocumentFilled = isBrazilDocument
    ? cpfDigits.length === 11 && !cpfInvalid
    : document.trim().length > 0;
  const isFormComplete =
    userId.trim().length > 0 &&
    !!selectedCountry &&
    isDocumentFilled &&
    birthDate.length === 10;

  const handleSubmit = async () => {
    if (loading || !isFormComplete) return;
    const country = resolveSelectedCountry();
    if (!country) return;

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
          document_country_iso2: country.iso2,
        },
      });

      if (fnError || !data?.success) {
        const errKey = data?.error;
        if (errKey === "already_completed") {
          setView("already-active");
        } else if (errKey === "not_found" || errKey === "validation_failed") {
          setView("not-found");
        } else {
          setError(data?.error || t("resume.error.generic"));
        }
        setLoading(false);
        return;
      }

      sessionStorage.setItem(
        "continueData",
        JSON.stringify({
          ...data.data,
          documentCountry: getCountryName(country, language),
          documentCountryIso2: country.iso2,
          documentCountryFlag: country.flag,
          foreignerNoCpf: country.iso2 === "BR" ? "false" : "true",
        }),
      );
      handleClose();
      navigate("/?continue=1", { replace: true });
    } catch {
      setError(t("resume.error.generic"));
      setLoading(false);
    }
  };

  // ── Not Found view ──
  if (view === "not-found") {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="relative items-center space-y-2">
            <button
              type="button"
              onClick={() => setView("form")}
              className="absolute left-0 top-1 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <img src={timolLogoDark} alt="Timol" className="h-8 mx-auto" />
            <DialogTitle className="text-base">{t("resume.notFound.title")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2 px-1">
            <p className="text-sm text-muted-foreground">
              {t("resume.notFound.line1")}
            </p>
            <p className="text-sm font-medium">
              {t("resume.notFound.line2")}
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
              <li>{t("resume.notFound.check1")}</li>
              <li>{t("resume.notFound.check2")}</li>
              <li>{t("resume.notFound.check3")}</li>
            </ul>
            <p className="text-xs text-muted-foreground italic">
              {t("resume.notFound.line3")}
            </p>

            <Button className="w-full mt-2" onClick={() => setView("form")}>
              {t("resume.notFound.back")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Already Active view ──
  if (view === "already-active") {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="relative items-center space-y-2">
            <button
              type="button"
              onClick={() => setView("form")}
              className="absolute left-0 top-1 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <img src={timolLogoDark} alt="Timol" className="h-8 mx-auto" />
            <DialogTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {t("resume.alreadyActive.title")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2 px-1">
            <p className="text-sm text-muted-foreground">
              {t("resume.alreadyActive.line1")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("resume.alreadyActive.line2")}
            </p>

            <Button className="w-full mt-2" onClick={handleClose}>
              {t("resume.alreadyActive.goLogin")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Form view ──
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

        <form className="space-y-3 mt-2" onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}>
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
            <div className="relative">
              <Input
                id="resume-document-country"
                placeholder={t("step1.documentCountry.placeholder")}
                value={documentCountrySearch}
                onChange={(e) => handleDocumentCountryChange(e.target.value)}
                onFocus={() => setShowDocumentCountryList(true)}
                autoComplete="off"
                className={documentCountrySearch ? "pr-10" : undefined}
              />
              {documentCountrySearch && (
                <button
                  type="button"
                  onClick={handleClearDocumentCountry}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Limpar país emissor"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
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
            {cpfInvalid && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {t("resume.error.cpfInvalid")}
              </p>
            )}
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
            type="submit"
            className="w-full gap-2 mt-1"
            disabled={loading || !isFormComplete}
          >
            {t("resume.submit")}
          </Button>

          {loading && (
            <FullScreenTimolLoader
              title="Buscando seu cadastro..."
              hint="Aguarde enquanto retomamos a próxima etapa."
            />
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

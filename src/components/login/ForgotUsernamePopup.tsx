import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { countries } from "@/data/countries";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

type Step = "form" | "found";

// Mock test data
const MOCK_EMAIL = "liviaserato@yahoo.com.br";
const MOCK_BIRTH = "07/03/1986";
const MOCK_USERNAME = "liviaserato";
const MOCK_NAME = "Lívia Serato";

interface Props {
  open: boolean;
  onClose: () => void;
  onSwitchToPassword?: () => void;
}

export const ForgotUsernamePopup = ({ open, onClose }: Props) => {
  const { t, language } = useLanguage();

  const [step, setStep] = useState<Step>("form");
  const [method, setMethod] = useState<"email" | "document">("email");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [country, setCountry] = useState("BR");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Found user data
  const [foundUsername, setFoundUsername] = useState("");
  const [foundName, setFoundName] = useState("");
  const [copied, setCopied] = useState(false);

  const isBrazilian = country === "BR";

  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) => {
      const nameA = language === "en" ? a.nameEn : language === "es" ? a.nameEs : a.name;
      const nameB = language === "en" ? b.nameEn : language === "es" ? b.nameEs : b.name;
      return nameA.localeCompare(nameB);
    });
  }, [language]);

  const getCountryName = (c: typeof countries[0]) => {
    return language === "en" ? c.nameEn : language === "es" ? c.nameEs : c.name;
  };

  // Extract first name from full name
  const firstName = foundName ? foundName.split(" ")[0] : "";

  const resetAll = () => {
    setStep("form");
    setMethod("email");
    setEmail("");
    setDocument("");
    setCountry("BR");
    setBirthDate("");
    setFieldErrors({});
    setLoading(false);
    setFoundUsername("");
    setFoundName("");
    setCopied(false);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  // Format birth date
  const handleBirthDateChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length > 2) formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    if (digits.length > 4)
      formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    setBirthDate(formatted);
    setFieldErrors((prev) => ({ ...prev, birthDate: "" }));
  };

  // CPF mask
  const handleDocumentChange = (val: string) => {
    const stripped = val.replace(/[^\d]/g, "");
    if (isBrazilian && stripped.length <= 11) {
      let masked = stripped;
      if (stripped.length > 3) masked = stripped.slice(0, 3) + "." + stripped.slice(3);
      if (stripped.length > 6)
        masked = stripped.slice(0, 3) + "." + stripped.slice(3, 6) + "." + stripped.slice(6);
      if (stripped.length > 9)
        masked =
          stripped.slice(0, 3) +
          "." +
          stripped.slice(3, 6) +
          "." +
          stripped.slice(6, 9) +
          "-" +
          stripped.slice(9);
      setDocument(masked);
    } else {
      setDocument(val.slice(0, 20));
    }
    setFieldErrors((prev) => ({ ...prev, document: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (method === "email" && !email.trim()) {
      errs.email = t("forgotUser.error.emailRequired");
    }
    if (method === "document" && !document.trim()) {
      errs.document = t("forgotUser.error.documentRequired");
    }
    if (!birthDate || birthDate.length < 10) {
      errs.birthDate = t("forgotUser.error.birthRequired");
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setFieldErrors({});

    // Mock: check test data
    setTimeout(() => {
      setLoading(false);

      // Normalize birth date for comparison (handle 2-digit year)
      const normalizedBirth = birthDate.length === 10 ? birthDate : "";
      const birthMatches =
        normalizedBirth === MOCK_BIRTH ||
        normalizedBirth === "07/03/86" ||
        normalizedBirth === "07/03/1986";

      if (method === "email" && email.trim().toLowerCase() === MOCK_EMAIL && birthMatches) {
        setFoundUsername(MOCK_USERNAME);
        setFoundName(MOCK_NAME);
        setStep("found");
      } else {
        setFieldErrors({ general: t("forgotUser.error.notFound") });
      }
    }, 800);
  };

  const handleCopyUsername = async () => {
    if (!foundUsername) return;

    try {
      await navigator.clipboard.writeText(foundUsername);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm mx-auto rounded-xl">
        <DialogHeader className="items-center space-y-2">
          <img src={timolLogoDark} alt="Timol" className="h-8 mx-auto" />
          <DialogTitle className="text-lg font-bold text-primary">
            {step === "form" ? t("forgotUser.title") : t("forgotUser.foundTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-center">
            {step === "form"
              ? t("forgotUser.description")
              : t("forgotUser.foundDescPersonal").replace("{name}", firstName)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {step === "form" && (
            <div onKeyDown={handleFormKeyDown}>
              {/* Method selector */}
              <div className="space-y-1.5 mb-3">
                <Label className="text-xs">{t("forgotUser.method")}</Label>
                <Select
                  value={method}
                  onValueChange={(v) => {
                    setMethod(v as "email" | "document");
                    setFieldErrors({});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">{t("forgotUser.method.email")}</SelectItem>
                    <SelectItem value="document">{t("forgotUser.method.document")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email field */}
              {method === "email" && (
                <div className="space-y-1.5 mb-3">
                  <Label className="text-xs">{t("forgotUser.email")}</Label>
                  <Input
                    type="email"
                    placeholder={t("forgotUser.email.placeholder")}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: "", general: "" }));
                    }}
                    autoCapitalize="none"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">{fieldErrors.email}</p>
                  )}
                </div>
              )}

              {/* Document fields */}
              {method === "document" && (
                <>
                  {/* Country selector */}
                  <div className="space-y-1.5 mb-3">
                    <Label className="text-xs">{t("forgotUser.country")}</Label>
                    <Select value={country} onValueChange={(v) => { setCountry(v); setDocument(""); setFieldErrors({}); }}>
                      <SelectTrigger>
                        <SelectValue>
                          {(() => {
                            const c = countries.find((c) => c.iso2 === country);
                            return c ? `${c.flag} ${getCountryName(c)}` : "";
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {sortedCountries.map((c) => (
                          <SelectItem key={c.iso2} value={c.iso2}>
                            {c.flag} {getCountryName(c)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <Label className="text-xs">
                      {isBrazilian ? "CPF" : t("forgotUser.document")}
                    </Label>
                    <Input
                      placeholder={isBrazilian ? "000.000.000-00" : t("forgotUser.document.placeholder")}
                      value={document}
                      onChange={(e) => handleDocumentChange(e.target.value)}
                      maxLength={isBrazilian ? 14 : 20}
                      inputMode="numeric"
                    />
                    {fieldErrors.document && (
                      <p className="text-xs text-destructive">{fieldErrors.document}</p>
                    )}
                  </div>
                </>
              )}

              {/* Birth date */}
              <div className="space-y-1.5 mb-3">
                <Label className="text-xs">{t("forgotUser.birthDate")}</Label>
                <Input
                  placeholder="DD/MM/AAAA"
                  value={birthDate}
                  onChange={(e) => handleBirthDateChange(e.target.value)}
                  maxLength={10}
                  inputMode="numeric"
                />
                {fieldErrors.birthDate && (
                  <p className="text-xs text-destructive">{fieldErrors.birthDate}</p>
                )}
              </div>

              {fieldErrors.general && (
                <div className="flex items-center gap-2 text-xs text-destructive mb-3">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{fieldErrors.general}</span>
                </div>
              )}

              <Button className="w-full gap-2" onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("forgotUser.search")}
              </Button>

            </div>
          )}

          {step === "found" && (
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-full rounded-lg bg-muted px-4 py-4 text-center">
                  <p className="mb-1 text-xs text-muted-foreground">{t("forgotUser.yourUsername")}</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-lg font-bold text-primary">{foundUsername}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-primary hover:text-primary"
                      onClick={() => void handleCopyUsername()}
                      aria-label="Copiar usuário"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <p className={`text-center text-xs ${copied ? "text-success" : "text-muted-foreground"}`}>
                {copied ? "Usuário copiado. Agora é só fechar e fazer login." : "Copie seu usuário e feche este popup para entrar na tela de login."}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

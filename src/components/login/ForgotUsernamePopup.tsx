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
  Eye,
  EyeOff,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { countries } from "@/data/countries";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

type Step = "form" | "found";

interface Props {
  open: boolean;
  onClose: () => void;
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
  const [error, setError] = useState("");

  // Found user data
  const [foundUsername, setFoundUsername] = useState("");
  const [foundName, setFoundName] = useState("");
  const [foundUserId, setFoundUserId] = useState("");

  // Quick login
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

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

  const resetAll = () => {
    setStep("form");
    setMethod("email");
    setEmail("");
    setDocument("");
    setCountry("BR");
    setBirthDate("");
    setError("");
    setLoading(false);
    setFoundUsername("");
    setFoundName("");
    setFoundUserId("");
    setPassword("");
    setShowPassword(false);
    setLoginLoading(false);
    setLoginError("");
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
    setError("");
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
    setError("");
  };

  const handleSubmit = async () => {
    if (!birthDate || birthDate.length < 10) {
      setError(t("forgotUser.error.birthRequired"));
      return;
    }
    if (method === "email" && !email.trim()) {
      setError(t("forgotUser.error.emailRequired"));
      return;
    }
    if (method === "document" && !document.trim()) {
      setError(t("forgotUser.error.documentRequired"));
      return;
    }

    const parts = birthDate.split("/");
    const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const rawDoc = document.replace(/[^\dA-Za-z]/g, "");

    setLoading(true);
    setError("");

    try {
      const body: Record<string, string> = {
        method,
        birth_date: isoDate,
      };
      if (method === "email") {
        body.email = email.trim();
      } else {
        body.document = rawDoc;
        body.country = country;
      }

      const { data, error: fnError } = await supabase.functions.invoke("forgot-username", {
        body,
      });

      if (fnError || !data?.success) {
        setError(t("forgotUser.error.notFound"));
        setLoading(false);
        return;
      }

      setFoundUsername(data.username);
      setFoundName(data.full_name || "");
      setFoundUserId(data.user_id);
      setStep("found");
    } catch {
      setError(t("forgotUser.error.generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    if (!password) {
      setLoginError(t("validation.required"));
      return;
    }
    setLoginLoading(true);
    setLoginError("");
    try {
      // Try login with email from profile
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: foundUsername, // Will need the actual email; for now use username
        password,
      });
      if (authError) {
        setLoginError(t("login.error.invalid"));
      } else {
        handleClose();
        // Auth state listener will handle navigation
      }
    } catch {
      setLoginError(t("login.error.invalid"));
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center space-y-2">
          <img src={timolLogoDark} alt="Timol" className="h-8 mx-auto" />
          <DialogTitle className="text-base">{t("forgotUser.title")}</DialogTitle>
          <DialogDescription className="text-xs text-center">
            {step === "form" ? t("forgotUser.description") : t("forgotUser.foundDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {step === "form" && (
            <>
              {/* Method selector */}
              <div className="space-y-1.5">
                <Label className="text-xs">{t("forgotUser.method")}</Label>
                <Select
                  value={method}
                  onValueChange={(v) => {
                    setMethod(v as "email" | "document");
                    setError("");
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
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("forgotUser.email")}</Label>
                  <Input
                    type="email"
                    placeholder={t("forgotUser.email.placeholder")}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    autoCapitalize="none"
                  />
                </div>
              )}

              {/* Document fields */}
              {method === "document" && (
                <>
                  {/* Country selector */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("forgotUser.country")}</Label>
                    <Select value={country} onValueChange={(v) => { setCountry(v); setDocument(""); setError(""); }}>
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

                  <div className="space-y-1.5">
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
                  </div>
                </>
              )}

              {/* Birth date */}
              <div className="space-y-1.5">
                <Label className="text-xs">{t("forgotUser.birthDate")}</Label>
                <Input
                  placeholder="DD/MM/AAAA"
                  value={birthDate}
                  onChange={(e) => handleBirthDateChange(e.target.value)}
                  maxLength={10}
                  inputMode="numeric"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button className="w-full gap-2" onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("forgotUser.search")}
              </Button>
            </>
          )}

          {/* Found result */}
          {step === "found" && (
            <>
              <div className="flex flex-col items-center gap-2 py-2">
                <CheckCircle2 className="h-8 w-8 text-success" />
                {foundName && (
                  <p className="text-sm text-muted-foreground">{foundName}</p>
                )}
                <div className="bg-muted rounded-lg px-6 py-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("forgotUser.yourUsername")}</p>
                  <p className="text-lg font-bold text-primary">{foundUsername}</p>
                </div>
              </div>

              {/* Quick login */}
              <div className="space-y-1.5">
                <Label className="text-xs">{t("login.password")}</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("login.password.placeholder")}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLoginError("");
                    }}
                    className="pr-9"
                    autoCapitalize="none"
                    autoCorrect="off"
                    onKeyDown={(e) => e.key === "Enter" && handleQuickLogin()}
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <Button className="w-full gap-2" onClick={handleQuickLogin} disabled={loginLoading}>
                {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                {t("login.enter")}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

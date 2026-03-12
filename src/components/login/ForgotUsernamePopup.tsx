import { useState, useRef, useEffect } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Loader2,
  AlertCircle,
  Copy,
  Check,
  CalendarIcon,
  X,
} from "lucide-react";
import { countries, getCountryName } from "@/data/countries";
import { forgotUsername, ApiRequestError } from "@/lib/api";
import { format, parse } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

type Step = "form" | "found";

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
  const [countryIso2, setCountryIso2] = useState("BR");
  const [countryLabel, setCountryLabel] = useState(() => {
    const br = countries.find((c) => c.iso2 === "BR");
    return br ? getCountryName(br, "pt") : "";
  });
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryList, setShowCountryList] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Found user data
  const [foundUsername, setFoundUsername] = useState("");
  const [foundName, setFoundName] = useState("");
  const [copied, setCopied] = useState(false);

  const isBrazilian = countryIso2 === "BR";

  const calendarLocale = language === "en" ? enUS : language === "es" ? es : ptBR;

  // Close country dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setShowCountryList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Update country label when language changes
  useEffect(() => {
    if (countryIso2) {
      const c = countries.find((x) => x.iso2 === countryIso2);
      if (c) setCountryLabel(getCountryName(c, language));
    }
  }, [language, countryIso2]);

  const filteredCountries = countries.filter((c) =>
    getCountryName(c, language).toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectCountry = (iso2: string) => {
    const c = countries.find((x) => x.iso2 === iso2);
    if (c) {
      setCountryIso2(iso2);
      setCountryLabel(getCountryName(c, language));
      setDocument(""); // clear document on country change
    }
    setShowCountryList(false);
    setCountrySearch("");
    setFieldErrors({});
  };

  const clearCountry = () => {
    setCountryIso2("");
    setCountryLabel("");
    setCountrySearch("");
    setDocument("");
  };

  // Extract first name from full name
  const firstName = foundName ? foundName.split(" ")[0] : "";

  // Max date = 18 years ago
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  const resetAll = () => {
    setStep("form");
    setMethod("email");
    setEmail("");
    setDocument("");
    const br = countries.find((c) => c.iso2 === "BR");
    setCountryIso2("BR");
    setCountryLabel(br ? getCountryName(br, language) : "");
    setCountrySearch("");
    setShowCountryList(false);
    setBirthDate(undefined);
    setCalendarOpen(false);
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
    if (method === "document") {
      if (!countryIso2) errs.country = t("forgotUser.error.countryRequired");
      if (!document.trim()) errs.document = t("forgotUser.error.documentRequired");
    }
    if (!birthDate) {
      errs.birthDate = t("forgotUser.error.birthRequired");
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setFieldErrors({});

    try {
      const isoBirthDate = birthDate ? format(birthDate, "yyyy-MM-dd") : "";

      const req = method === "email"
        ? { method: "email" as const, email: email.trim().toLowerCase(), birthDate: isoBirthDate }
        : { method: "document" as const, document: document.trim(), documentCountryCode: countryIso2, birthDate: isoBirthDate };

      const data = await forgotUsername(req);

      setFoundUsername(data.username);
      setFoundName(data.fullName || "");
      setStep("found");
    } catch (err) {
      if (err instanceof ApiRequestError && (err.code === "not_found" || err.status === 404)) {
        setFieldErrors({ general: t("forgotUser.error.notFound") });
      } else {
        setFieldErrors({ general: t("forgotUser.error.notFound") });
      }
    } finally {
      setLoading(false);
    }
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
                  {/* Country selector with search */}
                  <div className="space-y-1.5 mb-3 relative" ref={countryRef}>
                    <Label className="text-xs">{t("forgotUser.country")}</Label>
                    <div className="relative">
                      {countryLabel ? (
                        <>
                          <Input
                            value={`${countries.find((c) => c.iso2 === countryIso2)?.flag || ""} ${countryLabel}`}
                            readOnly
                            className="pr-8"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={clearCountry}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <Input
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
                              e.stopPropagation();
                              if (filteredCountries.length === 1) {
                                selectCountry(filteredCountries[0].iso2);
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                    {showCountryList && !countryLabel && (
                      <div className="absolute z-50 w-full bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((c) => (
                            <button
                              key={c.iso2}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                              onClick={() => selectCountry(c.iso2)}
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
                    {fieldErrors.country && (
                      <p className="text-xs text-destructive">{fieldErrors.country}</p>
                    )}
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

              {/* Birth date with calendar */}
              <div className="space-y-1.5 mb-3">
                <Label className="text-xs">{t("forgotUser.birthDate")}</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate
                        ? format(birthDate, "dd/MM/yyyy")
                        : "DD/MM/AAAA"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={(date) => {
                        setBirthDate(date);
                        setCalendarOpen(false);
                        setFieldErrors((prev) => ({ ...prev, birthDate: "" }));
                      }}
                      disabled={(date) => date > maxDate || date < new Date("1900-01-01")}
                      defaultMonth={birthDate || maxDate}
                      locale={calendarLocale}
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={maxDate.getFullYear()}
                      className={cn("p-3 pointer-events-auto")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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

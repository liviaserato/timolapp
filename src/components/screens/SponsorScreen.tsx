import { useState, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WizardData } from "@/types/wizard";
import { Search, Users, Phone, X, ChevronRight, ThumbsUp, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import timolLogoAzul from "@/assets/logo-timol-azul-escuro.svg";
import whatsappIcon from "@/assets/icon-logo-whatsapp.svg";
import { countries } from "@/data/countries";
import { openWhatsAppLink } from "@/lib/whatsapp";

// Language to Google Places language map
const LANG_MAP: Record<string, string> = { pt: "pt-BR", en: "en", es: "es" };

interface Props {
  onNext: (data: Partial<WizardData>) => void;
}

type NoSponsorStep = "contact-form" | "how-continue" | "contact-success";

interface SponsorApiResult {
  name: string;
  city: string;
  state: string;
  photo: string;
}

export const SponsorScreen = ({ onNext }: Props) => {
  const { t, language } = useLanguage();
  const [sponsorId, setSponsorId] = useState("");
  const [foundSponsor, setFoundSponsor] = useState<{ id: string; name: string; city: string; state: string; countryFlag: string; photo: string } | null>(null);
  const [showNoSponsorBox, setShowNoSponsorBox] = useState(false);
  const [noSponsorStep, setNoSponsorStep] = useState<NoSponsorStep>("contact-form");
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  const [fromNoSponsorFlow, setFromNoSponsorFlow] = useState(false);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [sponsorSelected, setSponsorSelected] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Separate loading state for the "indicate a franchisee" flow
  const [indicationLoading, setIndicationLoading] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactCityState, setContactCityState] = useState("");
  const [contactBestTime, setContactBestTime] = useState("");
  const [contactHowKnew, setContactHowKnew] = useState("");
  const [contactOther, setContactOther] = useState("");
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  // Autocomplete state for location
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  // No longer used: showContactTimolSuccess removed
  // Reset search when language changes
  useEffect(() => {
    setSponsorId("");
    setFoundSponsor(null);
    setShowConfirmBox(false);
    setError("");
    setNotFound(false);
  }, [language]);

  // Close location dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = useCallback(async () => {
    const trimmed = sponsorId.trim();
    if (!trimmed) {
      setError(t("sponsor.error.empty"));
      return;
    }
    if (!/^\d+$/.test(trimmed)) {
      setError(t("sponsor.error.numericOnly"));
      setNotFound(true);
      return;
    }
    setSearching(true);
    setError("");
    setNotFound(false);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sponsor-lookup?id=${trimmed}`,
        { headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      if (!res.ok) {
        setError(t("sponsor.error.notFound"));
        setNotFound(true);
        return;
      }
      const json = await res.json();
      const record = Array.isArray(json) ? json[0] : json;
      if (!record || !record.nome) {
        setError(t("sponsor.error.notFound"));
        setNotFound(true);
        return;
      }
      const name = record.nome || "";
      const cidadeParts = (record.cidade || "").split(" - ");
      const city = cidadeParts[0]?.trim() || "";
      const state = cidadeParts[1]?.trim() || record.estado || "";
      const photo = record.foto || record.photo || "";
      const countryIso = record.pais_cod_iso || "";
      const countryDataResult = countries.find(c => c.iso2 === countryIso);
      const countryFlag = countryDataResult?.flag || "";

      setFoundSponsor({ id: trimmed, name, city, state, countryFlag, photo });
      setSponsorSelected(false);
      setFromNoSponsorFlow(false);
      setShowConfirmBox(true);
      setNotFound(false);
    } catch {
      setError(t("sponsor.error.notFound"));
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  }, [sponsorId, t]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleConfirmSponsor = () => {
    if (!foundSponsor) return;
    onNext({
      sponsorId: foundSponsor.id,
      sponsorName: foundSponsor.name,
      sponsorCity: foundSponsor.city,
      sponsorState: foundSponsor.state,
      sponsorCountryFlag: foundSponsor.countryFlag,
    });
  };

  // Dedicated fetch for the "indicate a franchisee" flow — completely isolated from main ID search
  const fetchSponsorForIndication = async (id: string) => {
    setIndicationLoading(true);
    try {
      // TODO: Replace with dedicated indication endpoint when available
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sponsor-lookup?id=${id}`,
        { headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      if (!res.ok) return;
      const json = await res.json();
      const record = Array.isArray(json) ? json[0] : json;
      if (!record || !record.nome) return;
      const name = record.nome || "";
      const cidadeParts = (record.cidade || "").split(" - ");
      const city = cidadeParts[0]?.trim() || "";
      const state = cidadeParts[1]?.trim() || record.estado || "";
      const photo = record.foto || record.photo || "";
      const countryIso = record.pais_cod_iso || "";
      const countryDataResult = countries.find(c => c.iso2 === countryIso);
      const countryFlag = countryDataResult?.flag || "";

      setFoundSponsor({ id, name, city, state, countryFlag, photo });
      setSponsorSelected(false);
      setShowConfirmBox(true);
    } catch {
      // Silently fail — don't touch main search state
    } finally {
      setIndicationLoading(false);
    }
  };

  const handleRandomSponsor = async () => {
    setShowNoSponsorBox(false);
    setFromNoSponsorFlow(true);
    await fetchSponsorForIndication("31");
  };

  const handleSuggestAnother = async () => {
    if (!foundSponsor) return;
    setSponsorSelected(false);
    const nextId = foundSponsor.id === "31" ? "27" : "31";
    await fetchSponsorForIndication(nextId);
  };

  const clearSearch = () => {
    setSponsorId("");
    setFoundSponsor(null);
    setShowConfirmBox(false);
    setSponsorSelected(false);
    setError("");
    setNotFound(false);
  };

  const resetAll = () => {
    clearSearch();
    setShowNoSponsorBox(false);
    setNoSponsorStep("contact-form");
    setFromNoSponsorFlow(false);
    setContactName("");
    setContactPhone("");
    setContactCityState("");
    setContactBestTime("");
    setContactHowKnew("");
    setContactOther("");
    setContactErrors({});
  };

  const handleContactSubmit = () => {
    const errors: Record<string, string> = {};
    if (!contactName.trim()) errors.name = t("validation.required");
    if (!contactPhone.trim()) errors.phone = t("validation.required");
    else if (contactPhone.replace(/\D/g, "").length < 7) errors.phone = t("validation.phoneMin");
    if (!contactCityState.trim()) errors.cityState = t("validation.required");
    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      return;
    }
    setContactErrors({});
    setNoSponsorStep("how-continue");
  };

  // handleContactTimol removed — replaced by WhatsApp button

  const openNoSponsor = () => {
    clearSearch();
    setNoSponsorStep("contact-form");
    setContactErrors({});
    setShowNoSponsorBox(true);
  };

  const locationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLocationInput = (value: string) => {
    setContactCityState(value);
    setContactErrors((p) => ({ ...p, cityState: "" }));
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    if (value.length >= 2) {
      locationDebounceRef.current = setTimeout(async () => {
        try {
          const lang = LANG_MAP[language] || "pt-BR";
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/places-autocomplete?input=${encodeURIComponent(value)}&language=${lang}`,
            { headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
          );
          const data = await res.json();
          const suggestions = (data.predictions || []).map((p: any) => p.description);
          setLocationSuggestions(suggestions);
          setShowLocationDropdown(suggestions.length > 0);
        } catch {
          setShowLocationDropdown(false);
        }
      }, 300);
    } else {
      setShowLocationDropdown(false);
    }
  };

  const selectLocation = (value: string) => {
    setContactCityState(value);
    setShowLocationDropdown(false);
    setContactErrors((p) => ({ ...p, cityState: "" }));
  };

  // Open WhatsApp from confirm screen (Popup 2)
  const openWhatsAppFromConfirm = () => {
    openWhatsAppLink(`Olá, meu nome é ${contactName || "—"}. Quero escolher um patrocinador e preciso de ajuda.`);
  };
  const howKnewOptions = [
    { value: "live", label: t("sponsor.noSponsorBox.contactHowKnew.live") },
    { value: "showroom", label: t("sponsor.noSponsorBox.contactHowKnew.showroom") },
    { value: "friend", label: t("sponsor.noSponsorBox.contactHowKnew.friend") },
    { value: "other", label: t("sponsor.noSponsorBox.contactHowKnew.other") },
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      {/* Logo + Title + Text + Language — OUTSIDE the card */}
      <div className="text-center space-y-3">
        <img src={timolLogoAzul} alt="Timol" className="h-auto w-44 mx-auto" />
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">{t("sponsor.title")}</h1>
        <div className="text-muted-foreground text-sm sm:text-base leading-relaxed space-y-1">
          <p>{t("sponsor.subtitle.line1")}</p>
          <p>{t("sponsor.subtitle.line2")}</p>
        </div>
        <LanguageSelector />
      </div>

      {/* Sponsor ID block — INSIDE the card */}
      <Card className="shadow-lg">
        <CardContent className="pt-6 space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold">{t("sponsor.card.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("sponsor.card.description")}</p>
          </div>
          <div className="max-w-xs mx-auto">
            <div className="relative">
              <Input
                placeholder={t("sponsor.id.placeholder")}
                value={sponsorId}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setSponsorId(val);
                  setError("");
                  setNotFound(false);
                }}
                onKeyDown={handleKeyDown}
                onBlur={() => { if (sponsorId.trim() && !showConfirmBox && !foundSponsor) handleSearch(); }}
                className="pr-10"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {notFound ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-destructive hover:text-destructive/80 hover:bg-destructive/10 transition-colors"
                  aria-label="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                  aria-label="Search"
                >
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </button>
              )}
            </div>
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>

          <div className="text-center">
            <button
              className="text-sm text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
              onClick={openNoSponsor}
            >
              {t("sponsor.noSponsor")}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* No Sponsor Modal */}
      {showNoSponsorBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {noSponsorStep === "how-continue"
                    ? t("sponsor.noSponsorBox.howTitle")
                    : noSponsorStep === "contact-success"
                    ? ""
                    : t("sponsor.noSponsorBox.title")}
                </CardTitle>
                <button onClick={() => setShowNoSponsorBox(false)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              {noSponsorStep === "contact-form" && (
                <CardDescription className="text-xs">{t("sponsor.noSponsorBox.description")}</CardDescription>
              )}
              {noSponsorStep === "how-continue" && (
                <CardDescription className="text-xs">{t("sponsor.noSponsorBox.howDescription")}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {noSponsorStep === "contact-form" && (
                <>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t("sponsor.noSponsorBox.contactFullName")} *</Label>
                      <Input value={contactName} onChange={(e) => { setContactName(e.target.value); setContactErrors((p) => ({ ...p, name: "" })); }} className="h-8 text-sm" />
                      {contactErrors.name && <p className="text-xs text-destructive">{contactErrors.name}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t("sponsor.noSponsorBox.contactPhone")} *</Label>
                      <Input
                        placeholder={t("sponsor.noSponsorBox.contactPhone.placeholder")}
                        value={contactPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d+\s()-]/g, "");
                          setContactPhone(val);
                          setContactErrors((p) => ({ ...p, phone: "" }));
                        }}
                        inputMode="tel"
                        className="h-8 text-sm"
                        maxLength={20}
                      />
                      {contactErrors.phone && <p className="text-xs text-destructive">{contactErrors.phone}</p>}
                    </div>
                    <div className="space-y-1" ref={locationRef}>
                      <Label className="text-xs">{t("sponsor.noSponsorBox.contactLocation")} *</Label>
                      <div className="relative">
                        <Input
                          placeholder={t("sponsor.noSponsorBox.contactLocation.placeholder")}
                          value={contactCityState}
                          onChange={(e) => handleLocationInput(e.target.value)}
                          onFocus={() => {
                            if (contactCityState.length >= 2 && locationSuggestions.length > 0) {
                              setShowLocationDropdown(true);
                            }
                          }}
                          className="h-8 text-sm"
                        />
                        {showLocationDropdown && locationSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
                            {locationSuggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                                onClick={() => selectLocation(suggestion)}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {contactErrors.cityState && <p className="text-xs text-destructive">{contactErrors.cityState}</p>}
                      <p className="text-xs text-muted-foreground">{t("sponsor.noSponsorBox.contactLocation.hint")}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t("sponsor.noSponsorBox.contactBestTime")}</Label>
                      <Input
                        placeholder={t("sponsor.noSponsorBox.contactBestTime.placeholder")}
                        value={contactBestTime}
                        onChange={(e) => setContactBestTime(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t("sponsor.noSponsorBox.contactHowKnew")}</Label>
                      <Select value={contactHowKnew} onValueChange={setContactHowKnew}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {howKnewOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {contactHowKnew === "other" && (
                      <div className="space-y-1">
                        <Input
                          placeholder={t("sponsor.noSponsorBox.contactHowKnew.other.placeholder")}
                          value={contactOther}
                          onChange={(e) => setContactOther(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    )}
                  </div>
                  <Button size="sm" className="w-full" onClick={handleContactSubmit}>
                    {t("sponsor.noSponsorBox.contactSend")}
                  </Button>
                </>
              )}

              {noSponsorStep === "how-continue" && (
                <>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={handleRandomSponsor}>
                    <Users className="h-4 w-4" />
                    {t("sponsor.noSponsorBox.random")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      openWhatsAppLink(`Olá, meu nome é ${contactName || "—"}. Quero escolher um patrocinador e preciso de ajuda.`);
                    }}
                  >
                    <img src={whatsappIcon} alt="WhatsApp" className="h-5 w-5" />
                    {t("sponsor.noSponsorBox.whatsapp")}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirm Sponsor Modal */}
      {showConfirmBox && foundSponsor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t("sponsor.confirm.title")}</CardTitle>
                <button onClick={() => { setShowConfirmBox(false); clearSearch(); }}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("sponsor.confirm.instruction")}</p>
            </CardHeader>
            <CardContent className="space-y-4">
               <div
                 className={`flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                   sponsorSelected
                     ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                     : "border-muted bg-muted/40 hover:border-muted-foreground/30"
                 }`}
                 onClick={() => setSponsorSelected(true)}
               >
                <Avatar className="h-14 w-14 flex-shrink-0">
                  {foundSponsor.photo ? (
                    <AvatarImage src={foundSponsor.photo} alt={foundSponsor.name} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {foundSponsor.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                 <div className="min-w-0">
                   <p className="font-semibold text-sm truncate">{foundSponsor.name}</p>
                   <p className="text-xs text-muted-foreground">ID: {foundSponsor.id}</p>
                   <p className="text-xs text-muted-foreground">
                     {foundSponsor.city}{foundSponsor.state ? `, ${foundSponsor.state}` : ""}
                     {foundSponsor.countryFlag ? ` ${foundSponsor.countryFlag}` : ""}
                   </p>
                 </div>
              </div>

              {sponsorSelected && (
                <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                  <p>⚠️ {t("sponsor.confirm.warning.combined")}</p>
                </div>
              )}

              {fromNoSponsorFlow && (
                <div className="flex flex-col items-center gap-2 -mt-2">
                  <button
                    type="button"
                    onClick={handleSuggestAnother}
                    disabled={indicationLoading}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {indicationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    {t("sponsor.confirm.suggestAnother")}
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setShowConfirmBox(false); clearSearch(); }}>
                  {t("btn.back")}
                </Button>
                <Button className="flex-1" onClick={handleConfirmSponsor} disabled={!sponsorSelected}>
                  {t("sponsor.confirm.confirm")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

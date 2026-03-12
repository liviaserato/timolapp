import { useState, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WizardData } from "@/types/wizard";
import { Search, Users, X, RefreshCw, Loader2 } from "lucide-react";
import timolLogoAzul from "@/assets/logo-timol-azul-escuro.svg";
import whatsappIcon from "@/assets/icon-logo-whatsapp.svg";
import { countries, getCountryName } from "@/data/countries";
import { openWhatsAppLink } from "@/lib/whatsapp";

const LANG_MAP: Record<string, string> = { pt: "pt-BR", en: "en", es: "es" };

interface Props {
  onNext: (data: Partial<WizardData>) => void;
}

type NoSponsorStep = "how-continue" | "find-sponsor";

export const SponsorScreen = ({ onNext }: Props) => {
  const { t, language } = useLanguage();
  const [sponsorId, setSponsorId] = useState("");
  const [foundSponsor, setFoundSponsor] = useState<{ id: string; name: string; city: string; state: string; countryFlag: string; countryName: string; photo: string } | null>(null);
  const [showNoSponsorBox, setShowNoSponsorBox] = useState(false);
  const [noSponsorStep, setNoSponsorStep] = useState<NoSponsorStep>("how-continue");
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  const [fromNoSponsorFlow, setFromNoSponsorFlow] = useState(false);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [sponsorSelected, setSponsorSelected] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [indicationLoading, setIndicationLoading] = useState(false);

  // Location search state for find-sponsor popup
  const [locationSearch, setLocationSearch] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const locationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Find-sponsor sub-state: found sponsor in popup, or not found message
  const [findSponsor, setFindSponsor] = useState<{ id: string; name: string; city: string; state: string; countryFlag: string; countryName: string; photo: string } | null>(null);
  const [findNotFound, setFindNotFound] = useState(false);
  const [findSearched, setFindSearched] = useState(false);

  useEffect(() => {
    setSponsorId("");
    setFoundSponsor(null);
    setShowConfirmBox(false);
    setError("");
    setNotFound(false);
  }, [language]);

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
      if (json.exists !== "true" || !json.person?.length) {
        setError(t("sponsor.error.notFound"));
        setNotFound(true);
        return;
      }
      const person = json.person[0];
      const name = person.fullName || "";
      const addr = person.address || {};
      const city = addr.city || "";
      const state = addr.state || "";
      const countryIso = person.issuerCountryIso2 || addr.countryIso2 || "";
      const countryDataResult = countries.find(c => c.iso2 === countryIso);
      const countryFlag = countryDataResult?.flag || "";
      const countryName = countryDataResult ? getCountryName(countryDataResult, language) : "";
      setFoundSponsor({ id: trimmed, name, city, state, countryFlag, countryName, photo: "" });
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
  }, [sponsorId, t, language]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleConfirmSponsor = () => {
    if (!foundSponsor) return;
    onNext({
      sponsorFranchiseId: foundSponsor.id,
      sponsorName: foundSponsor.name,
      sponsorCity: foundSponsor.city,
      sponsorState: foundSponsor.state,
      sponsorCountryFlag: foundSponsor.countryFlag,
      sponsorSelectionMethod: fromNoSponsorFlow ? "suggest" : "search",
    });
  };

  const fetchSponsorById = async (id: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sponsor-lookup?id=${id}`,
        { headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      if (!res.ok) return null;
      const json = await res.json();
      if (json.exists !== "true" || !json.person?.length) return null;
      const person = json.person[0];
      const addr = person.address || {};
      const countryIso = person.issuerCountryIso2 || addr.countryIso2 || "";
      const countryDataResult = countries.find(c => c.iso2 === countryIso);
      return {
        id,
        name: person.fullName || "",
        city: addr.city || "",
        state: addr.state || "",
        countryFlag: countryDataResult?.flag || "",
        countryName: countryDataResult ? getCountryName(countryDataResult, language) : "",
        photo: "",
      };
    } catch {
      return null;
    }
  };

  // Search sponsor by city in the find-sponsor popup
  const handleFindSponsor = async () => {
    if (!locationSearch.trim()) return;
    setIndicationLoading(true);
    setFindNotFound(false);
    setFindSponsor(null);
    setFindSearched(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sponsor-suggest?city=${encodeURIComponent(locationSearch.trim())}`,
        { headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      const data = await res.json();
      const sponsors = data?.sponsors || data?.ids || [];
      if (!sponsors.length) {
        setFindNotFound(true);
        setIndicationLoading(false);
        return;
      }
      const randomId = String(sponsors[Math.floor(Math.random() * sponsors.length)]);
      const sponsor = await fetchSponsorById(randomId);
      if (sponsor) {
        setFindSponsor(sponsor);
      } else {
        setFindNotFound(true);
      }
    } catch {
      setFindNotFound(true);
    } finally {
      setIndicationLoading(false);
    }
  };

  const handleFindSuggestAnother = async () => {
    if (!locationSearch.trim() || !findSponsor) return;
    setIndicationLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sponsor-suggest?city=${encodeURIComponent(locationSearch.trim())}`,
        { headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      const data = await res.json();
      const sponsors = (data?.sponsors || data?.ids || []).filter((id: any) => String(id) !== findSponsor.id);
      if (!sponsors.length) {
        // Only one available, re-fetch same
        const sponsor = await fetchSponsorById(findSponsor.id);
        if (sponsor) setFindSponsor(sponsor);
      } else {
        const randomId = String(sponsors[Math.floor(Math.random() * sponsors.length)]);
        const sponsor = await fetchSponsorById(randomId);
        if (sponsor) setFindSponsor(sponsor);
      }
    } catch {
      // keep current
    } finally {
      setIndicationLoading(false);
    }
  };

  const handleSelectFoundSponsor = () => {
    if (!findSponsor) return;
    setFoundSponsor(findSponsor);
    setSponsorSelected(false);
    setFromNoSponsorFlow(true);
    setShowNoSponsorBox(false);
    setShowConfirmBox(true);
  };

  const handleSuggestAnother = async () => {
    if (!foundSponsor) return;
    setSponsorSelected(false);
    setIndicationLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sponsor-suggest?city=${encodeURIComponent(locationSearch.trim())}`,
        { headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      const data = await res.json();
      const sponsors = (data?.sponsors || data?.ids || []).filter((id: any) => String(id) !== foundSponsor.id);
      if (!sponsors.length) {
        const sponsor = await fetchSponsorById(foundSponsor.id);
        if (sponsor) {
          setFoundSponsor(sponsor);
        }
      } else {
        const randomId = String(sponsors[Math.floor(Math.random() * sponsors.length)]);
        const sponsor = await fetchSponsorById(randomId);
        if (sponsor) {
          setFoundSponsor(sponsor);
        }
      }
    } catch {
      // keep current
    } finally {
      setIndicationLoading(false);
    }
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
    setNoSponsorStep("how-continue");
    setFromNoSponsorFlow(false);
    setLocationSearch("");
    setFindSponsor(null);
    setFindNotFound(false);
    setFindSearched(false);
  };

  const openNoSponsor = () => {
    clearSearch();
    setNoSponsorStep("how-continue");
    setShowNoSponsorBox(true);
  };

  const openFindSponsor = () => {
    setNoSponsorStep("find-sponsor");
    setLocationSearch("");
    setFindSponsor(null);
    setFindNotFound(false);
    setFindSearched(false);
  };

  const openWhatsAppGeneric = () => {
    openWhatsAppLink(t("sponsor.whatsapp.generic"));
  };

  const handleLocationInput = (value: string) => {
    setLocationSearch(value);
    setFindSearched(false);
    setFindSponsor(null);
    setFindNotFound(false);
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
    setLocationSearch(value);
    setShowLocationDropdown(false);
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowLocationDropdown(false);
      handleFindSponsor();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      {/* Logo + Title + Text + Language */}
      <div className="text-center space-y-3">
        <img src={timolLogoAzul} alt="Timol" className="h-auto w-44 mx-auto" />
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">{t("sponsor.title")}</h1>
        <div className="text-muted-foreground text-sm sm:text-base leading-relaxed space-y-1">
          <p>{t("sponsor.subtitle.line1")}</p>
          <p>{t("sponsor.subtitle.line2")}</p>
        </div>
        <LanguageSelector />
      </div>

      {/* Sponsor ID card */}
      <Card className="shadow-lg">
        <CardContent className="pt-6 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold">{t("sponsor.card.title")}</h2>
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

      {/* No Sponsor Modal — opens directly with "how-continue" */}
      {showNoSponsorBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {noSponsorStep === "find-sponsor"
                    ? t("sponsor.findSponsor.title")
                    : t("sponsor.noSponsorBox.howTitle")}
                </CardTitle>
                <button onClick={() => setShowNoSponsorBox(false)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              {noSponsorStep === "how-continue" && (
                <CardDescription className="text-xs">{t("sponsor.noSponsorBox.howDescription")}</CardDescription>
              )}
              {noSponsorStep === "find-sponsor" && (
                <CardDescription className="text-xs">{t("sponsor.findSponsor.description")}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {noSponsorStep === "how-continue" && (
                <>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={openFindSponsor}>
                    <Users className="h-4 w-4" />
                    {t("sponsor.noSponsorBox.random")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={openWhatsAppGeneric}
                  >
                    <img src={whatsappIcon} alt="WhatsApp" className="h-5 w-5" />
                    {t("sponsor.noSponsorBox.whatsapp")}
                  </Button>
                </>
              )}

              {noSponsorStep === "find-sponsor" && (
                <>
                  {/* Location search */}
                  <div className="space-y-1" ref={locationRef}>
                    <Label className="text-xs">{t("sponsor.findSponsor.location")} *</Label>
                    <div className="relative">
                      <Input
                        placeholder={t("sponsor.findSponsor.location.placeholder")}
                        value={locationSearch}
                        onChange={(e) => handleLocationInput(e.target.value)}
                        onKeyDown={handleLocationKeyDown}
                        onFocus={() => {
                          if (locationSearch.length >= 2 && locationSuggestions.length > 0) {
                            setShowLocationDropdown(true);
                          }
                        }}
                        className="h-8 text-sm pr-10"
                      />
                      <button
                        type="button"
                        onClick={handleFindSponsor}
                        disabled={indicationLoading || !locationSearch.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors disabled:opacity-50"
                        aria-label="Search"
                      >
                        {indicationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </button>
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
                    <p className="text-xs text-muted-foreground">{t("sponsor.findSponsor.location.hint")}</p>
                  </div>

                  {/* Results: sponsor card */}
                  {findSponsor && (
                    <div className="space-y-3 pt-2">
                      <div
                        className="flex items-center gap-4 rounded-lg border-2 border-primary bg-primary/5 ring-1 ring-primary/20 p-4 cursor-pointer transition-all"
                        onClick={handleSelectFoundSponsor}
                      >
                        <Avatar className="h-14 w-14 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                            {findSponsor.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{findSponsor.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {findSponsor.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {findSponsor.city}{findSponsor.state ? `, ${findSponsor.state}` : ""}
                            {findSponsor.countryFlag ? <span title={findSponsor.countryName}> {findSponsor.countryFlag}</span> : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={handleFindSuggestAnother}
                          disabled={indicationLoading}
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {indicationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                          {t("sponsor.confirm.suggestAnother")}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Not found message */}
                  {findNotFound && findSearched && (
                    <div className="pt-2 space-y-3">
                      <p className="text-sm text-muted-foreground">{t("sponsor.noSponsorFound.message")}</p>
                      <Button
                        variant="outline"
                        className="w-full justify-center gap-2"
                        onClick={openWhatsAppGeneric}
                      >
                        <img src={whatsappIcon} alt="WhatsApp" className="h-5 w-5" />
                        {t("sponsor.noSponsorFound.whatsapp")}
                      </Button>
                    </div>
                  )}

                  {/* Back button */}
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setNoSponsorStep("how-continue")}>
                    {t("btn.back")}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirm Sponsor Modal */}
      {showConfirmBox && foundSponsor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onKeyDown={(e) => { if (e.key === "Enter" && sponsorSelected) handleConfirmSponsor(); }}>
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
                     {foundSponsor.countryFlag ? <span title={foundSponsor.countryName}> {foundSponsor.countryFlag}</span> : ""}
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

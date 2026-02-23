import { useState, useCallback, useEffect } from "react";
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
import { Search, Users, Phone, X, ChevronRight, ThumbsUp, Loader2 } from "lucide-react";
import timolLogoAzul from "@/assets/logo-timol-azul-escuro.svg";
import { countries } from "@/data/countries";


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

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactCityState, setContactCityState] = useState("");
  const [contactBestTime, setContactBestTime] = useState("");
  const [contactHowKnew, setContactHowKnew] = useState("");
  const [contactOther, setContactOther] = useState("");
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  // Reset search when language changes
  useEffect(() => {
    setSponsorId("");
    setFoundSponsor(null);
    setShowConfirmBox(false);
    setError("");
  }, [language]);

  const handleSearch = useCallback(async () => {
    const trimmed = sponsorId.trim();
    if (!trimmed) {
      setError(t("sponsor.error.empty"));
      return;
    }
    setSearching(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sponsor-lookup?id=${trimmed}`,
        { headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      if (!res.ok) {
        setError(t("sponsor.error.notFound"));
        return;
      }
      const json = await res.json();
      const record = Array.isArray(json) ? json[0] : json;
      if (!record || !record.nome) {
        setError(t("sponsor.error.notFound"));
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
    } catch {
      setError(t("sponsor.error.notFound"));
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

  const fetchSponsorById = async (id: string) => {
    setSearching(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sponsor-lookup?id=${id}`,
        { headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      if (!res.ok) {
        setError(t("sponsor.error.notFound"));
        return;
      }
      const json = await res.json();
      const record = Array.isArray(json) ? json[0] : json;
      if (!record || !record.nome) {
        setError(t("sponsor.error.notFound"));
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

      setFoundSponsor({ id, name, city, state, countryFlag, photo });
      setSponsorSelected(false);
      setShowConfirmBox(true);
    } catch {
      setError(t("sponsor.error.notFound"));
    } finally {
      setSearching(false);
    }
  };

  const handleRandomSponsor = async () => {
    setShowNoSponsorBox(false);
    setFromNoSponsorFlow(true);
    await fetchSponsorById("31");
  };

  const handleSuggestAnother = async () => {
    if (!foundSponsor) return;
    setSponsorSelected(false);
    const nextId = foundSponsor.id === "31" ? "27" : "31";
    await fetchSponsorById(nextId);
  };

  const resetAll = () => {
    setSponsorId("");
    setFoundSponsor(null);
    setShowConfirmBox(false);
    setSponsorSelected(false);
    setShowNoSponsorBox(false);
    setNoSponsorStep("contact-form");
    setFromNoSponsorFlow(false);
    setError("");
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
    if (!contactCityState.trim()) errors.cityState = t("validation.required");
    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      return;
    }
    setContactErrors({});
    setNoSponsorStep("how-continue");
  };

  const handleContactTimol = () => {
    setNoSponsorStep("contact-success");
  };

  const openNoSponsor = () => {
    setNoSponsorStep("contact-form");
    setContactErrors({});
    setShowNoSponsorBox(true);
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
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {t("sponsor.subtitle")}
        </p>
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
                onChange={(e) => { setSponsorId(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                onBlur={() => { if (sponsorId.trim()) handleSearch(); }}
                className="pr-10"
                maxLength={6}
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                aria-label="Search"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>
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
                      <Input value={contactPhone} onChange={(e) => { setContactPhone(e.target.value); setContactErrors((p) => ({ ...p, phone: "" })); }} className="h-8 text-sm" />
                      {contactErrors.phone && <p className="text-xs text-destructive">{contactErrors.phone}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t("sponsor.noSponsorBox.contactCityState")} *</Label>
                      <Input
                        placeholder={t("sponsor.noSponsorBox.contactCityState.placeholder")}
                        value={contactCityState}
                        onChange={(e) => { setContactCityState(e.target.value); setContactErrors((p) => ({ ...p, cityState: "" })); }}
                        className="h-8 text-sm"
                      />
                      {contactErrors.cityState && <p className="text-xs text-destructive">{contactErrors.cityState}</p>}
                      <p className="text-xs text-muted-foreground">{t("sponsor.noSponsorBox.contactCityState.hint")}</p>
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
                    onClick={handleContactTimol}
                  >
                    <Phone className="h-4 w-4" />
                    {t("sponsor.noSponsorBox.contact")}
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </>
              )}

              {noSponsorStep === "contact-success" && (
                <div className="text-center space-y-3 py-2">
                  <ThumbsUp className="h-10 w-10 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">{t("sponsor.noSponsorBox.contactSuccess")}</p>
                  <Button className="w-full" onClick={resetAll}>OK</Button>
                </div>
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
                <button onClick={() => setShowConfirmBox(false)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
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

              {fromNoSponsorFlow && (
                <div className="text-center -mt-2">
                  <button
                    type="button"
                    onClick={handleSuggestAnother}
                    disabled={searching}
                    className="text-xs text-muted-foreground underline underline-offset-2 hover:text-primary transition-colors"
                  >
                    {searching ? <Loader2 className="h-3 w-3 animate-spin inline mr-1" /> : null}
                    {t("sponsor.confirm.suggestAnother")}
                  </button>
                </div>
              )}

              {sponsorSelected && (
                <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                  <p>⚠️ {t("sponsor.confirm.warning.combined")}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfirmBox(false)}>
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
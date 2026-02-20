import { useState, useCallback } from "react";
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
import { Search, Users, Phone, X, ChevronRight } from "lucide-react";
import timolLogo from "@/assets/timol-logo.svg";

interface Props {
  onNext: (data: Partial<WizardData>) => void;
}

// Mock data for sponsor lookup (will be replaced by real API)
const mockSponsors = [
  { id: "421893", name: "Carlos Alberto Silva", city: "São Paulo", state: "SP", countryFlag: "🇧🇷", photo: "" },
  { id: "087342", name: "Maria Fernanda Costa", city: "Rio de Janeiro", state: "RJ", countryFlag: "🇧🇷", photo: "" },
  { id: "123765", name: "João Pedro Santos", city: "Belo Horizonte", state: "MG", countryFlag: "🇧🇷", photo: "" },
];

type NoSponsorStep = "contact-form" | "how-continue" | "contact-success";

export const SponsorScreen = ({ onNext }: Props) => {
  const { t } = useLanguage();
  const [sponsorId, setSponsorId] = useState("");
  const [foundSponsor, setFoundSponsor] = useState<(typeof mockSponsors)[0] | null>(null);
  const [showNoSponsorBox, setShowNoSponsorBox] = useState(false);
  const [noSponsorStep, setNoSponsorStep] = useState<NoSponsorStep>("contact-form");
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  const [error, setError] = useState("");

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactCity, setContactCity] = useState("");
  const [contactState, setContactState] = useState("");
  const [contactBestTime, setContactBestTime] = useState("");
  const [contactHowKnew, setContactHowKnew] = useState("");
  const [contactOther, setContactOther] = useState("");

  const handleSearch = useCallback(() => {
    if (!sponsorId.trim()) {
      setError(t("sponsor.error.empty"));
      return;
    }
    // TODO: Replace with real API call
    const found = mockSponsors.find((s) => s.id === sponsorId.trim());
    if (found) {
      setFoundSponsor(found);
      setShowConfirmBox(true);
      setError("");
    } else {
      setError(t("sponsor.error.notFound"));
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

  const handleRandomSponsor = () => {
    const random = mockSponsors[Math.floor(Math.random() * mockSponsors.length)];
    setFoundSponsor(random);
    setShowNoSponsorBox(false);
    setShowConfirmBox(true);
  };

  const handleContactSubmit = () => {
    setNoSponsorStep("how-continue");
  };

  const handleContactTimol = () => {
    setNoSponsorStep("contact-success");
  };

  const openNoSponsor = () => {
    setNoSponsorStep("contact-form");
    setShowNoSponsorBox(true);
  };

  const howKnewOptions = [
    { value: "live", label: t("sponsor.noSponsorBox.contactHowKnew.live") },
    { value: "showroom", label: t("sponsor.noSponsorBox.contactHowKnew.showroom") },
    { value: "friend", label: t("sponsor.noSponsorBox.contactHowKnew.friend") },
    { value: "other", label: t("sponsor.noSponsorBox.contactHowKnew.other") },
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-3">
        <img src={timolLogo} alt="Timol" className="h-16 w-16 mx-auto" />
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">{t("sponsor.title")}</h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {t("sponsor.subtitle")}
        </p>
      </div>

      {/* Language selector outside card */}
      <LanguageSelector />

      <Card className="shadow-lg">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-lg">{t("sponsor.card.title")}</CardTitle>
          <CardDescription>{t("sponsor.card.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("sponsor.id.placeholder")}
              value={sponsorId}
              onChange={(e) => { setSponsorId(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              onBlur={() => { if (sponsorId.trim()) handleSearch(); }}
              className="pl-10"
              maxLength={6}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}

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
                    ? "✓"
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
                      <Label className="text-xs">{t("sponsor.noSponsorBox.contactFullName")}</Label>
                      <Input value={contactName} onChange={(e) => setContactName(e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">{t("sponsor.noSponsorBox.contactPhone")}</Label>
                        <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="h-8 text-sm" />
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
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">{t("sponsor.noSponsorBox.contactCity")}</Label>
                        <Input value={contactCity} onChange={(e) => setContactCity(e.target.value)} className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("sponsor.noSponsorBox.contactState")}</Label>
                        <Input value={contactState} onChange={(e) => setContactState(e.target.value)} className="h-8 text-sm" />
                      </div>
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
                  <div className="text-4xl">✅</div>
                  <p className="text-sm text-muted-foreground">{t("sponsor.noSponsorBox.contactSuccess")}</p>
                  <Button className="w-full" onClick={() => setShowNoSponsorBox(false)}>OK</Button>
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
              <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/40">
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
                    {foundSponsor.city}, {foundSponsor.state} {foundSponsor.countryFlag}
                  </p>
                </div>
              </div>

              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                ⚠️ {t("sponsor.confirm.warning")}
              </p>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfirmBox(false)}>
                  {t("btn.back")}
                </Button>
                <Button className="flex-1" onClick={handleConfirmSponsor}>
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

import { useState } from "react";
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
import { WizardData } from "@/types/wizard";
import { Search, Users, Phone, X, ChevronRight } from "lucide-react";
import timolLogo from "@/assets/timol-logo.svg";

interface Props {
  onNext: (data: Partial<WizardData>) => void;
}

// Mock data for random sponsor suggestion
const mockSponsors = [
  { id: "421893", name: "Carlos Alberto Silva", city: "São Paulo", state: "SP", countryFlag: "🇧🇷" },
  { id: "087342", name: "Maria Fernanda Costa", city: "Rio de Janeiro", state: "RJ", countryFlag: "🇧🇷" },
  { id: "123765", name: "João Pedro Santos", city: "Belo Horizonte", state: "MG", countryFlag: "🇧🇷" },
];

type ContactStep = "options" | "contact-form" | "contact-success";

export const SponsorScreen = ({ onNext }: Props) => {
  const { t } = useLanguage();
  const [sponsorId, setSponsorId] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [foundSponsor, setFoundSponsor] = useState<(typeof mockSponsors)[0] | null>(null);
  const [showNoSponsorBox, setShowNoSponsorBox] = useState(false);
  const [noSponsorStep, setNoSponsorStep] = useState<ContactStep>("options");
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

  const handleSearch = () => {
    if (!sponsorId.trim() && !sponsorName.trim()) {
      setError(t("sponsor.error.empty"));
      return;
    }
    const found = mockSponsors.find(
      (s) =>
        s.id.toLowerCase().includes(sponsorId.toLowerCase()) ||
        s.name.toLowerCase().includes(sponsorName.toLowerCase())
    );
    if (found) {
      setFoundSponsor(found);
      setShowConfirmBox(true);
      setError("");
    } else {
      setError(t("sponsor.error.notFound"));
    }
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

  const handleContactSend = () => {
    // In production, send to backend
    setNoSponsorStep("contact-success");
  };

  const openNoSponsor = () => {
    setNoSponsorStep("options");
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

      <Card className="shadow-lg">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t("sponsor.card.title")}</CardTitle>
            <LanguageSelector />
          </div>
          <CardDescription>{t("sponsor.card.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sponsorId">{t("sponsor.id")}</Label>
            <Input
              id="sponsorId"
              placeholder={t("sponsor.id.placeholder")}
              value={sponsorId}
              onChange={(e) => { setSponsorId(e.target.value); setError(""); }}
              maxLength={20}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sponsorName">{t("sponsor.name")}</Label>
            <Input
              id="sponsorName"
              placeholder={t("sponsor.name.placeholder")}
              value={sponsorName}
              onChange={(e) => { setSponsorName(e.target.value); setError(""); }}
              maxLength={100}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button className="w-full" onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            {t("sponsor.search")}
          </Button>

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

      {/* No Sponsor Toolbox */}
      {showNoSponsorBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {noSponsorStep === "contact-form"
                    ? t("sponsor.noSponsorBox.contactTitle")
                    : noSponsorStep === "contact-success"
                    ? "✓"
                    : t("sponsor.noSponsorBox.title")}
                </CardTitle>
                <button onClick={() => setShowNoSponsorBox(false)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              {noSponsorStep === "options" && (
                <CardDescription className="text-xs">{t("sponsor.noSponsorBox.description")}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {noSponsorStep === "options" && (
                <>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={handleRandomSponsor}>
                    <Users className="h-4 w-4" />
                    {t("sponsor.noSponsorBox.random")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setNoSponsorStep("contact-form")}
                  >
                    <Phone className="h-4 w-4" />
                    {t("sponsor.noSponsorBox.contact")}
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </>
              )}

              {noSponsorStep === "contact-form" && (
                <>
                  <p className="text-xs text-muted-foreground">{t("sponsor.noSponsorBox.contactDesc")}</p>
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
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setNoSponsorStep("options")}>
                      {t("btn.back")}
                    </Button>
                    <Button size="sm" className="flex-1" onClick={handleContactSend}>
                      {t("sponsor.noSponsorBox.contactSend")}
                    </Button>
                  </div>
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

      {/* Confirm Sponsor Toolbox */}
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
              {/* Sponsor Card */}
              <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/40">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {foundSponsor.countryFlag}
                </div>
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

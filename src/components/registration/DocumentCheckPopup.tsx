import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X, AlertTriangle, CheckCircle2, XCircle, MessageCircle, Loader2 } from "lucide-react";
import { countries, getCountryName } from "@/data/countries";

const WHATSAPP_NUMBER = "5534991258000";

export interface DocumentRecord {
  id: string;
  name: string;
  country?: string;
  countryIso2?: string;
  sponsorId?: string;
}

interface Props {
  records: DocumentRecord[];
  document: string;
  isForeigner: boolean;
  currentSponsorId?: string;
  userName: string;
  onContinue: () => void;
  onClose: () => void;
}

type PopupStep =
  | "confirm-ownership"     // Is this yours?
  | "select-country"        // Disambiguation for foreigners
  | "sponsor-check"         // Validate sponsor link
  | "sponsor-ok"            // Sponsor matches, can continue
  | "sponsor-blocked"       // Sponsor doesn't match
  | "not-mine";             // User doesn't recognize data

export const DocumentCheckPopup = ({
  records,
  document,
  isForeigner,
  currentSponsorId,
  userName,
  onContinue,
  onClose,
}: Props) => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<PopupStep>(
    isForeigner && records.length > 1 ? "select-country" : "confirm-ownership"
  );
  const [selectedRecord, setSelectedRecord] = useState<DocumentRecord | null>(
    records.length === 1 ? records[0] : null
  );
  const [selectedCountry, setSelectedCountry] = useState("");

  const handleConfirmYes = () => {
    if (!selectedRecord) return;
    // Check sponsor link
    if (!currentSponsorId) {
      setStep("sponsor-check");
      return;
    }
    const sponsorIds = records.map((r) => r.id);
    if (sponsorIds.includes(currentSponsorId)) {
      setStep("sponsor-ok");
    } else {
      setStep("sponsor-blocked");
    }
  };

  const handleCountrySelect = (countryIso2: string) => {
    setSelectedCountry(countryIso2);
    const match = records.find((r) => r.countryIso2 === countryIso2);
    if (match) {
      setSelectedRecord(match);
      setStep("confirm-ownership");
    } else {
      // No record for that country — treat as new registration
      onContinue();
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      t("docCheck.whatsapp.message")
        .replace("{name}", userName)
        .replace("{document}", document)
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t("docCheck.title")}
            </CardTitle>
            <button type="button" onClick={onClose}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step: Disambiguation for foreigners with multiple records */}
          {step === "select-country" && (
            <>
              <p className="text-sm text-muted-foreground">
                {t("docCheck.disambiguation.message")}
              </p>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("docCheck.disambiguation.selectCountry")}</Label>
                <div className="space-y-1">
                  {records.map((record) => {
                    const country = countries.find((c) => c.iso2 === record.countryIso2);
                    const countryLabel = country
                      ? `${country.flag} ${getCountryName(country, language)}`
                      : record.country || record.countryIso2 || "—";
                    return (
                      <button
                        key={record.id}
                        type="button"
                        className="w-full text-left px-3 py-2.5 text-sm rounded-md border hover:bg-muted transition-colors flex items-center justify-between"
                        onClick={() => handleCountrySelect(record.countryIso2 || "")}
                      >
                        <span>{countryLabel}</span>
                        <span className="text-xs text-muted-foreground">ID {record.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep("not-mine")}
                className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {t("docCheck.notMine")}
              </button>
            </>
          )}

          {/* Step: Confirm ownership */}
          {step === "confirm-ownership" && selectedRecord && (
            <>
              <p className="text-sm text-muted-foreground">
                {t("docCheck.confirmOwnership.message")}
              </p>
              <div className="rounded-md border bg-muted/50 p-3 space-y-1">
                <p className="text-sm"><span className="font-medium">ID:</span> {selectedRecord.id}</p>
                <p className="text-sm"><span className="font-medium">{t("docCheck.confirmOwnership.name")}:</span> {selectedRecord.name}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleConfirmYes}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  {t("docCheck.confirmOwnership.yes")}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("not-mine")}
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  {t("docCheck.confirmOwnership.no")}
                </Button>
              </div>
            </>
          )}

          {/* Step: Sponsor validation info */}
          {step === "sponsor-check" && (
            <>
              <p className="text-sm text-muted-foreground">
                {t("docCheck.sponsorCheck.message")}
              </p>
              <div className="rounded-md border bg-amber-50 border-amber-200 px-3 py-2 text-sm text-amber-700">
                {t("docCheck.sponsorCheck.requirement")}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("docCheck.sponsorCheck.linkedIds")}
              </p>
              <div className="space-y-1">
                {records.map((r) => (
                  <div key={r.id} className="rounded-md border bg-muted/50 px-3 py-1.5 text-sm">
                    <span className="font-medium">ID {r.id}</span> — {r.name}
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" onClick={onClose}>
                {t("docCheck.sponsorCheck.goBack")}
              </Button>
            </>
          )}

          {/* Step: Sponsor matches */}
          {step === "sponsor-ok" && (
            <>
              <div className="text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
                <p className="text-sm font-medium">{t("docCheck.sponsorOk.title")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("docCheck.sponsorOk.message")}
                </p>
              </div>
              <Button className="w-full" onClick={onContinue}>
                {t("docCheck.sponsorOk.continue")}
              </Button>
            </>
          )}

          {/* Step: Sponsor doesn't match */}
          {step === "sponsor-blocked" && (
            <>
              <div className="rounded-md border bg-destructive/10 border-destructive/30 px-3 py-2 text-sm text-destructive">
                {t("docCheck.sponsorBlocked.message")}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("docCheck.sponsorBlocked.explanation")}
              </p>
              <div className="space-y-1">
                {records.map((r) => (
                  <div key={r.id} className="rounded-md border bg-muted/50 px-3 py-1.5 text-sm">
                    <span className="font-medium">ID {r.id}</span> — {r.name}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  {t("docCheck.sponsorBlocked.goBack")}
                </Button>
                <Button variant="default" className="flex-1" onClick={openWhatsApp}>
                  <MessageCircle className="h-4 w-4 mr-1.5" />
                  {t("docCheck.sponsorBlocked.support")}
                </Button>
              </div>
            </>
          )}

          {/* Step: User doesn't recognize data */}
          {step === "not-mine" && (
            <>
              <div className="text-center space-y-2">
                <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
                <p className="text-sm font-medium">{t("docCheck.notMine.title")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("docCheck.notMine.message")}
                </p>
              </div>
              <Button className="w-full" onClick={openWhatsApp}>
                <MessageCircle className="h-4 w-4 mr-1.5" />
                {t("docCheck.notMine.whatsapp")}
              </Button>
              <Button variant="outline" className="w-full" onClick={onClose}>
                {t("docCheck.notMine.cancel")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

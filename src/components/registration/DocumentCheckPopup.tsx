import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, AlertTriangle, CheckCircle2, XCircle, MessageCircle } from "lucide-react";
import { openWhatsAppLink } from "@/lib/whatsapp";
import { DocumentCheckResult, resolvePhone } from "@/hooks/useDocumentCheck";

interface Props {
  result: DocumentCheckResult;
  document: string;
  currentSponsorId?: string;
  userName: string;
  onContinue: () => void;
  onClose: () => void;
}

type PopupStep =
  | "confirm-ownership"
  | "sponsor-check"
  | "sponsor-ok"
  | "sponsor-blocked"
  | "not-mine";

export const DocumentCheckPopup = ({
  result,
  document,
  currentSponsorId,
  userName,
  onContinue,
  onClose,
}: Props) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<PopupStep>("confirm-ownership");

  const person = result.person;
  const franchises = result.franchises;
  const phone = resolvePhone(person?.phones);

  const handleConfirmYes = () => {
    if (!currentSponsorId) {
      setStep("sponsor-check");
      return;
    }
    // Check if sponsor matches any franchise ID
    const franchiseIds = (franchises?.items || []).map((f) => String(f.id));
    if (franchiseIds.includes(currentSponsorId)) {
      setStep("sponsor-ok");
    } else {
      setStep("sponsor-blocked");
    }
  };

  const openWhatsApp = () => {
    const message = t("docCheck.whatsapp.message")
      .replace("{name}", userName)
      .replace("{document}", document);
    openWhatsAppLink(message);
  };

  const addr = person?.address;
  const addressLine = [addr?.street, addr?.number].filter(Boolean).join(", ");
  const addressLine2 = [addr?.district, addr?.city, addr?.state].filter(Boolean).join(", ");

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
          {/* Step: Confirm ownership */}
          {step === "confirm-ownership" && person && (
            <>
              <p className="text-sm text-muted-foreground">
                {t("docCheck.confirmOwnership.message")}
              </p>
              <div className="rounded-md border bg-muted/50 p-3 space-y-1.5 text-sm">
                {person.fullName && (
                  <p><span className="font-medium">{t("docCheck.confirmOwnership.name")}:</span> {person.fullName}</p>
                )}
                {person.birthDate && (
                  <p><span className="font-medium">{t("docCheck.person.birthDate")}:</span> {person.birthDate}</p>
                )}
                {person.email && (
                  <p><span className="font-medium">{t("docCheck.person.email")}:</span> {person.email}</p>
                )}
                {phone && (
                  <p><span className="font-medium">{t("docCheck.person.phone")}:</span> {phone}</p>
                )}
                {addressLine && (
                  <p><span className="font-medium">{t("docCheck.person.address")}:</span> {addressLine}</p>
                )}
                {addr?.complement && (
                  <p className="pl-4 text-muted-foreground">{addr.complement}</p>
                )}
                {addressLine2 && (
                  <p className="pl-4 text-muted-foreground">{addressLine2}</p>
                )}
                {addr?.zipCode && (
                  <p className="pl-4 text-muted-foreground">{t("docCheck.person.zipCode")}: {addr.zipCode}</p>
                )}
                {franchises && franchises.count > 0 && (
                  <div className="pt-1.5 border-t mt-1.5">
                    <p className="font-medium">{t("docCheck.person.franchises")} ({franchises.count}):</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {franchises.items.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs">
                          <span className="font-medium">ID {f.id}</span>
                          {f.franchiseType && <span className="text-muted-foreground">• {f.franchiseType}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="default" className="flex-1" onClick={handleConfirmYes}>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  {t("docCheck.confirmOwnership.yes")}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setStep("not-mine")}>
                  <XCircle className="h-4 w-4 mr-1.5" />
                  {t("docCheck.confirmOwnership.no")}
                </Button>
              </div>
            </>
          )}

          {/* Step: Sponsor validation info (no sponsorId provided) */}
          {step === "sponsor-check" && (
            <>
              <p className="text-sm text-muted-foreground">
                {t("docCheck.sponsorCheck.message")}
              </p>
              <div className="rounded-md border bg-amber-50 border-amber-200 px-3 py-2 text-sm text-amber-700">
                {t("docCheck.sponsorCheck.requirement")}
              </div>
              {franchises && franchises.count > 0 && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {t("docCheck.sponsorCheck.linkedIds")}
                  </p>
                  <div className="space-y-1">
                    {franchises.items.map((f, i) => (
                      <div key={i} className="rounded-md border bg-muted/50 px-3 py-1.5 text-sm">
                        <span className="font-medium">ID {f.id}</span>
                        {f.franchiseType && <span className="text-muted-foreground"> — {f.franchiseType}</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}
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
              {franchises && franchises.count > 0 && (
                <div className="space-y-1">
                  {franchises.items.map((f, i) => (
                    <div key={i} className="rounded-md border bg-muted/50 px-3 py-1.5 text-sm">
                      <span className="font-medium">ID {f.id}</span>
                      {f.franchiseType && <span className="text-muted-foreground"> — {f.franchiseType}</span>}
                    </div>
                  ))}
                </div>
              )}
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

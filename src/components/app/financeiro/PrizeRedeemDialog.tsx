import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Prize } from "./mock-data";
import { CheckCircle } from "lucide-react";
import { PinStepContent } from "./PinStepContent";
import { useLanguage } from "@/i18n/LanguageContext";

type Step = "confirm" | "pin" | "success";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; prize: Prize | null; }

export function PrizeRedeemDialog({ open, onOpenChange, prize }: Props) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("confirm");

  function reset() { setStep("confirm"); }
  function handleClose(v: boolean) { if (!v) reset(); onOpenChange(v); }

  if (!prize) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>{prize.name}</DialogTitle>
              <DialogDescription>{prize.pointsRequired.toLocaleString("pt-BR")} {t("fin.points").toLowerCase()}</DialogDescription>
            </DialogHeader>
            <div className="mt-2 space-y-3">
              <div className="flex justify-center text-5xl">{prize.imageEmoji}</div>
              <p className="text-sm text-muted-foreground">{prize.detailedDescription}</p>
              <Button className="w-full" onClick={() => setStep("pin")}>{t("prz.confirmRedeem")}</Button>
            </div>
          </>
        )}
        {step === "pin" && (
          <PinStepContent description={t("prz.redeemPinDesc")} onSubmit={() => setStep("success")} onResend={() => {}} onBack={() => setStep("confirm")} />
        )}
        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle className="h-14 w-14 text-[hsl(var(--success))]" />
            <h3 className="text-lg font-bold text-primary">{t("prz.redeemConfirmed")}</h3>
            <p className="text-sm text-muted-foreground">{t("prz.redeemSuccessMsg").replace("{name}", prize.name)}</p>
            <p className="text-sm text-muted-foreground">{t("prz.teamContact")}</p>
            <Button className="mt-2 w-full" onClick={() => handleClose(false)}>{t("common.close")}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Prize } from "./mock-data";
import { CheckCircle } from "lucide-react";
import { PinStepContent } from "./PinStepContent";

type Step = "confirm" | "pin" | "success";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prize: Prize | null;
}

export function PrizeRedeemDialog({ open, onOpenChange, prize }: Props) {
  const [step, setStep] = useState<Step>("confirm");

  function reset() {
    setStep("confirm");
  }

  function handleClose(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  if (!prize) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>{prize.name}</DialogTitle>
              <DialogDescription>{prize.pointsRequired.toLocaleString("pt-BR")} pontos</DialogDescription>
            </DialogHeader>
            <div className="mt-2 space-y-3">
              <div className="flex justify-center text-5xl">{prize.imageEmoji}</div>
              <p className="text-sm text-muted-foreground">{prize.detailedDescription}</p>
              <Button className="w-full" onClick={() => setStep("pin")}>
                Confirmar resgate
              </Button>
            </div>
          </>
        )}

        {step === "pin" && (
          <PinStepContent
            description="Enviamos um PIN de 6 dígitos para o seu e-mail. Digite abaixo para confirmar o resgate."
            onSubmit={() => setStep("success")}
            onResend={() => { /* TODO: call send-pin endpoint */ }}
            onBack={() => setStep("confirm")}
          />
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle className="h-14 w-14 text-[hsl(var(--success))]" />
            <h3 className="text-lg font-bold text-primary">Resgate Confirmado!</h3>
            <p className="text-sm text-muted-foreground">
              O resgate do prêmio <strong>{prize.name}</strong> foi concluído com sucesso.
            </p>
            <p className="text-sm text-muted-foreground">
              Nossa equipe entrará em contato para os próximos passos.
            </p>
            <Button className="mt-2 w-full" onClick={() => handleClose(false)}>
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

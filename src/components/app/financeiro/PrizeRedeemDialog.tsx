import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Prize } from "./mock-data";
import { CheckCircle, ShieldCheck } from "lucide-react";

type Step = "confirm" | "pin" | "success";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prize: Prize | null;
}

export function PrizeRedeemDialog({ open, onOpenChange, prize }: Props) {
  const [step, setStep] = useState<Step>("confirm");
  const [pin, setPin] = useState("");

  function reset() {
    setStep("confirm");
    setPin("");
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
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Verificação de Segurança
              </DialogTitle>
              <DialogDescription>
                Enviamos um PIN de 6 dígitos para o seu e-mail. Digite abaixo para confirmar.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 mt-4">
              <InputOTP maxLength={6} value={pin} onChange={setPin}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-muted-foreground">Ninguém da Timol solicitará este código.</p>
              <Button className="w-full" disabled={pin.length < 6} onClick={() => setStep("success")}>
                Confirmar
              </Button>
            </div>
          </>
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

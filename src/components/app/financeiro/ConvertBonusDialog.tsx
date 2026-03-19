import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";
import { CheckCircle, ArrowLeft, ArrowRightLeft, AlertTriangle } from "lucide-react";
import { PinStepContent } from "./PinStepContent";

const BONUS_PERCENT = 5;

type Step = "amount" | "pin" | "success";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: CurrencyConfig;
  availableBonus: number;
  onConvert: (amount: number, bonus: number, total: number) => void;
}

function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const cents = parseInt(digits || "0", 10);
  const intPart = Math.floor(cents / 100);
  const decPart = (cents % 100).toString().padStart(2, "0");
  return `${intPart.toLocaleString("pt-BR")},${decPart}`;
}

function parseCurrencyInput(formatted: string): number {
  const digits = formatted.replace(/\D/g, "");
  return parseInt(digits || "0", 10) / 100;
}

export function ConvertBonusDialog({ open, onOpenChange, currency, availableBonus, onConvert }: Props) {
  const [step, setStep] = useState<Step>("amount");
  const [rawAmount, setRawAmount] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const displayAmount = rawAmount ? formatCurrencyInput(rawAmount) : "0,00";
  const numAmount = parseCurrencyInput(rawAmount);
  const extraAmount = numAmount * (BONUS_PERCENT / 100);
  const totalCredit = numAmount + extraAmount;
  const exceedsBalance = numAmount > availableBonus;
  const canContinue = numAmount > 0 && !exceedsBalance && confirmed;

  function reset() {
    setStep("amount");
    setRawAmount("");
    setConfirmed(false);
  }

  function handleClose(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRawAmount(e.target.value.replace(/\D/g, ""));
  }

  function handleContinue(e?: React.FormEvent) {
    e?.preventDefault();
    if (canContinue) setStep("pin");
  }

  function handlePinSubmit(_pin: string) {
    onConvert(numAmount, extraAmount, totalCredit);
    setStep("success");
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {/* Step 1: Amount */}
        {step === "amount" && (
          <form onSubmit={handleContinue}>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Transferir Bônus para Carteira
              </DialogTitle>
              <p className="text-sm text-center text-muted-foreground">
                Saldo disponível: <strong>{formatCurrency(availableBonus, currency)}</strong>
              </p>
              <DialogDescription className="text-center mt-2">
                Transfira seus bônus para a carteira e reutilize o valor em compras ou transferências para outros IDs.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-3">
              <div>
                <Label htmlFor="convert-amount">Valor a transferir ({currency.symbol})</Label>
                <Input
                  id="convert-amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  className="mt-1"
                  autoFocus
                />
                {exceedsBalance && numAmount > 0 && (
                  <div className="flex items-start gap-1.5 mt-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive">
                      O valor excede o saldo de bônus disponível ({formatCurrency(availableBonus, currency)}).
                    </p>
                  </div>
                )}
              </div>

              {/* Live calculation */}
              {numAmount > 0 && !exceedsBalance && (
                <div className="rounded-md border border-app-card-border p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor transferido</span>
                    <span>{formatCurrency(numAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Extra ({BONUS_PERCENT}%)</span>
                    <span className="text-[hsl(var(--success))] font-medium">+{formatCurrency(extraAmount, currency)}</span>
                  </div>
                  <div className="border-t border-border/40 pt-1.5 flex justify-between font-bold">
                    <span>Crédito na carteira</span>
                    <span className="text-primary">{formatCurrency(totalCredit, currency)}</span>
                  </div>
                </div>
              )}

              {/* Confirmation checkbox */}
              {numAmount > 0 && !exceedsBalance && (
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="confirm-convert"
                    checked={confirmed}
                    onCheckedChange={(v) => setConfirmed(v === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="confirm-convert" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                    Confirmo que quero transferir meus bônus para saldo na carteira. Sei que essa operação é imediata e{" "}
                    <strong className="text-destructive font-semibold">não pode ser desfeita</strong>.
                  </label>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!canContinue}>
                Continuar
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: PIN */}
        {step === "pin" && (
          <PinStepContent
            description="Enviamos um PIN de 6 dígitos para o seu e-mail. Digite abaixo para confirmar a transferência de bônus."
            onSubmit={handlePinSubmit}
            onResend={() => { /* TODO: call send-pin endpoint */ }}
            onBack={() => setStep("amount")}
          />
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <form onSubmit={(e) => { e.preventDefault(); handleClose(false); }}>
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="h-14 w-14 text-[hsl(var(--success))]" />
              <h3 className="text-lg font-bold text-primary">Transferência Realizada!</h3>
              <p className="text-sm text-muted-foreground">
                Seu bônus foi transferido com sucesso.
                <br />
                O valor já está disponível na sua carteira.
              </p>
              <div className="rounded-md border border-app-card-border p-3 w-full space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bônus transferido</span>
                  <span>{formatCurrency(numAmount, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Extra ({BONUS_PERCENT}%)</span>
                  <span className="text-[hsl(var(--success))] font-medium">+{formatCurrency(extraAmount, currency)}</span>
                </div>
                <div className="border-t border-border/40 pt-1.5 flex justify-between font-bold">
                  <span>Creditado na carteira</span>
                  <span className="text-primary">{formatCurrency(totalCredit, currency)}</span>
                </div>
              </div>
              <Button type="submit" className="mt-2 w-full" autoFocus>
                Fechar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

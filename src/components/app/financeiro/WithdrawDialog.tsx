import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";
import { WITHDRAW_FEE_PERCENT } from "./mock-data";
import { CheckCircle, ShieldCheck } from "lucide-react";

type Step = "amount" | "pin" | "success";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: CurrencyConfig;
  availableBalance: number;
}

export function WithdrawDialog({ open, onOpenChange, currency, availableBalance }: Props) {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");

  const numAmount = parseFloat(amount.replace(",", ".")) || 0;
  const fee = numAmount * (WITHDRAW_FEE_PERCENT / 100);
  const netAmount = numAmount - fee;

  function reset() {
    setStep("amount");
    setAmount("");
    setPin("");
  }

  function handleClose(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  // Next friday helper
  const today = new Date();
  const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  const nextFridayStr = nextFriday.toLocaleDateString("pt-BR");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === "amount" && (
          <>
            <DialogHeader>
              <DialogTitle>Resgatar Saldo</DialogTitle>
              <DialogDescription>
                Saldo disponível: <strong>{formatCurrency(availableBalance, currency)}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Valor do resgate ({currency.symbol})</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1"
                />
              </div>
              {numAmount > 0 && (
                <div className="rounded-md border border-app-card-border p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor solicitado</span>
                    <span>{formatCurrency(numAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa ({WITHDRAW_FEE_PERCENT}%)</span>
                    <span className="text-destructive">-{formatCurrency(fee, currency)}</span>
                  </div>
                  <div className="border-t border-border/40 pt-1 flex justify-between font-bold">
                    <span>Você receberá</span>
                    <span className="text-primary">{formatCurrency(netAmount, currency)}</span>
                  </div>
                </div>
              )}
              <Button
                className="w-full"
                disabled={numAmount <= 0 || numAmount > availableBalance}
                onClick={() => setStep("pin")}
              >
                Solicitar resgate
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
                Enviamos um PIN de 6 dígitos para o seu e-mail. Digite abaixo para confirmar o resgate.
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
              Seu resgate de <strong>{formatCurrency(netAmount, currency)}</strong> foi solicitado com sucesso.
            </p>
            <p className="text-sm text-muted-foreground">
              Previsão de depósito: <strong>{nextFridayStr}</strong>
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

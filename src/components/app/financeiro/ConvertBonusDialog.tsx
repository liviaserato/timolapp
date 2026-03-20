import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";
import { CheckCircle, ArrowRightLeft, AlertTriangle } from "lucide-react";
import { PinStepContent } from "./PinStepContent";
import { useLanguage } from "@/i18n/LanguageContext";

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
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("amount");
  const [rawAmount, setRawAmount] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const displayAmount = rawAmount ? formatCurrencyInput(rawAmount) : "0,00";
  const numAmount = parseCurrencyInput(rawAmount);
  const extraAmount = numAmount * (BONUS_PERCENT / 100);
  const totalCredit = numAmount + extraAmount;
  const exceedsBalance = numAmount > availableBonus;
  const canContinue = numAmount > 0 && !exceedsBalance && confirmed;

  function reset() { setStep("amount"); setRawAmount(""); setConfirmed(false); }
  function handleClose(v: boolean) { if (!v) reset(); onOpenChange(v); }
  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) { setRawAmount(e.target.value.replace(/\D/g, "")); }
  function handleContinue(e?: React.FormEvent) { e?.preventDefault(); if (canContinue) setStep("pin"); }
  function handlePinSubmit(_pin: string) { onConvert(numAmount, extraAmount, totalCredit); setStep("success"); }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {step === "amount" && (
          <form onSubmit={handleContinue}>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2">
                <ArrowRightLeft className="h-5 w-5" /> {t("cvt.title")}
              </DialogTitle>
              <p className="text-sm text-center text-muted-foreground">
                {t("cvt.available")} <strong>{formatCurrency(availableBonus, currency)}</strong>
              </p>
              <DialogDescription className="text-center mt-2">{t("cvt.desc")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-3">
              <div>
                <Label htmlFor="convert-amount">{t("cvt.amountLabel")} ({currency.symbol})</Label>
                <Input id="convert-amount" type="text" inputMode="numeric" placeholder="0,00" value={displayAmount} onChange={handleAmountChange} className="mt-1" autoFocus />
                {exceedsBalance && numAmount > 0 && (
                  <div className="flex items-start gap-1.5 mt-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive">{t("cvt.exceedsBalance")} ({formatCurrency(availableBonus, currency)}).</p>
                  </div>
                )}
              </div>
              {numAmount > 0 && !exceedsBalance && (
                <div className="rounded-md border border-app-card-border p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("cvt.transferred")}</span><span>{formatCurrency(numAmount, currency)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("cvt.extra")} ({BONUS_PERCENT}%)</span><span className="text-[hsl(var(--success))] font-medium">+{formatCurrency(extraAmount, currency)}</span></div>
                  <div className="border-t border-border/40 pt-1.5 flex justify-between font-bold"><span>{t("cvt.walletCredit")}</span><span className="text-primary">{formatCurrency(totalCredit, currency)}</span></div>
                </div>
              )}
              {numAmount > 0 && !exceedsBalance && (
                <div className="flex items-start gap-2.5">
                  <Checkbox id="confirm-convert" checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} className="mt-0.5" />
                  <label htmlFor="confirm-convert" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                    {t("cvt.confirmCheck")} <strong className="text-destructive font-semibold">{t("cvt.irreversible")}</strong>.
                  </label>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={!canContinue}>{t("fin.continue")}</Button>
            </div>
          </form>
        )}
        {step === "pin" && (
          <PinStepContent description={t("cvt.pinDesc")} onSubmit={handlePinSubmit} onResend={() => {}} onBack={() => setStep("amount")} />
        )}
        {step === "success" && (
          <form onSubmit={(e) => { e.preventDefault(); handleClose(false); }}>
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="h-14 w-14 text-[hsl(var(--success))]" />
              <h3 className="text-lg font-bold text-primary">{t("cvt.successTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("cvt.successMsg")}<br />{t("cvt.successMsg2")}</p>
              <div className="rounded-md border border-app-card-border p-3 w-full space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("cvt.bonusTransferred")}</span><span>{formatCurrency(numAmount, currency)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("cvt.extra")} ({BONUS_PERCENT}%)</span><span className="text-[hsl(var(--success))] font-medium">+{formatCurrency(extraAmount, currency)}</span></div>
                <div className="border-t border-border/40 pt-1.5 flex justify-between font-bold"><span>{t("cvt.walletCredited")}</span><span className="text-primary">{formatCurrency(totalCredit, currency)}</span></div>
              </div>
              <Button type="submit" className="mt-2 w-full" autoFocus>{t("common.close")}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState, useMemo, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";
import { CheckCircle, QrCode, CreditCard, ArrowLeft, Copy, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

type Step = "amount" | "payment" | "pix-pending" | "success";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; currency: CurrencyConfig; }

function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, ""); const cents = parseInt(digits || "0", 10);
  return `${Math.floor(cents / 100).toLocaleString("pt-BR")},${(cents % 100).toString().padStart(2, "0")}`;
}
function parseCurrencyInput(formatted: string): number { return parseInt(formatted.replace(/\D/g, "") || "0", 10) / 100; }
function formatCardNumber(raw: string): string { return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); }
function formatExpiry(raw: string): string { const d = raw.replace(/\D/g, "").slice(0, 4); return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`; }
function isExpiryValid(expiry: string): boolean {
  const d = expiry.replace(/\D/g, ""); if (d.length !== 4) return false;
  const m = parseInt(d.slice(0, 2), 10), y = parseInt(d.slice(2, 4), 10);
  if (m < 1 || m > 12) return false;
  const now = new Date(); const cm = now.getMonth() + 1; const cy = now.getFullYear() % 100;
  return y > cy || (y === cy && m >= cm);
}

function PixPendingStep({ amount, currency, onConfirmed, onBack }: { amount: number; currency: CurrencyConfig; onConfirmed: () => void; onBack: () => void; }) {
  const { t } = useLanguage();
  const [checking, setChecking] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => { setSecondsLeft((p) => { if (p <= 1) { if (intervalRef.current) clearInterval(intervalRef.current); return 0; } return p - 1; }); }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const mm = Math.floor(secondsLeft / 60); const ss = secondsLeft % 60;
  const timeDisplay = `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;

  async function handleCheck() { setChecking(true); await new Promise((r) => setTimeout(r, 2000)); setChecking(false); onConfirmed(); }

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="inline-flex items-center justify-center rounded-sm p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label={t("common.back")}><ArrowLeft className="h-4 w-4" /></button>
          {t("abl.awaitingPayment")}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4 mt-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning/10"><Clock className="h-7 w-7 text-warning" /></div>
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">{t("abl.awaitingDesc")}</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(amount, currency)}</p>
        </div>
        <div className="rounded-md border border-app-card-border bg-muted/30 px-4 py-2 text-center">
          <p className="text-xs text-muted-foreground">{t("abl.timeLeft")}</p>
          <p className="text-lg font-mono font-bold text-foreground">{timeDisplay}</p>
        </div>
        <p className="text-xs text-muted-foreground text-center leading-relaxed">{t("abl.autoDetect")}<br />{t("abl.checkPayment")}</p>
        <Button className="w-full" onClick={handleCheck} disabled={checking}>
          {checking ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("abl.verifying")}</> : t("abl.verifyPayment")}
        </Button>
      </div>
    </div>
  );
}

export function AddBalanceDialog({ open, onOpenChange, currency }: Props) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("amount");
  const [rawAmount, setRawAmount] = useState("");
  const [method, setMethod] = useState<"pix" | "card">("card");
  const [cardNumber, setCardNumber] = useState(""); const [cardExpiry, setCardExpiry] = useState(""); const [cardCvv, setCardCvv] = useState(""); const [cardName, setCardName] = useState("");

  const displayAmount = rawAmount ? formatCurrencyInput(rawAmount) : "0,00";
  const numAmount = parseCurrencyInput(rawAmount);
  const cardValid = useMemo(() => {
    return cardNumber.replace(/\D/g, "").length === 16 && isExpiryValid(cardExpiry) && cardCvv.replace(/\D/g, "").length === 3 && cardName.trim().length >= 2;
  }, [cardNumber, cardExpiry, cardCvv, cardName]);

  function resetCard() { setCardNumber(""); setCardExpiry(""); setCardCvv(""); setCardName(""); }
  function reset() { setStep("amount"); setRawAmount(""); setMethod("card"); resetCard(); }
  function handleClose(v: boolean) { if (!v) reset(); onOpenChange(v); }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {step === "amount" && (
          <form onSubmit={(e) => { e.preventDefault(); if (numAmount > 0) setStep("payment"); }}>
            <DialogHeader><DialogTitle>{t("abl.title")}</DialogTitle><DialogDescription>{t("abl.desc")}</DialogDescription></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label htmlFor="add-balance-amount">{t("abl.amountLabel")} ({currency.symbol})</Label><Input id="add-balance-amount" type="text" inputMode="numeric" placeholder="0,00" value={displayAmount} onChange={(e) => setRawAmount(e.target.value.replace(/\D/g, ""))} className="mt-1" autoFocus /></div>
              <div>
                <Label>{t("abl.paymentMethod")}</Label>
                <div className="flex gap-2 mt-2" role="radiogroup" aria-label={t("abl.paymentMethod")}>
                  {currency.showPix && (
                    <button type="button" role="radio" aria-checked={method === "pix"} onClick={() => setMethod("pix")} className={`flex-1 rounded-md border p-3 text-center text-sm font-medium transition-colors ${method === "pix" ? "border-primary bg-primary/5 text-primary" : "border-app-card-border text-muted-foreground hover:border-primary/40"}`}>
                      <QrCode className="mx-auto mb-1 h-5 w-5" />PIX
                    </button>
                  )}
                  <button type="button" role="radio" aria-checked={method === "card"} onClick={() => setMethod("card")} className={`flex-1 rounded-md border p-3 text-center text-sm font-medium transition-colors ${method === "card" ? "border-primary bg-primary/5 text-primary" : "border-app-card-border text-muted-foreground hover:border-primary/40"}`}>
                    <CreditCard className="mx-auto mb-1 h-5 w-5" />{t("abl.creditCard")}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={numAmount <= 0}>{t("fin.continue")}</Button>
            </div>
          </form>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <button type="button" onClick={() => { setStep("amount"); resetCard(); }} className="inline-flex items-center justify-center rounded-sm p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label={t("common.back")}><ArrowLeft className="h-4 w-4" /></button>
                {method === "pix" ? t("abl.pixPayment") : t("abl.cardPayment")}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{t("wdr.amountLabel")}: <strong>{formatCurrency(numAmount, currency)}</strong></p>
            <div className="mt-4">
              {method === "pix" ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-48 w-48 items-center justify-center rounded-md border border-app-card-border bg-muted"><QrCode className="h-24 w-24 text-muted-foreground/40" /></div>
                  <p className="text-xs text-muted-foreground text-center">{t("abl.scanQr")}</p>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => { navigator.clipboard.writeText("00020126360014BR.GOV.BCB.PIX0114mock-pix-key5204000053039865802BR"); toast.success(t("abl.pixCopied")); }}>
                    <Copy className="h-3.5 w-3.5" />{t("abl.copyPixCode")}
                  </Button>
                  <Button className="w-full" onClick={() => setStep("pix-pending")}>{t("abl.alreadyPaid")}</Button>
                </div>
              ) : (
                <form id="card-form" onSubmit={(e) => { e.preventDefault(); setStep("success"); }}>
                  <div className="space-y-3">
                    <div><Label htmlFor="card-number">{t("abl.cardNumber")}</Label><Input id="card-number" placeholder="0000 0000 0000 0000" className="mt-1" autoComplete="cc-number" inputMode="numeric" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} maxLength={19} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label htmlFor="card-expiry">{t("abl.expiry")}</Label><Input id="card-expiry" placeholder="MM/AA" className="mt-1" autoComplete="cc-exp" inputMode="numeric" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} /></div>
                      <div><Label htmlFor="card-cvv">CVV</Label><Input id="card-cvv" placeholder="000" className="mt-1" autoComplete="cc-csc" inputMode="numeric" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} maxLength={3} /></div>
                    </div>
                    <div><Label htmlFor="card-name">{t("abl.cardName")}</Label><Input id="card-name" placeholder={t("abl.cardNamePlaceholder")} className="mt-1" autoComplete="cc-name" value={cardName} onChange={(e) => setCardName(e.target.value.slice(0, 60))} maxLength={60} /></div>
                  </div>
                  <Button className="w-full mt-4" type="submit" disabled={!cardValid}>{t("abl.pay")}</Button>
                </form>
              )}
            </div>
          </>
        )}

        {step === "pix-pending" && <PixPendingStep amount={numAmount} currency={currency} onConfirmed={() => setStep("success")} onBack={() => setStep("payment")} />}

        {step === "success" && (
          <form onSubmit={(e) => { e.preventDefault(); handleClose(false); }}>
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="h-14 w-14 text-[hsl(var(--success))]" />
              <h3 className="text-lg font-bold text-primary">{t("abl.successTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("abl.successMsg").replace("{amount}", formatCurrency(numAmount, currency))}</p>
              <Button type="submit" className="mt-2 w-full" autoFocus>{t("common.close")}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

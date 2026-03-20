import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";
import { WITHDRAW_FEE_PERCENT } from "./mock-data";
import { CheckCircle, ArrowLeft, Landmark, Send, Loader2, AlertTriangle } from "lucide-react";
import { PinStepContent } from "./PinStepContent";
import { useLanguage } from "@/i18n/LanguageContext";

type Mode = "withdraw" | "transfer";
type Step = "amount-choose" | "transfer-id" | "withdraw-summary" | "pin" | "success";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; currency: CurrencyConfig; availableBalance: number; }
interface TransferTarget { id: string; name: string; active: boolean; }

function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, ""); const cents = parseInt(digits || "0", 10);
  return `${Math.floor(cents / 100).toLocaleString("pt-BR")},${(cents % 100).toString().padStart(2, "0")}`;
}
function parseCurrencyInput(formatted: string): number { return parseInt(formatted.replace(/\D/g, "") || "0", 10) / 100; }

async function lookupFranchiseId(id: string): Promise<TransferTarget | null> {
  await new Promise((r) => setTimeout(r, 1000));
  if (id === "000000") return null;
  if (id === "999999") return { id, name: "João Silva (Inativo)", active: false };
  return { id, name: "Maria Oliveira", active: true };
}

export function WithdrawDialog({ open, onOpenChange, currency, availableBalance }: Props) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("amount-choose");
  const [mode, setMode] = useState<Mode>("withdraw");
  const [rawAmount, setRawAmount] = useState("");
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [withdrawConfirmed, setWithdrawConfirmed] = useState(false);
  const [transferId, setTransferId] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [transferTarget, setTransferTarget] = useState<TransferTarget | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const displayAmount = rawAmount ? formatCurrencyInput(rawAmount) : "0,00";
  const numAmount = parseCurrencyInput(rawAmount);
  const fee = numAmount * (WITHDRAW_FEE_PERCENT / 100);
  const netAmount = numAmount - fee;
  const exceedsBalance = numAmount > availableBalance;
  const canContinue = numAmount > 0 && !exceedsBalance && selectedMode !== null;

  function reset() { setStep("amount-choose"); setMode("withdraw"); setRawAmount(""); setSelectedMode(null); setWithdrawConfirmed(false); setTransferId(""); setTransferTarget(null); setLookupError(null); setLookingUp(false); }
  function handleClose(v: boolean) { if (!v) reset(); onOpenChange(v); }
  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) { setRawAmount(e.target.value.replace(/\D/g, "")); }
  function handleContinue() { if (!canContinue || !selectedMode) return; setMode(selectedMode); setStep(selectedMode === "withdraw" ? "withdraw-summary" : "transfer-id"); }

  async function handleLookupId(e?: React.FormEvent) {
    e?.preventDefault(); if (!transferId.trim()) return;
    setLookingUp(true); setLookupError(null); setTransferTarget(null);
    try {
      const result = await lookupFranchiseId(transferId.trim());
      if (!result) setLookupError(t("wdr.idNotFound"));
      else if (!result.active) { setTransferTarget(result); setLookupError(t("wdr.idInactive")); }
      else setTransferTarget(result);
    } catch { setLookupError(t("wdr.idLookupError")); }
    finally { setLookingUp(false); }
  }

  const canProceedTransfer = transferTarget && transferTarget.active && !lookupError;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {step === "amount-choose" && (
          <div>
            <DialogHeader>
              <DialogTitle>{t("wdr.title")}</DialogTitle>
              <DialogDescription>{t("wdr.availableBalance")} <strong>{formatCurrency(availableBalance, currency)}</strong></DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-3">
              <div>
                <Label>{t("wdr.amountLabel")} ({currency.symbol})</Label>
                <Input type="text" inputMode="numeric" placeholder="0,00" value={displayAmount} onChange={handleAmountChange} className="mt-1" autoFocus />
                {exceedsBalance && numAmount > 0 && (
                  <div className="flex items-start gap-1.5 mt-2"><AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" /><p className="text-xs text-destructive">{t("wdr.exceedsBalance")} ({formatCurrency(availableBalance, currency)}).</p></div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t("wdr.whatToDo")}</Label>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => setSelectedMode("withdraw")} className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${selectedMode === "withdraw" ? "border-primary bg-primary/5" : "border-app-card-border bg-card hover:border-primary/30"}`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Landmark className="h-4 w-4" /></div>
                    <div><p className="text-sm font-bold text-foreground">{t("wdr.withdrawToBank")}</p><p className="text-[11px] text-muted-foreground">{t("wdr.withdrawToBankSub")}</p></div>
                  </button>
                  <button type="button" onClick={() => setSelectedMode("transfer")} className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${selectedMode === "transfer" ? "border-primary bg-primary/5" : "border-app-card-border bg-card hover:border-primary/30"}`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"><Send className="h-4 w-4" /></div>
                    <div><p className="text-sm font-bold text-foreground">{t("wdr.transferToId")}</p><p className="text-[11px] text-muted-foreground">{t("wdr.transferToIdSub")}</p></div>
                  </button>
                </div>
              </div>
              <Button className="w-full" disabled={!canContinue} onClick={handleContinue}>{t("fin.continue")}</Button>
            </div>
          </div>
        )}

        {step === "withdraw-summary" && (
          <div>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <button type="button" onClick={() => { setStep("amount-choose"); setWithdrawConfirmed(false); }} className="inline-flex items-center justify-center rounded-sm p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label={t("common.back")}><ArrowLeft className="h-4 w-4" /></button>
                {t("wdr.withdrawSummary")}
              </DialogTitle>
              <DialogDescription>{t("wdr.checkValues")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-3">
              <div className="rounded-md border border-app-card-border p-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("wdr.requestedAmount")}</span><span>{formatCurrency(numAmount, currency)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("wdr.fee")} ({WITHDRAW_FEE_PERCENT}%)</span><span className="text-destructive">-{formatCurrency(fee, currency)}</span></div>
                <div className="border-t border-border/40 pt-1.5 flex justify-between font-bold"><span>{t("wdr.youWillReceive")}</span><span className="text-primary">{formatCurrency(netAmount, currency)}</span></div>
              </div>
              <div className="flex items-start gap-2.5">
                <Checkbox id="confirm-withdraw" checked={withdrawConfirmed} onCheckedChange={(v) => setWithdrawConfirmed(v === true)} className="mt-0.5" />
                <label htmlFor="confirm-withdraw" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                  {t("wdr.confirmWithdraw")} <strong className="text-destructive font-semibold">{t("fin.irreversible")}</strong>.
                </label>
              </div>
              <Button className="w-full" disabled={!withdrawConfirmed} onClick={() => setStep("pin")}>{t("wdr.confirmWithdrawBtn")}</Button>
            </div>
          </div>
        )}

        {step === "transfer-id" && (
          <form onSubmit={handleLookupId}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <button type="button" onClick={() => { setStep("amount-choose"); setTransferTarget(null); setLookupError(null); setTransferId(""); }} className="inline-flex items-center justify-center rounded-sm p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label={t("common.back")}><ArrowLeft className="h-4 w-4" /></button>
                {t("wdr.transferToId")}
              </DialogTitle>
              <DialogDescription>{t("wdr.amountLabel")}: <strong>{formatCurrency(numAmount, currency)}</strong></DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>{t("wdr.destinationId")}</Label><Input type="text" inputMode="numeric" placeholder="000000" value={transferId} onChange={(e) => { setTransferId(e.target.value); setTransferTarget(null); setLookupError(null); }} className="mt-1" autoFocus maxLength={6} /></div>
              {transferTarget && transferTarget.active && (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm"><p className="font-medium text-primary">{transferTarget.name}</p><p className="text-xs text-muted-foreground">ID {transferTarget.id} · {t("wdr.active")}</p></div>
              )}
              {transferTarget && !transferTarget.active && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /><div className="text-sm"><p className="font-medium text-destructive">{t("wdr.inactive")}</p><p className="text-xs text-muted-foreground">{t("wdr.idInactive")}</p></div></div>
              )}
              {lookupError && !transferTarget && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /><p className="text-sm text-destructive">{lookupError}</p></div>
              )}
              <p className="text-xs text-muted-foreground">{t("wdr.idMustBeActive")}</p>
              {!transferTarget || !transferTarget.active ? (
                <Button type="submit" className="w-full" disabled={!transferId.trim() || lookingUp}>{lookingUp ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("wdr.lookingUp")}</> : t("wdr.lookupId")}</Button>
              ) : (
                <Button type="button" className="w-full" onClick={() => setStep("pin")}>{t("wdr.confirmTransfer")}</Button>
              )}
            </div>
          </form>
        )}

        {step === "pin" && (
          <PinStepContent
            description={mode === "withdraw" ? t("wdr.pinDescWithdraw") : t("wdr.pinDescTransfer")}
            onSubmit={() => setStep("success")}
            onResend={() => {}}
            onBack={() => setStep(mode === "withdraw" ? "withdraw-summary" : "transfer-id")}
          />
        )}

        {step === "success" && (
          <form onSubmit={(e) => { e.preventDefault(); handleClose(false); }}>
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="h-14 w-14 text-[hsl(var(--success))]" />
              {mode === "withdraw" ? (
                <>
                  <h3 className="text-lg font-bold text-primary">{t("wdr.withdrawConfirmed")}</h3>
                  <p className="text-sm text-muted-foreground">{t("wdr.withdrawConfirmedMsg").replace("{amount}", formatCurrency(netAmount, currency))}<br />{t("wdr.withdrawConfirmedMsg2")}</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-primary">{t("wdr.transferConfirmed")}</h3>
                  <p className="text-sm text-muted-foreground">{t("wdr.transferConfirmedMsg").replace("{amount}", formatCurrency(numAmount, currency))}</p>
                  {transferTarget && (
                    <div className="rounded-md border border-app-card-border p-3 w-full space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">{t("fin.value")}</span><span className="font-bold text-primary">{formatCurrency(numAmount, currency)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{t("wdr.recipient")}</span><span className="font-medium">{transferTarget.name}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">ID</span><span>{transferTarget.id}</span></div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{t("wdr.confirmEmailSent")}</p>
                </>
              )}
              <Button type="submit" className="mt-2 w-full" autoFocus>{t("common.close")}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

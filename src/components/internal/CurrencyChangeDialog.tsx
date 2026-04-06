import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CurrencyChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCurrency: "BRL" | "EUR" | "USD";
  franchiseeFullName: string;
  franchiseId: string;
  bonusAmount: number;
  walletBalance: number;
}

const currencyMeta: Record<string, { label: string; symbol: string; locale: string }> = {
  BRL: { label: "Real (BRL)", symbol: "R$", locale: "pt-BR" },
  EUR: { label: "Euro (EUR)", symbol: "€", locale: "de-DE" },
  USD: { label: "Dólar (USD)", symbol: "US$", locale: "en-US" },
};

/** Mock exchange rates relative to BRL */
const ratesFromBRL: Record<string, number> = { BRL: 1, USD: 0.18, EUR: 0.16 };

function getRate(from: string, to: string): number {
  return ratesFromBRL[to] / ratesFromBRL[from];
}

function fmt(value: number, code: string): string {
  const m = currencyMeta[code];
  return new Intl.NumberFormat(m.locale, { style: "currency", currency: code, minimumFractionDigits: 2 }).format(value);
}

const EXPIRY_SECONDS = 300; // 5 minutes

export function CurrencyChangeDialog({
  open, onOpenChange, currentCurrency, franchiseeFullName, franchiseId,
  bonusAmount, walletBalance,
}: CurrencyChangeDialogProps) {
  const [targetCurrency, setTargetCurrency] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(EXPIRY_SECONDS);
    setExpired(false);
    setConfirmed(false);
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setExpired(true);
          setConfirmed(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Start timer when a target currency is selected
  useEffect(() => {
    if (targetCurrency) {
      startTimer();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSecondsLeft(EXPIRY_SECONDS);
      setExpired(false);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [targetCurrency, startTimer]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTargetCurrency("");
      setConfirmed(false);
      setExpired(false);
      setSecondsLeft(EXPIRY_SECONDS);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
  }, [open]);

  const rate = targetCurrency ? getRate(currentCurrency, targetCurrency) : 0;
  const convertedBonus = bonusAmount * rate;
  const convertedWallet = walletBalance * rate;

  const mm = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const canConfirm = !!targetCurrency && confirmed && !expired;

  const handleConfirm = () => {
    setShowSuccess(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    onOpenChange(false);
  };
  };

  const handleRecalculate = () => {
    startTimer();
  };

  const availableCurrencies = (["BRL", "EUR", "USD"] as const).filter(c => c !== currentCurrency);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Alteração de Moeda</DialogTitle>
          <DialogDescription>
            Altere a moeda da franquia ID {franchiseId} · <span className="font-medium text-foreground">{franchiseeFullName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Current currency info */}
          <div className="rounded-lg border bg-muted/40 p-3 space-y-1.5 text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Moeda atual · <span className="text-foreground normal-case">{currencyMeta[currentCurrency].label}</span></p>
            <hr className="border-border/50 mt-1.5" />
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <p className="text-[10px] text-muted-foreground">Bônus a receber</p>
                <p className="text-sm font-semibold text-foreground">{fmt(bonusAmount, currentCurrency)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Saldo em carteira</p>
                <p className="text-sm font-semibold text-foreground">{fmt(walletBalance, currentCurrency)}</p>
              </div>
            </div>
          </div>

          {/* Target currency selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Nova moeda</label>
            <Select value={targetCurrency} onValueChange={v => { setTargetCurrency(v); setConfirmed(false); }}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Selecione a nova moeda" />
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies.map(c => (
                  <SelectItem key={c} value={c}>{currencyMeta[c].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conversion preview — only shown after selection */}
          {targetCurrency && (
            <>
              {/* Exchange rate - outside card */}
              <p className="text-xs text-muted-foreground text-center">
                Taxa de conversão: <span className="font-semibold text-foreground">{fmt(1, currentCurrency)} ≈ {fmt(rate, targetCurrency)}</span>
              </p>

              {/* New currency card - identical to current */}
              <div className="rounded-lg border bg-muted/40 p-3 space-y-1.5 text-center">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nova moeda · <span className="text-foreground normal-case">{currencyMeta[targetCurrency].label}</span></p>
                <hr className="border-border/50 mt-1.5" />
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Bônus a receber</p>
                    <p className="text-sm font-semibold text-foreground">{fmt(convertedBonus, targetCurrency)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Saldo em carteira</p>
                    <p className="text-sm font-semibold text-foreground">{fmt(convertedWallet, targetCurrency)}</p>
                  </div>
                </div>
              </div>

              {/* Timer hint */}
              <div className={cn(
                "flex flex-col items-center gap-0.5 rounded-md border px-3 py-2.5 text-xs text-center",
                expired
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              )}>
                {expired ? (
                  <>
                    <span className="inline-flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0" />Prazo expirado. Os valores precisam ser recalculados.</span>
                    <button
                      onClick={handleRecalculate}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-800 underline underline-offset-2 hover:text-red-900 shrink-0"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Recalcular
                    </button>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0" />Os valores apresentados expiram em <span className="font-semibold">{mm(secondsLeft)}</span>.</span>
                    <span>Valide com o franqueado antes de confirmar.</span>
                  </>
                )}
              </div>

              {/* Confirmation checkbox */}
              <label className={cn(
                "flex items-start gap-2.5 rounded-md border px-3 py-2.5 cursor-pointer transition-colors",
                expired ? "opacity-50 pointer-events-none border-border" : "border-border hover:bg-accent/30"
              )}>
                <Checkbox
                  checked={confirmed}
                  onCheckedChange={v => setConfirmed(!!v)}
                  disabled={expired}
                  className="mt-0.5"
                />
                <span className="text-xs text-foreground leading-relaxed">
                  Confirmo que os valores foram apresentados ao franqueado e aprovados para alteração de moeda.
                </span>
              </label>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={!canConfirm} onClick={handleConfirm}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Success confirmation popup */}
    <Dialog open={showSuccess} onOpenChange={handleCloseSuccess}>
      <DialogContent className="sm:max-w-[380px] text-center">
        <DialogHeader className="items-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
          <DialogTitle>Moeda alterada com sucesso</DialogTitle>
          <DialogDescription className="pt-1">
            A moeda da franquia foi alterada de {currencyMeta[currentCurrency].label} para {targetCurrency ? currencyMeta[targetCurrency].label : ""}.
            {"\n"}A partir de agora, todas as transações serão realizadas na nova moeda.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center pt-2">
          <Button onClick={handleCloseSuccess}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

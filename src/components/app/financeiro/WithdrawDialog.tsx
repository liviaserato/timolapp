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

type Mode = "withdraw" | "transfer";
type Step = "amount-choose" | "transfer-id" | "withdraw-summary" | "pin" | "success";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: CurrencyConfig;
  availableBalance: number;
}

interface TransferTarget {
  id: string;
  name: string;
  active: boolean;
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

async function lookupFranchiseId(id: string): Promise<TransferTarget | null> {
  await new Promise((r) => setTimeout(r, 1000));
  if (id === "000000") return null;
  if (id === "999999") return { id, name: "João Silva (Inativo)", active: false };
  return { id, name: "Maria Oliveira", active: true };
}

export function WithdrawDialog({ open, onOpenChange, currency, availableBalance }: Props) {
  const [step, setStep] = useState<Step>("amount-choose");
  const [mode, setMode] = useState<Mode>("withdraw");
  const [rawAmount, setRawAmount] = useState("");
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [withdrawConfirmed, setWithdrawConfirmed] = useState(false);

  // Transfer state
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

  function reset() {
    setStep("amount-choose");
    setMode("withdraw");
    setRawAmount("");
    setSelectedMode(null);
    setWithdrawConfirmed(false);
    setTransferId("");
    setTransferTarget(null);
    setLookupError(null);
    setLookingUp(false);
  }

  function handleClose(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRawAmount(e.target.value.replace(/\D/g, ""));
  }

  function handleContinue() {
    if (!canContinue || !selectedMode) return;
    setMode(selectedMode);
    if (selectedMode === "withdraw") {
      setStep("withdraw-summary");
    } else {
      setStep("transfer-id");
    }
  }

  async function handleLookupId(e?: React.FormEvent) {
    e?.preventDefault();
    if (!transferId.trim()) return;
    setLookingUp(true);
    setLookupError(null);
    setTransferTarget(null);
    try {
      const result = await lookupFranchiseId(transferId.trim());
      if (!result) {
        setLookupError("ID não encontrado. Verifique o número e tente novamente.");
      } else if (!result.active) {
        setTransferTarget(result);
        setLookupError("Este ID está inativo. Não é possível transferir saldo para um ID inativo.");
      } else {
        setTransferTarget(result);
      }
    } catch {
      setLookupError("Erro ao consultar o ID. Tente novamente.");
    } finally {
      setLookingUp(false);
    }
  }

  const canProceedTransfer = transferTarget && transferTarget.active && !lookupError;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {/* Step 1: Amount + Choose mode */}
        {step === "amount-choose" && (
          <div>
            <DialogHeader>
              <DialogTitle>Resgatar / Transferir</DialogTitle>
              <DialogDescription>
                Saldo disponível: <strong>{formatCurrency(availableBalance, currency)}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-3">
              <div>
                <Label>Valor ({currency.symbol})</Label>
                <Input
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
                      O valor excede o saldo disponível ({formatCurrency(availableBalance, currency)}).
                    </p>
                  </div>
                )}
              </div>

              {/* Mode selection */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">O que deseja fazer?</Label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMode("withdraw")}
                    className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                      selectedMode === "withdraw"
                        ? "border-primary bg-primary/5"
                        : "border-app-card-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Landmark className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Resgatar para conta bancária</p>
                      <p className="text-[11px] text-muted-foreground">Transferir para sua conta cadastrada</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMode("transfer")}
                    className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                      selectedMode === "transfer"
                        ? "border-primary bg-primary/5"
                        : "border-app-card-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Send className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Transferir para outro ID</p>
                      <p className="text-[11px] text-muted-foreground">O ID recebedor precisa estar ativo</p>
                    </div>
                  </button>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={!canContinue}
                onClick={handleContinue}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step: Withdraw Summary */}
        {step === "withdraw-summary" && (
          <div>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setStep("amount-choose"); setWithdrawConfirmed(false); }}
                  className="inline-flex items-center justify-center rounded-sm p-1 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                Resumo do Resgate
              </DialogTitle>
              <DialogDescription>Confira os valores antes de confirmar</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-3">
              <div className="rounded-md border border-app-card-border p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor solicitado</span>
                  <span>{formatCurrency(numAmount, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarifa ({WITHDRAW_FEE_PERCENT}%)</span>
                  <span className="text-destructive">-{formatCurrency(fee, currency)}</span>
                </div>
                <div className="border-t border-border/40 pt-1.5 flex justify-between font-bold">
                  <span>Você receberá</span>
                  <span className="text-primary">{formatCurrency(netAmount, currency)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="confirm-withdraw"
                  checked={withdrawConfirmed}
                  onCheckedChange={(v) => setWithdrawConfirmed(v === true)}
                  className="mt-0.5"
                />
                <label htmlFor="confirm-withdraw" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                  Confirmo que desejo resgatar o valor acima para minha conta bancária cadastrada. Sei que essa operação é{" "}
                  <strong className="text-destructive font-semibold">irreversível</strong>.
                </label>
              </div>

              <Button
                className="w-full"
                disabled={!withdrawConfirmed}
                onClick={() => setStep("pin")}
              >
                Confirmar resgate
              </Button>
            </div>
          </div>
        )}

        {/* Step: Transfer ID lookup */}
        {step === "transfer-id" && (
          <form onSubmit={handleLookupId}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setStep("amount-choose"); setTransferTarget(null); setLookupError(null); setTransferId(""); }}
                  className="inline-flex items-center justify-center rounded-sm p-1 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                Transferir para outro ID
              </DialogTitle>
              <DialogDescription>
                Valor: <strong>{formatCurrency(numAmount, currency)}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>ID de destino</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={transferId}
                  onChange={(e) => { setTransferId(e.target.value); setTransferTarget(null); setLookupError(null); }}
                  className="mt-1"
                  autoFocus
                  maxLength={6}
                />
              </div>

              {transferTarget && transferTarget.active && (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                  <p className="font-medium text-primary">{transferTarget.name}</p>
                  <p className="text-xs text-muted-foreground">ID {transferTarget.id} · Ativo</p>
                </div>
              )}

              {transferTarget && !transferTarget.active && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive">ID inativo</p>
                    <p className="text-xs text-muted-foreground">
                      Não é possível transferir saldo para este ID enquanto ele estiver inativo.
                    </p>
                  </div>
                </div>
              )}

              {lookupError && !transferTarget && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{lookupError}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                O ID recebedor precisa estar ativo para receber transferências.
              </p>

              {!transferTarget || !transferTarget.active ? (
                <Button type="submit" className="w-full" disabled={!transferId.trim() || lookingUp}>
                  {lookingUp ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Consultando...</> : "Consultar ID"}
                </Button>
              ) : (
                <Button type="button" className="w-full" onClick={() => setStep("pin")}>
                  Confirmar transferência
                </Button>
              )}
            </div>
          </form>
        )}

        {/* Step: PIN */}
        {step === "pin" && (
          <PinStepContent
            description={`Enviamos um PIN de 6 dígitos para o seu e-mail. Digite abaixo para confirmar ${mode === "withdraw" ? "o resgate" : "a transferência"}.`}
            onSubmit={() => setStep("success")}
            onResend={() => { /* TODO: call send-pin endpoint */ }}
            onBack={() => setStep(mode === "withdraw" ? "withdraw-summary" : "transfer-id")}
          />
        )}

        {/* Step: Success */}
        {step === "success" && (
          <form onSubmit={(e) => { e.preventDefault(); handleClose(false); }}>
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="h-14 w-14 text-[hsl(var(--success))]" />

              {mode === "withdraw" ? (
                <>
                  <h3 className="text-lg font-bold text-primary">Resgate Confirmado!</h3>
                  <p className="text-sm text-muted-foreground">
                    Seu resgate de <strong>{formatCurrency(netAmount, currency)}</strong> foi solicitado com sucesso.
                    <br />
                    O valor pode cair na sua conta em até 5 dias úteis.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-primary">Transferência Confirmada!</h3>
                  <p className="text-sm text-muted-foreground">
                    O valor de <strong>{formatCurrency(numAmount, currency)}</strong> foi transferido com sucesso.
                  </p>
                  {transferTarget && (
                    <div className="rounded-md border border-app-card-border p-3 w-full space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor</span>
                        <span className="font-bold text-primary">{formatCurrency(numAmount, currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destinatário</span>
                        <span className="font-medium">{transferTarget.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID</span>
                        <span>{transferTarget.id}</span>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Um e-mail de confirmação foi enviado para você.
                  </p>
                </>
              )}

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

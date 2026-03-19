import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";
import { CheckCircle, QrCode, CreditCard, ArrowLeft } from "lucide-react";

type Step = "amount" | "payment" | "success";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: CurrencyConfig;
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

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isExpiryValid(expiry: string): boolean {
  const digits = expiry.replace(/\D/g, "");
  if (digits.length !== 4) return false;
  const month = parseInt(digits.slice(0, 2), 10);
  const year = parseInt(digits.slice(2, 4), 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear() % 100;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

export function AddBalanceDialog({ open, onOpenChange, currency }: Props) {
  const [step, setStep] = useState<Step>("amount");
  const [rawAmount, setRawAmount] = useState("");
  const [method, setMethod] = useState<"pix" | "card">("card");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const displayAmount = rawAmount ? formatCurrencyInput(rawAmount) : "0,00";
  const numAmount = parseCurrencyInput(rawAmount);

  const cardValid = useMemo(() => {
    const numDigits = cardNumber.replace(/\D/g, "").length;
    const cvvDigits = cardCvv.replace(/\D/g, "").length;
    const nameValid = cardName.trim().length >= 2;
    return numDigits === 16 && isExpiryValid(cardExpiry) && cvvDigits === 3 && nameValid;
  }, [cardNumber, cardExpiry, cardCvv, cardName]);

  function resetCard() {
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
  }

  function reset() {
    setStep("amount");
    setRawAmount("");
    setMethod("card");
    resetCard();
  }

  function handleClose(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRawAmount(e.target.value.replace(/\D/g, ""));
  }

  function handleSubmitAmount(e?: React.FormEvent) {
    e?.preventDefault();
    if (numAmount > 0) setStep("payment");
  }

  function handleCardNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(formatCardNumber(raw));
  }

  function handleExpiryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardExpiry(formatExpiry(raw));
  }

  function handleCvvChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3));
  }

  function handleCardNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCardName(e.target.value.slice(0, 60));
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {step === "amount" && (
          <form onSubmit={handleSubmitAmount}>
            <DialogHeader>
              <DialogTitle>Adicionar Saldo</DialogTitle>
              <DialogDescription>Informe o valor que deseja adicionar à carteira.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label htmlFor="add-balance-amount">Valor ({currency.symbol})</Label>
                <Input
                  id="add-balance-amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div>
                <Label>Forma de pagamento</Label>
                <div className="flex gap-2 mt-2" role="radiogroup" aria-label="Forma de pagamento">
                  {currency.showPix && (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={method === "pix"}
                      onClick={() => setMethod("pix")}
                      className={`flex-1 rounded-md border p-3 text-center text-sm font-medium transition-colors ${
                        method === "pix"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-app-card-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <QrCode className="mx-auto mb-1 h-5 w-5" />
                      PIX
                    </button>
                  )}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={method === "card"}
                    onClick={() => setMethod("card")}
                    className={`flex-1 rounded-md border p-3 text-center text-sm font-medium transition-colors ${
                      method === "card"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-app-card-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <CreditCard className="mx-auto mb-1 h-5 w-5" />
                    Cartão de crédito
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={numAmount <= 0}>
                Continuar
              </Button>
            </div>
          </form>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setStep("amount"); resetCard(); }}
                  className="inline-flex items-center justify-center rounded-sm p-1 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                {method === "pix" ? "Pagamento via PIX" : "Pagamento via Cartão"}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Valor: <strong>{formatCurrency(numAmount, currency)}</strong>
            </p>
            <div className="mt-4">
              {method === "pix" ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-48 w-48 items-center justify-center rounded-md border border-app-card-border bg-muted">
                    <QrCode className="h-24 w-24 text-muted-foreground/40" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Escaneie o QR Code acima com o app do seu banco.
                  </p>
                </div>
              ) : (
                <form id="card-form" onSubmit={(e) => { e.preventDefault(); setStep("success"); }}>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="card-number">Número do cartão</Label>
                      <Input
                        id="card-number"
                        placeholder="0000 0000 0000 0000"
                        className="mt-1"
                        autoComplete="cc-number"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="card-expiry">Validade</Label>
                        <Input
                          id="card-expiry"
                          placeholder="MM/AA"
                          className="mt-1"
                          autoComplete="cc-exp"
                          inputMode="numeric"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="card-cvv">CVV</Label>
                        <Input
                          id="card-cvv"
                          placeholder="000"
                          className="mt-1"
                          autoComplete="cc-csc"
                          inputMode="numeric"
                          value={cardCvv}
                          onChange={handleCvvChange}
                          maxLength={3}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="card-name">Nome no cartão</Label>
                      <Input
                        id="card-name"
                        placeholder="Como impresso no cartão"
                        className="mt-1"
                        autoComplete="cc-name"
                        value={cardName}
                        onChange={handleCardNameChange}
                        maxLength={60}
                      />
                    </div>
                  </div>
                </form>
              )}
              <Button
                className="w-full mt-4"
                type={method === "card" ? "submit" : "button"}
                form={method === "card" ? "card-form" : undefined}
                onClick={method === "pix" ? () => setStep("success") : undefined}
                disabled={method === "card" && !cardValid}
              >
                {method === "pix" ? "Já paguei" : "Pagar"}
              </Button>
            </div>
          </>
        )}

        {step === "success" && (
          <form onSubmit={(e) => { e.preventDefault(); handleClose(false); }}>
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="h-14 w-14 text-[hsl(var(--success))]" />
              <h3 className="text-lg font-bold text-primary">Saldo Adicionado!</h3>
              <p className="text-sm text-muted-foreground">
                O valor de <strong>{formatCurrency(numAmount, currency)}</strong> foi adicionado
                <br />
                com sucesso à sua carteira.
              </p>
              </p>
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

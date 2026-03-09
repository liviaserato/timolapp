import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";
import { CheckCircle, QrCode, CreditCard } from "lucide-react";

type Step = "amount" | "payment" | "success";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: CurrencyConfig;
}

export function AddBalanceDialog({ open, onOpenChange, currency }: Props) {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"pix" | "card">("card");

  const numAmount = parseFloat(amount.replace(",", ".")) || 0;

  function reset() {
    setStep("amount");
    setAmount("");
    setMethod("card");
  }

  function handleClose(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === "amount" && (
          <>
            <DialogHeader>
              <DialogTitle>Adicionar Saldo</DialogTitle>
              <DialogDescription>Informe o valor que deseja adicionar ao Banco Timol.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Valor ({currency.symbol})</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Forma de pagamento</Label>
                <div className="flex gap-2 mt-2">
                  {currency.showPix && (
                    <button
                      type="button"
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
              <Button className="w-full" disabled={numAmount <= 0} onClick={() => setStep("payment")}>
                Continuar
              </Button>
            </div>
          </>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle>{method === "pix" ? "Pagamento via PIX" : "Pagamento via Cartão"}</DialogTitle>
              <DialogDescription>
                Valor: <strong>{formatCurrency(numAmount, currency)}</strong>
              </DialogDescription>
            </DialogHeader>
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
                <div className="space-y-3">
                  <div>
                    <Label>Número do cartão</Label>
                    <Input placeholder="0000 0000 0000 0000" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Validade</Label>
                      <Input placeholder="MM/AA" className="mt-1" />
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <Input placeholder="000" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Nome no cartão</Label>
                    <Input placeholder="Como impresso no cartão" className="mt-1" />
                  </div>
                </div>
              )}
              <Button className="w-full mt-4" onClick={() => setStep("success")}>
                {method === "pix" ? "Já paguei" : "Pagar"}
              </Button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle className="h-14 w-14 text-[hsl(var(--success))]" />
            <h3 className="text-lg font-bold text-primary">Saldo Adicionado!</h3>
            <p className="text-sm text-muted-foreground">
              O valor de <strong>{formatCurrency(numAmount, currency)}</strong> foi adicionado com sucesso ao seu Banco Timol.
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

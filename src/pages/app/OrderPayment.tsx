import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OrderPaymentConfirmed from "@/components/app/pedidos/OrderPaymentConfirmed";
import OrderPaymentPending from "@/components/app/pedidos/OrderPaymentPending";
import {
  ChevronLeft,
  QrCode,
  Building2,
  CreditCard,
  Copy,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Barcode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


import visaIcon from "@/assets/credit-card-visa.svg";
import masterIcon from "@/assets/credit-card-master.svg";
import amexIcon from "@/assets/credit-card-amex.svg";
import eloIcon from "@/assets/credit-card-elo.svg";
import dinersIcon from "@/assets/credit-card-diners.svg";
import discoverIcon from "@/assets/credit-card-discover.svg";

/* ─── helpers ─── */

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function detectCardBrand(number: string): string {
  const c = number.replace(/\s/g, "");
  if (/^4/.test(c)) return "visa";
  if (/^5[1-5]/.test(c) || /^2[2-7]/.test(c)) return "mastercard";
  if (/^3[47]/.test(c)) return "amex";
  if (/^(4011|4312|4389|4514|4573|5041|5067|5090|6277|6362|6363|650|6516|6550)/.test(c)) return "elo";
  if (/^(36|38|30[0-5])/.test(c)) return "diners";
  if (/^6011|^65|^644|^645|^646|^647|^648|^649/.test(c)) return "discover";
  return "";
}

const brandIcon: Record<string, string> = {
  visa: visaIcon,
  mastercard: masterIcon,
  amex: amexIcon,
  elo: eloIcon,
  diners: dinersIcon,
  discover: discoverIcon,
};

function formatCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}

const FREE_INSTALLMENTS = 12;

function getInstallmentOptions(price: number) {
  return Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const value = price / n;
    return { n, value, hasInterest: n > FREE_INSTALLMENTS };
  });
}

const PIX_CODE =
  "00020126580014BR.GOV.BCB.PIX0136timol-pix-key@timol.com.br5204000053039865802BR5913TIMOL SISTEMA6009SAO PAULO62070503***6304ABCD";

const BOLETO_CODE = "23793.38128 60000.000003 00000.000400 1 84340000012345";

/* ─── types ─── */

interface PaymentState {
  finalTotal: number;
  grandTotal: number;
  paymentMethod: "pix" | "boleto" | "credit" | "wallet";
  pixDiscount: number;
  pickupUnit: string | null;
}

/* ─── component ─── */

export default function OrderPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PaymentState | null;

  const [loading, setLoading] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [boletoCopied, setBoletoCopied] = useState(false);
  const [screen, setScreen] = useState<"form" | "confirmed" | "pending">("form");

  // Credit card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [installments, setInstallments] = useState("1");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <CreditCard className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-muted-foreground">Dados de pagamento não encontrados.</p>
        <Button variant="outline" onClick={() => navigate("/app/pedidos/realizar")}>
          Voltar à loja
        </Button>
      </div>
    );
  }

  const { finalTotal, paymentMethod, pixDiscount, pickupUnit } = state;
  const brand = detectCardBrand(cardNumber);
  const installmentOptions = getInstallmentOptions(finalTotal);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CODE);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    } catch {}
  };

  const handleCopyBoleto = async () => {
    try {
      await navigator.clipboard.writeText(BOLETO_CODE);
      setBoletoCopied(true);
      setTimeout(() => setBoletoCopied(false), 2000);
    } catch {}
  };

  const validateCard = () => {
    const e: Record<string, string> = {};
    if (cardNumber.replace(/\s/g, "").length < 16) e.cardNumber = "Número do cartão inválido";
    if (!cardName.trim()) e.cardName = "Nome do titular obrigatório";
    if (cardExpiry.length < 5) {
      e.cardExpiry = "Validade inválida";
    } else {
      const [mm, yy] = cardExpiry.split("/").map(Number);
      const now = new Date();
      const curMonth = now.getMonth() + 1;
      const curYear = now.getFullYear() % 100;
      if (yy < curYear || (yy === curYear && mm < curMonth)) {
        e.cardExpiry = "Cartão expirado";
      }
    }
    if (cardCvv.length < 3) e.cardCvv = "CVV inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = async () => {
    if (paymentMethod === "credit" && !validateCard()) return;

    setLoading(true);
    // Simulated processing
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);

    // Credit card: simulate success; PIX/Boleto: pending
    if (paymentMethod === "credit") {
      setScreen("confirmed");
    } else {
      setScreen("pending");
    }
  };

  const methodLabel =
    paymentMethod === "pix" ? "PIX" : paymentMethod === "boleto" ? "Boleto Bancário" : paymentMethod === "wallet" ? "Saldo em carteira" : "Cartão de Crédito";

  // Wallet-only: auto-confirm
  if (paymentMethod === "wallet") {
    return <OrderPaymentConfirmed finalTotal={finalTotal} paymentMethod="credit" pickupUnit={pickupUnit} />;
  }

  if (screen === "confirmed") {
    return <OrderPaymentConfirmed finalTotal={finalTotal} paymentMethod={paymentMethod as "pix" | "boleto" | "credit"} pickupUnit={pickupUnit} />;
  }

  if (screen === "pending") {
    return (
      <OrderPaymentPending
        finalTotal={finalTotal}
        paymentMethod={paymentMethod as "pix" | "boleto" | "credit"}
        pickupUnit={pickupUnit}
        onChangePayment={() => navigate(-1)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto">
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Pagamento</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 pb-6">
        {/* Total */}
        <div className="text-center space-y-0.5">
          <p className="text-sm text-muted-foreground">{methodLabel}</p>
          <p className="text-3xl font-extrabold text-foreground tracking-tight">
            {formatCurrency(finalTotal)}
          </p>
          {pixDiscount > 0 && (
            <p className="text-xs text-green-600 font-medium">
              Desconto PIX de {formatCurrency(pixDiscount)} aplicado
            </p>
          )}
        </div>

        {/* ─── PIX ─── */}
        {paymentMethod === "pix" && (
          <Card>
            <CardContent className="pt-4 space-y-3 text-center">
              <div className="mx-auto w-40 h-40 bg-muted rounded-xl flex items-center justify-center">
                <QrCode className="h-24 w-24 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Escaneie o QR Code acima ou copie o código PIX abaixo.
              </p>
              <div className="relative bg-muted rounded p-2 text-xs font-mono break-all select-all pr-10">
                {PIX_CODE}
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="absolute right-2 top-2 p-1 rounded hover:bg-accent transition-colors"
                  title="Copiar"
                >
                  {pixCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-green-600 font-medium">Válido por 30 minutos</p>
            </CardContent>
          </Card>
        )}

        {/* ─── BOLETO ─── */}
        {paymentMethod === "boleto" && (
          <Card>
            <CardContent className="pt-4 space-y-3 text-center">
              <div className="relative mx-auto w-full h-20 bg-muted rounded-xl flex items-center justify-center">
                <Barcode className="h-12 w-full text-muted-foreground px-4" />
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-background/60"
                  title="Baixar boleto"
                >
                  <Download className="h-3.5 w-3.5" />
                  Baixar
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copie a linha digitável abaixo e pague pelo app do seu banco.
              </p>
              <div className="relative bg-muted rounded p-2 text-xs font-mono break-all select-all pr-10">
                {BOLETO_CODE}
                <button
                  type="button"
                  onClick={handleCopyBoleto}
                  className="absolute right-2 top-2 p-1 rounded hover:bg-accent transition-colors"
                  title="Copiar"
                >
                  {boletoCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Vencimento em 3 dias úteis
              </p>
            </CardContent>
          </Card>
        )}

        {/* ─── CREDIT CARD ─── */}
        {paymentMethod === "credit" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-primary">Dados do Cartão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {errors.general && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {errors.general}
                </div>
              )}

              {/* Card number */}
              <div className="space-y-1">
                <Label>Número do Cartão</Label>
                <div className="relative">
                  <Input
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCard(e.target.value))}
                    maxLength={19}
                    className="pr-14"
                  />
                  {brand && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      <img src={brandIcon[brand]} alt={brand} className="h-5" />
                    </div>
                  )}
                </div>
                {errors.cardNumber && (
                  <p className="text-xs text-destructive">{errors.cardNumber}</p>
                )}
              </div>

              {/* Card holder */}
              <div className="space-y-1">
                <Label>Nome do Titular</Label>
                <Input
                  placeholder="NOME COMO NO CARTÃO"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  maxLength={60}
                />
                {errors.cardName && (
                  <p className="text-xs text-destructive">{errors.cardName}</p>
                )}
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Validade</Label>
                  <Input
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                  />
                  {errors.cardExpiry && (
                    <p className="text-xs text-destructive">{errors.cardExpiry}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label>CVV</Label>
                  <div className="relative">
                    <Input
                      placeholder="000"
                      value={cardCvv}
                      onChange={(e) =>
                        setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      maxLength={4}
                      type={showCvv ? "text" : "password"}
                      className="pr-9"
                    />
                    <button
                      type="button"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowCvv(!showCvv)}
                      tabIndex={-1}
                    >
                      {showCvv ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.cardCvv && (
                    <p className="text-xs text-destructive">{errors.cardCvv}</p>
                  )}
                </div>
              </div>

              {/* Installments */}
              <div className="space-y-1">
                <Label>Parcelas</Label>
                <Select value={installments} onValueChange={setInstallments}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {installmentOptions.map((opt) => (
                      <SelectItem key={opt.n} value={String(opt.n)}>
                        {opt.n}x de {formatCurrency(opt.value)} sem juros
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirm button */}
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Check className="h-5 w-5" />
          )}
          {loading ? "Processando..." : "Confirmar Pagamento"}
        </Button>
      </div>
    </div>
  );
}

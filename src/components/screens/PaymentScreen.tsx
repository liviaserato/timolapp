import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WizardData } from "@/types/wizard";
import { ChevronLeft, CreditCard, QrCode, Loader2, Eye, EyeOff, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: WizardData;
  onConfirm: (paymentInfo: Partial<WizardData>) => void;
  onBack: () => void;
}

type PaymentMethod = "pix" | "credit";

const INTEREST_RATE = 0.03;
const FREE_INSTALLMENTS = 5;

function getInstallmentOptions(price: number) {
  const options = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  return options.map((n) => {
    const hasInterest = n > FREE_INSTALLMENTS;
    const value = hasInterest
      ? (price * Math.pow(1 + INTEREST_RATE, n)) / n
      : price / n;
    return { n, value, hasInterest };
  });
}

function detectCardBrand(number: string): string {
  const clean = number.replace(/\s/g, "");
  if (/^4/.test(clean)) return "visa";
  if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return "mastercard";
  if (/^3[47]/.test(clean)) return "amex";
  if (/^(4011|4312|4389|4514|4573|5041|5067|5090|6277|6362|6363|650|6516|6550)/.test(clean)) return "elo";
  return clean.length > 0 ? "other" : "";
}

const brandLabel: Record<string, string> = {
  visa: "VISA",
  mastercard: "MC",
  amex: "AMEX",
  elo: "ELO",
  other: "●●●",
};

const brandColors: Record<string, string> = {
  visa: "text-blue-600",
  mastercard: "text-red-500",
  amex: "text-blue-400",
  elo: "text-yellow-600",
  other: "text-muted-foreground",
};

const PIX_CODE = "00020126580014BR.GOV.BCB.PIX0136timol-pix-key@timol.com.br5204000053039865802BR5913TIMOL SISTEMA6009SAO PAULO62070503***6304ABCD";

export const PaymentScreen = ({ data, onConfirm, onBack }: Props) => {
  const { t } = useLanguage();
  const isBrazilian = (data.countryIso2 ?? "BR") === "BR";
  const [method, setMethod] = useState<PaymentMethod>(isBrazilian ? "pix" : "credit");
  const [installments, setInstallments] = useState("1");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pixCopied, setPixCopied] = useState(false);

  const price = data.franchisePrice ?? 0;
  const installmentOptions = getInstallmentOptions(price);
  const selectedInstallment = installmentOptions.find((o) => o.n === parseInt(installments)) ?? installmentOptions[0];

  const isEuro = ["AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES"].includes(data.countryIso2 ?? "");
  const sym = isBrazilian ? "R$" : isEuro ? "€" : "US$";
  const locale = isBrazilian ? "pt-BR" : isEuro ? "de-DE" : "en-US";

  const formatPrice = (v: number) => `${sym} ${v.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  const brand = detectCardBrand(cardNumber);

  const validate = () => {
    const e: Record<string, string> = {};
    if (method === "credit") {
      if (cardNumber.replace(/\s/g, "").length < 16) e.cardNumber = t("payment.error.cardNumber");
      if (!cardName.trim()) e.cardName = t("payment.error.cardHolder");
      if (cardExpiry.length < 5) {
        e.cardExpiry = t("payment.error.cardExpiry");
      } else {
        const [mm, yy] = cardExpiry.split("/").map(Number);
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear() % 100;
        if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
          e.cardExpiry = t("payment.error.cardExpired");
        }
      }
      if (cardCvv.length < 3) e.cardCvv = t("payment.error.cardCvv");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const last4 = cardNumber.replace(/\s/g, "").slice(-4);
      onConfirm({
        paymentMethod: method,
        cardLast4: method === "credit" ? last4 : undefined,
        cardInstallments: method === "credit" ? parseInt(installments) : undefined,
        cardHolderName: method === "credit" ? cardName.trim() : undefined,
      });
    }, 2000);
  };

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CODE);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const franchiseName = data.franchise ? t(`franchise.${data.franchise}`) : "";

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="text-center space-y-1">
        <img src="/favicon.svg" alt="Timol" className="h-10 w-10 mx-auto" />
        <h2 className="text-2xl font-bold text-primary">{t("payment.title")}</h2>
        {franchiseName && (
          <p className="text-sm font-medium">
            {t("payment.franchise.label")} <span className="text-primary font-semibold">{franchiseName}</span>
          </p>
        )}
        <p className="text-muted-foreground text-sm">
          {t("payment.total")}: <span className="font-bold text-primary text-lg">{formatPrice(price)}</span>
        </p>
      </div>

      {/* Method Selection — only show for Brazilians */}
      {isBrazilian && (
        <div className="grid grid-cols-2 gap-3" role="tablist">
          <button
            role="tab"
            aria-selected={method === "pix"}
            onClick={() => setMethod("pix")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
              method === "pix"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/50"
            )}
          >
            <QrCode className="h-7 w-7" />
            <span className="font-semibold text-sm">PIX</span>
          </button>
          <button
            role="tab"
            aria-selected={method === "credit"}
            onClick={() => setMethod("credit")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
              method === "credit"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/50"
            )}
          >
            <CreditCard className="h-7 w-7" />
            <span className="font-semibold text-sm">{t("payment.credit")}</span>
          </button>
        </div>
      )}

      {/* PIX */}
      {method === "pix" && isBrazilian && (
        <Card>
          <CardContent className="pt-4 space-y-3 text-center">
            <div className="mx-auto w-40 h-40 bg-muted rounded-xl flex items-center justify-center">
              <QrCode className="h-24 w-24 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">{t("payment.pix.scan")}</p>
            <div className="relative bg-muted rounded p-2 text-xs font-mono break-all select-all pr-10">
              {PIX_CODE}
              <button
                type="button"
                onClick={handleCopyPix}
                className="absolute right-2 top-2 p-1 rounded hover:bg-accent transition-colors"
                title="Copiar"
              >
                {pixCopied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
            <p className="text-xs text-green-600 font-medium">{t("payment.pix.expiry")}</p>
          </CardContent>
        </Card>
      )}

      {/* Credit Card */}
      {method === "credit" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("payment.credit.details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>{t("payment.card.number")}</Label>
              <div className="relative">
                <Input
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCard(e.target.value))}
                  maxLength={19}
                  className="pr-14"
                />
                {brand && (
                  <span className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold", brandColors[brand])}>
                    {brandLabel[brand]}
                  </span>
                )}
              </div>
              {errors.cardNumber && <p className="text-xs text-destructive">{errors.cardNumber}</p>}
            </div>

            <div className="space-y-1">
              <Label>{t("payment.card.holder")}</Label>
              <Input
                placeholder={t("payment.card.holder.placeholder")}
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                maxLength={60}
              />
              {errors.cardName && <p className="text-xs text-destructive">{errors.cardName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{t("payment.card.expiry")}</Label>
                <Input
                  placeholder="MM/AA"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                />
                {errors.cardExpiry && <p className="text-xs text-destructive">{errors.cardExpiry}</p>}
              </div>
              <div className="space-y-1">
                <Label>CVV</Label>
                <div className="relative">
                  <Input
                    placeholder="000"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
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
                    {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.cardCvv && <p className="text-xs text-destructive">{errors.cardCvv}</p>}
              </div>
            </div>

            {/* Installments Dropdown */}
            <div className="space-y-1">
              <Label>{t("payment.installments")}</Label>
              <Select value={installments} onValueChange={setInstallments}>
                <SelectTrigger>
                  <SelectValue placeholder={t("payment.installments.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {installmentOptions.map(({ n, value, hasInterest }) => (
                    <SelectItem key={n} value={String(n)}>
                      {n === 1
                        ? `${t("payment.installments.once")} — ${formatPrice(price)}`
                        : `${n}× ${formatPrice(value)} (${hasInterest ? t("payment.installments.fees") : t("payment.installments.nofees")})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedInstallment.n > 1 && (
                <p className="text-xs text-muted-foreground">
                  Total: {formatPrice(selectedInstallment.value * selectedInstallment.n)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack} disabled={loading} className="flex-1">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("btn.back")}
        </Button>
        <Button onClick={handleConfirm} disabled={loading} className="flex-1">
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {t("payment.confirm")}
        </Button>
      </div>
    </div>
  );
};
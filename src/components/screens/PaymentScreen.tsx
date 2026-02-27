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
import { ChevronLeft, CreditCard, QrCode, Eye, EyeOff, Copy, Check, Building2, Loader2 } from "lucide-react";
import { openWhatsAppLink } from "@/lib/whatsapp";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import visaIcon from "@/assets/credit-card-visa.svg";
import masterIcon from "@/assets/credit-card-master.svg";
import amexIcon from "@/assets/credit-card-amex.svg";
import eloIcon from "@/assets/credit-card-elo.svg";
import dinersIcon from "@/assets/credit-card-diners.svg";
import discoverIcon from "@/assets/credit-card-discover.svg";
import whatsappIcon from "@/assets/icon-logo-whatsapp.svg";

interface Props {
  data: WizardData;
  onConfirm: (paymentInfo: Partial<WizardData>) => void;
  onBack: () => void;
}

type PaymentMethod = "pix" | "credit";

const INTEREST_RATE = 0.03;
const FREE_INSTALLMENTS = 12;
const PIX_DISCOUNT = 0.05;

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
  if (/^(36|38|30[0-5])/.test(clean)) return "diners";
  if (/^6011|^65|^644|^645|^646|^647|^648|^649/.test(clean)) return "discover";
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

const allBrandKeys = ["visa", "mastercard", "amex", "elo", "diners", "discover"];

const PIX_CODE = "00020126580014BR.GOV.BCB.PIX0136timol-pix-key@timol.com.br5204000053039865802BR5913TIMOL SISTEMA6009SAO PAULO62070503***6304ABCD";

export const PaymentScreen = ({ data, onConfirm, onBack }: Props) => {
  const { t } = useLanguage();
  const isBrazilAddress = (data.countryIso2 ?? "BR") === "BR";
  const isForeigner = data.foreignerNoCpf === "true";
  const canUsePix = !isForeigner && isBrazilAddress;
  const [method, setMethod] = useState<PaymentMethod>(canUsePix ? "pix" : "credit");
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
  const isDiscountEligible = method === "pix";
  const discountedPrice = isDiscountEligible ? price * (1 - PIX_DISCOUNT) : price;
  const installmentOptions = getInstallmentOptions(price);
  const [showInPersonPopup, setShowInPersonPopup] = useState(false);

  const isEuro = ["AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES"].includes(data.countryIso2 ?? "");
  const sym = isBrazilAddress ? "R$" : isEuro ? "€" : "US$";
  const locale = isBrazilAddress ? "pt-BR" : isEuro ? "de-DE" : "en-US";

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
        <p className="text-3xl font-extrabold text-foreground tracking-tight">
          {formatPrice(discountedPrice)}
          {isDiscountEligible && price !== discountedPrice && (
            <span className="ml-2 text-sm line-through text-muted-foreground font-normal">{formatPrice(price)}</span>
          )}
        </p>
        {franchiseName && (
          <p className="text-sm font-medium text-foreground">
            {t("payment.franchise.label")} {franchiseName}
          </p>
        )}
      </div>

      {/* Method Selection — only show if PIX is available */}
      {canUsePix && (
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
      {method === "pix" && canUsePix && (
        <Card>
          <CardContent className="pt-4 space-y-3 text-center">
            <div className="mx-auto w-40 h-40 bg-muted rounded-xl flex items-center justify-center">
              <QrCode className="h-24 w-24 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">{t("payment.pix.scan.line1")}<br />{t("payment.pix.scan.line2")}</p>
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
            <button
              type="button"
              onClick={() => setShowInPersonPopup(true)}
              className="mt-2 flex items-center gap-1.5 mx-auto text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              <Building2 className="h-3.5 w-3.5" />
              {t("payment.pix.inPerson")}
            </button>
          </CardContent>
        </Card>
      )}

      {/* In-person payment dialog */}
      <Dialog open={showInPersonPopup} onOpenChange={setShowInPersonPopup}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">{t("payment.inPerson.title")}</DialogTitle>
            <DialogDescription className="text-sm">
              {t("payment.inPerson.description")}
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
            const name = data.fullName || "";
              const id = data.userId || "";
              const msg = `${t("payment.inPerson.msg1")} ${name}, ${t("payment.inPerson.msg2")} ${franchiseName}, ${t("payment.inPerson.msg3")} ${id}, ${t("payment.inPerson.msg4")} ${formatPrice(discountedPrice)} ${t("payment.inPerson.msg5")}`;
              openWhatsAppLink(msg);
              setShowInPersonPopup(false);
            }}
            className="w-full gap-2"
          >
            <img src={whatsappIcon} alt="WhatsApp" className="h-4 w-4" />
            {t("payment.inPerson.whatsapp")}
          </Button>
        </DialogContent>
      </Dialog>

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
                  className="pr-28"
                />
                {brand && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    <img src={brandIcon[brand]} alt={brand} className="h-5" />
                  </div>
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

            {/* Installments Dropdown — only for Brazilian residents */}
            {isBrazilAddress && !isForeigner && (
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
                        : `${n}× ${formatPrice(value)} (${t("payment.installments.nofees")})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack} disabled={loading} className="flex-1">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("btn.back")}
        </Button>
        <Button onClick={handleConfirm} disabled={loading} className="flex-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {t("payment.confirm")}
        </Button>
      </div>
    </div>
  );
};
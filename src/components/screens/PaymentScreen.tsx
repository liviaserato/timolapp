import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardData } from "@/types/wizard";
import { ChevronLeft, CreditCard, QrCode, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: WizardData;
  onConfirm: () => void;
  onBack: () => void;
}

type PaymentMethod = "pix" | "credit";

const installmentOptions = [1, 2, 3, 6, 12];

export const PaymentScreen = ({ data, onConfirm, onBack }: Props) => {
  const { t } = useLanguage();
  const isBrazilian = (data.countryIso2 ?? "BR") === "BR";
  const [method, setMethod] = useState<PaymentMethod>(isBrazilian ? "pix" : "credit");
  const [installments, setInstallments] = useState(1);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const price = data.franchisePrice ?? 0;
  const installmentValue = price / installments;

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (method === "credit") {
      if (cardNumber.replace(/\s/g, "").length < 16) e.cardNumber = t("payment.error.cardNumber");
      if (!cardName.trim()) e.cardName = t("payment.error.cardName");
      if (cardExpiry.length < 5) e.cardExpiry = t("payment.error.cardExpiry");
      if (cardCvv.length < 3) e.cardCvv = t("payment.error.cardCvv");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      onConfirm();
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-primary">{t("payment.title")}</h2>
        <p className="text-muted-foreground text-sm">
          {t("payment.total")}: <span className="font-bold text-primary text-lg">R$ {price.toLocaleString("pt-BR")}</span>
        </p>
      </div>

      {/* Method Selection */}
      <div className="grid grid-cols-2 gap-3" role="tablist">
        {isBrazilian && (
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
            <span className="text-xs text-muted-foreground">{t("payment.pix.discount")}</span>
          </button>
        )}
        <button
          role="tab"
          aria-selected={method === "credit"}
          onClick={() => setMethod("credit")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
            !isBrazilian && "col-span-2",
            method === "credit"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border hover:border-primary/50"
          )}
        >
          <CreditCard className="h-7 w-7" />
          <span className="font-semibold text-sm">{t("payment.credit")}</span>
          <span className="text-xs text-muted-foreground">{t("payment.credit.sub")}</span>
        </button>
      </div>

      {/* PIX */}
      {method === "pix" && (
        <Card>
          <CardContent className="pt-4 space-y-3 text-center">
            <div className="mx-auto w-40 h-40 bg-muted rounded-xl flex items-center justify-center">
              <QrCode className="h-24 w-24 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">{t("payment.pix.scan")}</p>
            <div className="bg-muted rounded p-2 text-xs font-mono break-all select-all">
              00020126580014BR.GOV.BCB.PIX0136timol-pix-key@timol.com.br5204000053039865802BR5913TIMOL SISTEMA6009SAO PAULO62070503***6304ABCD
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
              <Input
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCard(e.target.value))}
                maxLength={19}
              />
              {errors.cardNumber && <p className="text-xs text-destructive">{errors.cardNumber}</p>}
            </div>
            <div className="space-y-1">
              <Label>{t("payment.card.name")}</Label>
              <Input
                placeholder={t("payment.card.name.placeholder")}
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
                <Input
                  placeholder="000"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                  type="password"
                />
                {errors.cardCvv && <p className="text-xs text-destructive">{errors.cardCvv}</p>}
              </div>
            </div>

            {/* Installments */}
            <div className="space-y-1">
              <Label>{t("payment.installments")}</Label>
              <div className="flex flex-wrap gap-2">
                {installmentOptions.map((n) => (
                  <button
                    key={n}
                    onClick={() => setInstallments(n)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium border transition-colors",
                      installments === n
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:border-primary/50"
                    )}
                  >
                    {n === 1
                      ? `1× R$ ${price.toLocaleString("pt-BR")}`
                      : `${n}× R$ ${installmentValue.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`}
                  </button>
                ))}
              </div>
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

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WizardData } from "@/types/wizard";
import { RefreshCw, CreditCard, Loader2 } from "lucide-react";

interface Props {
  data: WizardData;
  onConfirmed: () => void;
  onChangePayment: () => void;
}

export const PaymentPendingScreen = ({ data, onConfirmed, onChangePayment }: Props) => {
  const { t } = useLanguage();
  const [checking, setChecking] = useState(false);

  const isBrazil = (data.countryIso2 ?? "BR") === "BR";
  const isEuro = ["AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES"].includes(data.countryIso2 ?? "");
  const sym = isBrazil ? "R$" : isEuro ? "€" : "US$";
  const locale = isBrazil ? "pt-BR" : isEuro ? "de-DE" : "en-US";
  const price = data.franchisePrice ?? 0;
  const formatPrice = (v: number) =>
    `${sym} ${v.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const franchiseName = data.franchise ? t(`franchise.${data.franchise}`) : "—";
  const isPix = data.paymentMethod === "pix";
  const isForeigner = data.foreignerNoCpf === "true";

  const paymentLabel = isPix
    ? "PIX"
    : data.cardLast4
      ? `${t("paymentPending.card")} •••• ${data.cardLast4}`
      : t("paymentPending.card");

  const handleRefresh = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-xl">
        <CardContent className="flex flex-col gap-5 py-8 px-6">
          {/* Header: logo + title */}
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="Timol" className="h-10 w-10 flex-shrink-0" />
            <h2 className="text-2xl font-bold text-primary">{t("paymentPending.title")}</h2>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {t("paymentPending.statusBadge")}
            </span>
          </div>

          {/* Message based on payment method and foreigner status */}
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            {isPix && !isForeigner ? (
              <>
                <p>{t("paymentPending.pix.message")}</p>
                <p>{t("paymentPending.pix.hint")}</p>
              </>
            ) : (
              <>
                <p>{t("paymentPending.card.message")}</p>
                <p>{t("paymentPending.card.reasons")}</p>
                <p>{isForeigner ? t("paymentPending.card.hint.foreigner") : t("paymentPending.card.hint")}</p>
              </>
            )}
          </div>

          {/* Purchase details */}
          <div className="w-full bg-primary/5 rounded-xl p-4 space-y-2 text-sm">
            <DataRow label={t("paymentPending.plan")} value={<span className="font-semibold">{franchiseName}</span>} />
            <DataRow label={t("paymentPending.amount")} value={<span className="font-bold text-primary">{formatPrice(price)}</span>} />
            <DataRow label={t("paymentPending.method")} value={<span className="text-muted-foreground">{paymentLabel}</span>} />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button onClick={handleRefresh} disabled={checking} className="w-full gap-2">
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {t("paymentPending.refresh")}
            </Button>

            <Button variant="outline" onClick={onChangePayment} disabled={checking} className="w-full gap-2">
              <CreditCard className="h-4 w-4" />
              {t("paymentPending.changeMethod")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center border-b border-border/40 py-1 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

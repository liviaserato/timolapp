import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { WizardData } from "@/types/wizard";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

interface Props {
  data: WizardData;
}

export const PaymentConfirmationScreen = ({ data }: Props) => {
  const { t } = useLanguage();
  const odataId = data.franchiseId ?? "—";

  const isBrazilAddress = (data.countryIso2 ?? "BR") === "BR";
  const isEuro = ["AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES"].includes(data.countryIso2 ?? "");
  const sym = isBrazilAddress ? "R$" : isEuro ? "€" : "US$";
  const locale = isBrazilAddress ? "pt-BR" : isEuro ? "de-DE" : "en-US";
  const price = data.franchisePrice ?? 0;
  const formatPrice = (v: number) => `${sym} ${v.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const franchiseName = data.franchiseTypeCode ? t(`franchise.${data.franchiseTypeCode}`) : "—";
  const isForeigner = data.foreignerNoCpf === "true";

  // Build payment summary lines
  let paymentLine1 = "";
  let paymentLine2 = "";
  if (data.paymentMethod === "pix") {
    paymentLine1 = "PIX";
  } else if (data.paymentMethod === "credit-card" && data.cardLast4) {
    const n = data.installments ?? 1;
    paymentLine1 = `${t("paymentPending.card")} •••• ${data.cardLast4}`;
    if (n === 1) {
      paymentLine2 = isBrazilAddress ? t("paymentDone.inFull") : "";
    } else {
      const installValue = price / n;
      paymentLine2 = `${n}× ${formatPrice(installValue)}`;
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-xl text-center">
        <CardContent className="flex flex-col items-center gap-5 py-10 px-6">
          <img src={timolLogoDark} alt="Timol" className="h-12 mx-auto" />
          <h2 className="text-2xl font-bold text-primary">{t("paymentDone.title")}</h2>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            {t("paymentDone.welcomeLine1")}
            <br />
            {t("paymentDone.welcomeLine2")}
          </p>

          <div className="w-full bg-primary/5 rounded-xl p-4 space-y-2 text-sm text-left">
            <DataRow label={t("paymentDone.status")} value={<span className="font-semibold text-green-600">{t("paymentDone.active")}</span>} />
            <DataRow label={t("paymentDone.yourId")} value={<span className="font-semibold">{odataId}</span>} />
            <DataRow label={t("paymentDone.franchise")} value={<span className="font-semibold">{franchiseName}</span>} />
            <DataRow label={t("summary.price")} value={<span className="font-semibold">{formatPrice(price)}</span>} />
            {paymentLine1 && (
              <DataRow label={t("paymentDone.paymentLabel")} value={
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">{paymentLine1}</span>
                  {paymentLine2 && <p className="text-xs text-muted-foreground">{paymentLine2}</p>}
                </div>
              } />
            )}
          </div>


          <div className="text-sm text-muted-foreground leading-relaxed text-center">
            <p>{t("paymentDone.accessNow")}</p>
          </div>

          <Button
            className="w-full gap-2"
            onClick={() => window.location.href = "/login"}
          >
            <ExternalLink className="h-4 w-4" />
            {t("paymentDone.portalButton")}
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>{t("paymentDone.emailNote")}</p>
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

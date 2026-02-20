import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { WizardData } from "@/types/wizard";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  data: WizardData;
}

export const PaymentConfirmationScreen = ({ data }: Props) => {
  const { t } = useLanguage();
  const mockId = data.userId ?? String(Math.floor(100000 + Math.random() * 900000));

  const isBrazilAddress = (data.countryIso2 ?? "BR") === "BR";
  const isEuro = ["AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES"].includes(data.countryIso2 ?? "");
  const sym = isBrazilAddress ? "R$" : isEuro ? "€" : "US$";
  const locale = isBrazilAddress ? "pt-BR" : isEuro ? "de-DE" : "en-US";
  const price = data.franchisePrice ?? 0;
  const formatPrice = (v: number) => `${sym} ${v.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const franchiseName = data.franchise ? t(`franchise.${data.franchise}`) : "—";
  const isForeigner = data.foreignerNoCpf === "true";

  // Build i18n payment summary with installments
  let paymentSummary = "";
  if (data.paymentMethod === "pix") {
    paymentSummary = "PIX";
  } else if (data.paymentMethod === "credit" && data.cardLast4) {
    const n = data.cardInstallments ?? 1;
    const installValue = n > 5
      ? (price * Math.pow(1.03, n)) / n
      : price / n;
    const cardEnd = `${t("paymentDone.cardEnd")} ${data.cardLast4}`;
    const installmentText = n === 1
      ? t("paymentDone.inFull")
      : `${n}× ${formatPrice(installValue)} (${n > 5 ? t("payment.installments.fees") : t("payment.installments.nofees")})`;
    paymentSummary = `${cardEnd} — ${installmentText}`;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-xl text-center">
        <CardContent className="flex flex-col items-center gap-5 py-10 px-6">
          {/* Logo left of title */}
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="Timol" className="h-10 w-10 flex-shrink-0" />
            <h2 className="text-2xl font-bold text-primary">{t("paymentDone.title")}</h2>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto whitespace-pre-line">
            {t("paymentDone.welcome")}
          </p>

          <div className="w-full bg-primary/5 rounded-xl p-4 space-y-2 text-sm text-left">
            <DataRow label={t("paymentDone.yourId")} value={<span className="font-bold text-primary text-base">{mockId}</span>} />
            <DataRow label={t("paymentDone.franchise")} value={<span className="font-semibold">{franchiseName}</span>} />
            <DataRow label={t("paymentDone.status")} value={<span className="font-semibold text-green-600">{t("paymentDone.active")}</span>} />
            {paymentSummary && (
              <DataRow label={t("paymentDone.paymentLabel")} value={<span className="text-xs text-muted-foreground">{paymentSummary}</span>} />
            )}
          </div>


          <div className="text-sm text-muted-foreground leading-relaxed space-y-2 text-center">
            <p>{t("paymentDone.accessNow")}</p>
            <p>{t("paymentDone.sponsorContact")}</p>
          </div>

          <Button
            className="w-full gap-2"
            onClick={() => window.open("https://timolsystem.com.br", "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            timolsystem.com.br
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

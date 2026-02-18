import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { WizardData } from "@/types/wizard";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import timolLogo from "@/assets/timol-logo.svg";

interface Props {
  data: WizardData;
}

export const PaymentConfirmationScreen = ({ data }: Props) => {
  const { t } = useLanguage();
  const mockId = data.userId ?? "TML-" + Math.floor(10000 + Math.random() * 90000);

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-xl text-center">
        <CardContent className="flex flex-col items-center gap-5 py-10 px-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-14 w-14 text-success" />
            </div>
            <img
              src={timolLogo}
              alt="Timol"
              className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-white p-0.5 shadow"
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-primary">{t("paymentDone.title")}</h2>
            <p className="text-muted-foreground text-sm">{t("paymentDone.subtitle")}</p>
          </div>

          <div className="w-full bg-primary/5 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("paymentDone.yourId")}</span>
              <span className="font-bold text-primary text-base">{mockId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("paymentDone.franchise")}</span>
              <span className="font-semibold capitalize">{t(`franchise.${data.franchise}`)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("paymentDone.status")}</span>
              <span className="font-semibold text-success">{t("paymentDone.active")}</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
            <p>{t("paymentDone.instructions")}</p>
            <p className="font-medium">{t("paymentDone.emailNote")}</p>
          </div>

          <Button
            className="w-full gap-2"
            onClick={() => window.open("https://timolsystem.com.br", "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            timolsystem.com.br
          </Button>

          <p className="text-xs text-muted-foreground">{t("paymentDone.firstAccess")}</p>
        </CardContent>
      </Card>
    </div>
  );
};

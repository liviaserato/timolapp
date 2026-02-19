import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WizardData } from "@/types/wizard";
import { ChevronLeft, User, MapPin, Shield, Gem, Crown, Star } from "lucide-react";

const franchiseIcons: Record<string, React.ReactNode> = {
  bronze: <Shield className="h-4 w-4" />,
  silver: <Star className="h-4 w-4" />,
  gold: <Crown className="h-4 w-4" />,
  platinum: <Gem className="h-4 w-4" />,
};

interface Props {
  data: WizardData;
  onConfirm: () => void;
  onBack: () => void;
}

export const SummaryScreen = ({ data, onConfirm, onBack }: Props) => {
  const { t } = useLanguage();
  const [agreeRules, setAgreeRules] = useState(data.agreeRules ?? false);
  const [agreeCommunications, setAgreeCommunications] = useState(data.agreeCommunications ?? false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleConfirm = () => {
    const errs: string[] = [];
    if (!agreeRules) errs.push(t("summary.error.rules"));
    setErrors(errs);
    if (errs.length > 0) return;
    onConfirm();
  };

  const mockId = data.userId ?? String(Math.floor(100000 + Math.random() * 900000));

  // Format price based on currency
  const price = data.franchisePrice ?? 0;
  const isBrazil = (data.countryIso2 ?? "BR") === "BR";
  const isEuro = ["AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES"].includes(data.countryIso2 ?? "");
  const sym = isBrazil ? "R$" : isEuro ? "€" : "US$";
  const locale = isBrazil ? "pt-BR" : isEuro ? "de-DE" : "en-US";

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="text-center space-y-1">
        <img src="/favicon.svg" alt="Timol" className="h-10 w-10 mx-auto" />
        <h2 className="text-2xl font-bold text-primary">{t("summary.title")}</h2>
        <p className="text-muted-foreground text-sm">{t("summary.subtitle")}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("summary.personal")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <Row label={t("summary.fullName")} value={data.fullName ?? "—"} />
          <Row label="ID" value={mockId} highlight />
          <Row label={t("summary.sponsor")} value={`${data.sponsorName ?? "—"} (${data.sponsorId ?? "—"})`} />
          <Row label={t("summary.email")} value={data.email ?? "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t("summary.franchise")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <Row
            label={t("summary.franchiseChosen")}
            value={
              <span className="flex items-center gap-1.5 font-semibold text-primary">
                {franchiseIcons[data.franchise ?? "bronze"]}
                {t(`franchise.${data.franchise}`)}
              </span>
            }
          />
          <Row
            label={t("summary.price")}
            value={
              <span className="font-bold text-lg text-primary">
                {sym} {price.toLocaleString(locale)}
              </span>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agreeRules"
              checked={agreeRules}
              onCheckedChange={(v) => { setAgreeRules(!!v); setErrors([]); }}
            />
            <Label htmlFor="agreeRules" className="text-sm leading-relaxed cursor-pointer">
              {t("summary.agreeRules")}
              <a
                href="https://timolsystem.com.br/contrato"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
                onClick={(e) => e.stopPropagation()}
              >
                {t("summary.agreeRules.link")}
              </a>
              {t("summary.agreeRules.suffix")}
            </Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="agreeCommunications"
              checked={agreeCommunications}
              onCheckedChange={(v) => setAgreeCommunications(!!v)}
            />
            <Label htmlFor="agreeCommunications" className="text-sm leading-relaxed cursor-pointer">
              {t("summary.agreeCommunications")}
            </Label>
          </div>
          {errors.map((e) => (
            <p key={e} className="text-sm text-destructive">{e}</p>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("btn.back")}
        </Button>
        <Button onClick={handleConfirm} className="flex-1">
          {t("summary.confirm")}
        </Button>
      </div>
    </div>
  );
};

function Row({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-bold text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}

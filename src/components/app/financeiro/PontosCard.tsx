import { Star, Award, AlertTriangle } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { qualificationLabels } from "./mock-data";
import { useLanguage } from "@/i18n/LanguageContext";

interface Props {
  currentQualification: string;
  totalPoints: number;
  expiringPoints: number | null;
  expirationDate: string | null;
}

export function PontosCard({ currentQualification, totalPoints, expiringPoints, expirationDate }: Props) {
  const { t } = useLanguage();
  const q = qualificationLabels[currentQualification];

  const showExpirationAlert = (() => {
    if (!expiringPoints || expiringPoints <= 0 || !expirationDate) return false;
    const expDate = new Date(expirationDate);
    const now = new Date();
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  })();

  return (
    <DashboardCard icon={Star} title={t("fin.points")} tooltip={t("fin.pointsTooltip")}>
      <div className="flex-1">
        <div className="mt-3 flex flex-row sm:flex-col gap-3">
          <div className="rounded-md border border-app-card-border p-3 text-center flex-1 min-h-[72px] flex flex-col justify-center">
            <p className="text-xs text-muted-foreground">{t("fin.unilevelPoints")}</p>
            <p className="text-lg font-bold text-primary">{totalPoints.toLocaleString("pt-BR")}</p>
          </div>
          <div className="rounded-md border border-app-card-border p-3 text-center flex-1 min-h-[72px] flex flex-col justify-center">
            <p className="text-xs text-muted-foreground">{t("fin.currentQualification")}</p>
            {q && (
              <p className="mt-1 text-sm font-semibold text-primary flex items-center justify-center gap-1.5">
                <span className="text-base">{q.icon}</span>
                {q.label}
              </p>
            )}
          </div>
        </div>

        {showExpirationAlert && expiringPoints && expirationDate && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-2.5">
            <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground">
              <strong>{expiringPoints.toLocaleString("pt-BR")} {t("fin.points").toLowerCase()}</strong> {t("fin.pointsExpireAlert")}{" "}
              <strong>{new Date(expirationDate).toLocaleDateString("pt-BR")}</strong>.{" "}
              {t("fin.redeemNow")}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3">
        <Button variant="outline" size="default" className="w-full text-xs gap-2 h-8 lg:h-9" asChild>
          <a href="/app/premios">
            <Award className="h-4 w-4" />
            {t("fin.prizes")}
          </a>
        </Button>
      </div>
    </DashboardCard>
  );
}

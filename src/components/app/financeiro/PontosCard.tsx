import { Star, Award, AlertTriangle } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { qualificationLabels } from "./mock-data";

interface Props {
  currentQualification: string;
  totalPoints: number;
  expiringPoints: number | null;
  expirationDate: string | null;
}

export function PontosCard({ currentQualification, totalPoints, expiringPoints, expirationDate }: Props) {
  const q = qualificationLabels[currentQualification];

  // Check if points expire within next 30 days
  const showExpirationAlert = (() => {
    if (!expiringPoints || expiringPoints <= 0 || !expirationDate) return false;
    const expDate = new Date(expirationDate);
    const now = new Date();
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  })();

  return (
    <DashboardCard
      icon={Star}
      title="Pontos"
      tooltip="Soma dos pontos Unilevel das suas compras e da sua rede nos últimos 6 meses, conforme qualificação."
    >
      {/* Body */}
      <div className="flex-1">
        <div className="mt-3 flex flex-row sm:flex-col gap-3">
          <div className="rounded-md border border-app-card-border p-3 text-center flex-1 flex flex-col justify-center">
            <p className="text-xs text-muted-foreground">Pontos<br className="sm:hidden" /> Unilevel</p>
            <p className="text-lg font-bold text-primary">{totalPoints.toLocaleString("pt-BR")}</p>
          </div>
          <div className="rounded-md border border-app-card-border p-3 text-center flex-1 flex flex-col justify-center">
            <p className="text-xs text-muted-foreground">Qualificação<br className="sm:hidden" /> Atual</p>
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
              <strong>{expiringPoints.toLocaleString("pt-BR")} pontos</strong> expiram em{" "}
              <strong>{new Date(expirationDate).toLocaleDateString("pt-BR")}</strong>.{" "}
              Aproveite para resgatar agora!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3">
        <Button variant="outline" size="default" className="w-full gap-2 sm:h-9" asChild>
          <a href="/app/premios">
            <Award className="h-4 w-4" />
            Prêmios
          </a>
        </Button>
      </div>
    </DashboardCard>
  );
}

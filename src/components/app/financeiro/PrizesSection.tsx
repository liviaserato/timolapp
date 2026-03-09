import { useState } from "react";
import { Award, AlertTriangle } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { Prize, qualificationLabels } from "./mock-data";
import { PrizeRedeemDialog } from "./PrizeRedeemDialog";

interface Props {
  currentQualification: string;
  totalPoints: number;
  expiringPoints: number | null;
  expirationDate: string | null;
  prizes: Prize[];
}

export function PrizesSection({ currentQualification, totalPoints, expiringPoints, expirationDate, prizes }: Props) {
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const q = qualificationLabels[currentQualification];

  function handleRedeem(prize: Prize) {
    setSelectedPrize(prize);
    setDialogOpen(true);
  }

  return (
    <DashboardCard icon={Award} title="Prêmios">
      {/* Qualification + Points header */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="rounded-md border border-app-card-border p-3 text-center flex-1 min-w-[120px]">
          <p className="text-xs text-muted-foreground">Qualificação Atual</p>
          {q && (
            <p className="mt-1 text-sm font-semibold text-primary flex items-center justify-center gap-1.5">
              <span className="text-base">{q.icon}</span>
              {q.label}
            </p>
          )}
        </div>
        <div className="rounded-md border border-app-card-border p-3 text-center flex-1 min-w-[120px]">
          <p className="text-xs text-muted-foreground">Total de Pontos</p>
          <p className="text-lg font-bold text-primary">{totalPoints.toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {/* Expiring warning */}
      {expiringPoints && expiringPoints > 0 && expirationDate && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3">
          <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <strong>{expiringPoints.toLocaleString("pt-BR")} pontos</strong> expiram em{" "}
            <strong>{new Date(expirationDate).toLocaleDateString("pt-BR")}</strong>. Resgate seus prêmios antes dessa data!
          </p>
        </div>
      )}

      {/* Prizes grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prizes.map((prize) => {
          const canRedeem = totalPoints >= prize.pointsRequired;
          return (
            <div
              key={prize.id}
              className="rounded-md border border-app-card-border p-4 flex flex-col gap-2"
            >
              <div className="text-3xl text-center">{prize.imageEmoji}</div>
              <h4 className="text-sm font-bold text-primary text-center">{prize.name}</h4>
              <p className="text-xs text-muted-foreground text-center">
                {prize.pointsRequired.toLocaleString("pt-BR")} pontos
              </p>
              <p className="text-xs text-muted-foreground text-center flex-1">{prize.description}</p>
              <Button
                size="sm"
                variant={canRedeem ? "default" : "outline"}
                disabled={!canRedeem}
                className="w-full mt-1"
                onClick={() => handleRedeem(prize)}
              >
                {canRedeem ? "Quero esse" : "Pontos insuficientes"}
              </Button>
            </div>
          );
        })}
      </div>

      <PrizeRedeemDialog open={dialogOpen} onOpenChange={setDialogOpen} prize={selectedPrize} />
    </DashboardCard>
  );
}

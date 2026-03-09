import { TrendingUp } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";

interface Props {
  nextFriday: number;
  awaitingRelease: number;
  currency: CurrencyConfig;
}

export function BonusSummaryCard({ nextFriday, awaitingRelease, currency }: Props) {
  return (
    <DashboardCard
      icon={TrendingUp}
      title="Saldo de Bônus"
      tooltip="Os bônus são pagos às sextas-feiras, 14 dias após o pagamento do pedido."
    >
      <div className="mt-3 flex flex-row md:flex-col gap-3">
        <div className="rounded-md border border-app-card-border p-3 text-center flex-1 bg-primary/5">
          <p className="text-xs text-muted-foreground">Previsto para próxima sexta</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(nextFriday, currency)}</p>
        </div>
        <div className="rounded-md border border-app-card-border p-3 text-center flex-1">
          <p className="text-xs text-muted-foreground">Aguardando liberação</p>
          <p className="text-sm font-medium text-muted-foreground">{formatCurrency(awaitingRelease, currency)}</p>
        </div>
      </div>
    </DashboardCard>
  );
}

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
    <DashboardCard icon={TrendingUp} title="Saldo de Bônus">
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-app-card-border p-3 text-center">
          <p className="text-xs text-muted-foreground">Previsto para próxima sexta</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(nextFriday, currency)}</p>
        </div>
        <div className="rounded-md border border-app-card-border p-3 text-center">
          <p className="text-xs text-muted-foreground">Aguardando liberação</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(awaitingRelease, currency)}</p>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground italic">
        Os bônus são pagos às sextas-feiras, 14 dias após o pagamento do pedido.
      </p>
    </DashboardCard>
  );
}

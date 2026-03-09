import { Landmark } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";

interface Props {
  available: number;
  pendingWithdrawal: number;
  currency: CurrencyConfig;
  onAddBalance: () => void;
  onWithdraw: () => void;
}

export function BancoTimolCard({ available, pendingWithdrawal, currency, onAddBalance, onWithdraw }: Props) {
  return (
    <DashboardCard icon={Landmark} title="Banco Timol">
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-app-card-border p-3 text-center">
          <p className="text-xs text-muted-foreground">Saldo Disponível</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(available, currency)}</p>
        </div>
        {pendingWithdrawal > 0 && (
          <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-center">
            <p className="text-xs text-muted-foreground">Resgate Solicitado</p>
            <p className="text-lg font-bold text-warning">{formatCurrency(pendingWithdrawal, currency)}</p>
          </div>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onWithdraw}>
          Resgatar saldo
        </Button>
        <Button size="sm" className="flex-1" onClick={onAddBalance}>
          Adicionar saldo
        </Button>
      </div>
    </DashboardCard>
  );
}

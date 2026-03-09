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
      <div className="mt-3 flex flex-row sm:flex-col gap-3">
        <div className="rounded-md border border-app-card-border p-3 text-center flex-1 sm:min-h-[76px] flex flex-col justify-center">
          <p className="text-xs text-muted-foreground">Saldo Disponível</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(available, currency)}</p>
        </div>
        {pendingWithdrawal > 0 && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-center flex-1 sm:min-h-[68px] flex flex-col justify-center">
            <p className="text-xs text-muted-foreground">Resgate Solicitado</p>
            <p className="text-sm font-medium text-destructive">{formatCurrency(pendingWithdrawal, currency)}</p>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <Button variant="ghost" size="sm" className="flex-1 text-xs text-muted-foreground hover:text-foreground min-w-0" onClick={onWithdraw}>
          Resgatar saldo
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-xs min-w-0" onClick={onAddBalance}>
          Adicionar saldo
        </Button>
      </div>
    </DashboardCard>
  );
}

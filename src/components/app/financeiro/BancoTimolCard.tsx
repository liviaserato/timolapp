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
    <DashboardCard icon={Landmark} title="Banco">
      {/* Body */}
      <div className="flex-1">
        <div className="mt-3 flex flex-row sm:flex-col gap-3">
          <div className="rounded-md border border-app-card-border p-3 text-center flex-1 flex flex-col justify-center min-w-0">
            <p className="text-xs text-muted-foreground">Saldo<br className="lg:hidden" /> Disponível</p>
            <p className="text-lg font-bold text-primary truncate">{formatCurrency(available, currency)}</p>
          </div>
          {pendingWithdrawal > 0 && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-center flex-1 flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">Resgate<br className="lg:hidden" /> Solicitado</p>
              <p className="text-sm font-medium text-destructive">{formatCurrency(pendingWithdrawal, currency)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 lg:mt-3 flex flex-col lg:flex-row gap-1.5 lg:gap-2">
        <Button variant="outline" size="default" className="w-full text-xs min-w-0 h-8 lg:h-9" onClick={onAddBalance}>
          Adicionar saldo
        </Button>
        <Button variant="ghost" size="default" className="w-full text-xs text-muted-foreground hover:text-foreground min-w-0 h-8 lg:h-9" onClick={onWithdraw}>
          Resgatar saldo
        </Button>
      </div>
    </DashboardCard>
  );
}

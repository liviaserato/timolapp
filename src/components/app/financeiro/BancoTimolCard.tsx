import { Wallet } from "lucide-react";
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
    <DashboardCard icon={Wallet} title="Carteira" tooltip="O saldo da Carteira Timol é formado pela diferença entre o valor da venda ao cliente final e o valor pago à Timol. Esse crédito pode ser utilizado na compra de produtos ou transferido para outros IDs.">
      {/* Body */}
      <div className="flex-1">
        <div className="mt-3 flex flex-row sm:flex-col gap-3">
          <div className="rounded-md border border-app-card-border p-3 text-center flex-1 min-h-[72px] flex flex-col justify-center min-w-0">
            <p className="text-xs text-muted-foreground">Saldo<br className="lg:hidden" /> para Compras</p>
            <p className="text-lg font-bold text-primary truncate">{formatCurrency(available, currency)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 invisible">—</p>
          </div>
          {pendingWithdrawal > 0 && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-center flex-1 min-h-[72px] flex flex-col justify-center">
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
        <Button variant="outline" size="default" className="w-full text-xs min-w-0 h-8 lg:h-9" onClick={onWithdraw}>
          Resgatar / Transferir
        </Button>
      </div>
    </DashboardCard>
  );
}

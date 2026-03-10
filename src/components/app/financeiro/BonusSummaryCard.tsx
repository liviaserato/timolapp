import { TrendingUp, ArrowRightLeft } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";
import { Button } from "@/components/ui/button";

interface Props {
  nextFriday: number;
  awaitingRelease: number;
  currency: CurrencyConfig;
  onConvertBonus?: () => void;
}

export function BonusSummaryCard({ nextFriday, awaitingRelease, currency, onConvertBonus }: Props) {
  const hasBonus = nextFriday > 0 || awaitingRelease > 0;

  return (
    <DashboardCard
      icon={TrendingUp}
      title="Bônus"
      tooltip="Os bônus são pagos às sextas-feiras, 14 dias após o pagamento do pedido."
    >
      {/* Body */}
      <div className="flex-1">
        <div className="mt-3 flex flex-row sm:flex-col gap-3">
          <div className="rounded-md border border-success/30 bg-success/5 p-3 text-center flex-1 min-h-[72px] flex flex-col justify-center">
            <p className="text-xs text-muted-foreground">Próximo<br className="lg:hidden" /> pagamento</p>
            <p className="text-lg font-bold text-success">{formatCurrency(nextFriday, currency)}</p>
          </div>
          <div className="rounded-md border border-app-card-border p-3 text-center flex-1 min-h-[72px] flex flex-col justify-center">
            <p className="text-xs text-muted-foreground">Valores em<br className="lg:hidden" /> processamento</p>
            <p className="text-sm font-medium text-muted-foreground">{formatCurrency(awaitingRelease, currency)}</p>
          </div>
        </div>

        {/* Convert bonus button */}
        {hasBonus && onConvertBonus && (
          <div className="mt-3 space-y-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs gap-1.5"
              onClick={onConvertBonus}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Converter bônus em saldo
            </Button>
            <p className="text-[10px] text-muted-foreground text-center leading-tight">
              Ganhe +5% ao converter seu bônus em saldo para novos pedidos.
            </p>
          </div>
        )}
      </div>

    </DashboardCard>
  );
}

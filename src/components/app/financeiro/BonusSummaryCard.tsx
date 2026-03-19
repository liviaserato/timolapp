import { TrendingUp, ArrowRightLeft } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";
import { Button } from "@/components/ui/button";

function getNextFriday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun … 6=Sat
  const daysUntilFriday = (5 - day + 7) % 7 || 7; // if today is Friday, next Friday
  const friday = new Date(now);
  friday.setDate(now.getDate() + daysUntilFriday);
  return friday;
}

interface Props {
  nextFriday: number;
  awaitingRelease: number;
  currency: CurrencyConfig;
  onConvertBonus?: () => void;
}

export function BonusSummaryCard({ nextFriday, awaitingRelease, currency, onConvertBonus }: Props) {
  const hasBonus = nextFriday > 0 || awaitingRelease > 0;
  const nextFridayDate = getNextFriday();
  const formattedDate = nextFridayDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

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
            <p className="text-xs text-muted-foreground">Bônus a Receber</p>
            <p className="text-lg font-bold text-success">{formatCurrency(nextFriday, currency)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Pagamento: {formattedDate}</p>
          </div>
          <div className="rounded-md border border-app-card-border p-3 text-center flex-1 min-h-[72px] flex flex-col justify-center">
            <p className="text-xs text-muted-foreground">Valores em<br className="lg:hidden" /> processamento</p>
            <p className="text-sm font-medium text-muted-foreground">{formatCurrency(awaitingRelease, currency)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 invisible">—</p>
          </div>
        </div>

        {/* Convert bonus button */}
        {hasBonus && onConvertBonus && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="default"
              className="w-full text-xs gap-1.5 h-auto min-h-[2rem] lg:min-h-[2.25rem] py-1.5 whitespace-normal leading-tight"
              onClick={onConvertBonus}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Converter bônus em saldo
            </Button>
          </div>
        )}
      </div>

    </DashboardCard>
  );
}

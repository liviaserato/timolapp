import { TrendingUp, ArrowRightLeft, CalendarClock } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function getNextFriday(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
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
      <div className="flex-1">
        <div className="mt-3 flex flex-row sm:flex-col gap-3">
          <div className="rounded-md border border-success/30 bg-success/5 p-3 text-center flex-1 min-h-[72px] flex flex-col justify-center">
            <div className="flex items-center justify-center gap-1.5">
              <p className="text-xs text-muted-foreground">Bônus a Receber</p>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CalendarClock className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Pagamento em {formattedDate}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-lg font-bold text-success">{formatCurrency(nextFriday, currency)}</p>
          </div>
          <div className="rounded-md border border-app-card-border p-3 text-center flex-1 min-h-[72px] flex flex-col justify-center">
            <p className="text-xs text-muted-foreground">Valores em<br className="lg:hidden" /> processamento</p>
            <p className="text-sm font-medium text-muted-foreground">{formatCurrency(awaitingRelease, currency)}</p>
          </div>
        </div>

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

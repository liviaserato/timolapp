import { TrendingUp, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { CurrencyConfig, formatCurrency } from "./currency-helpers";
import { cn } from "@/lib/utils";

interface FranchiseStatus {
  activeUntil: string;
}

function getFranchiseStatusInfo(activeUntil: string) {
  const now = new Date();
  const expDate = new Date(activeUntil);
  const diffMs = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      level: "expired" as const,
      icon: ShieldX,
      colorClass: "text-destructive",
      message: "Sua franquia está inativa. Bônus e pontos não são gerados durante esse período. Adquira produtos para reativá-la e voltar a ganhar!",
      label: `Inativa desde ${expDate.toLocaleDateString("pt-BR")}`,
    };
  }
  if (diffDays <= 10) {
    return {
      level: "warning" as const,
      icon: ShieldAlert,
      colorClass: "text-warning",
      message: `Sua franquia vence em ${diffDays} dia${diffDays !== 1 ? "s" : ""}. Adquira produtos para renovar e continuar recebendo bônus!`,
      label: `Ativa até ${expDate.toLocaleDateString("pt-BR")}`,
    };
  }
  return {
    level: "active" as const,
    icon: ShieldCheck,
    colorClass: "text-success",
    message: "Franquia ativa para recebimento de bônus.",
    label: `Ativa até ${expDate.toLocaleDateString("pt-BR")}`,
  };
}

interface Props {
  nextFriday: number;
  awaitingRelease: number;
  currency: CurrencyConfig;
  franchiseStatus: FranchiseStatus;
}

export function BonusSummaryCard({ nextFriday, awaitingRelease, currency, franchiseStatus }: Props) {
  const status = getFranchiseStatusInfo(franchiseStatus.activeUntil);
  const StatusIcon = status.icon;

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
            <p className="text-xs text-muted-foreground">Próximo pagamento</p>
            <p className="text-lg font-bold text-success">{formatCurrency(nextFriday, currency)}</p>
          </div>
          <div className="rounded-md border border-app-card-border p-3 text-center flex-1 min-h-[72px] flex flex-col justify-center">
            <p className="text-xs text-muted-foreground">Valores em processamento</p>
            <p className="text-sm font-medium text-muted-foreground">{formatCurrency(awaitingRelease, currency)}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-start gap-2 px-1">
        <StatusIcon className={cn("h-4 w-4 shrink-0 mt-0.5", status.colorClass)} />
        <div className="min-w-0">
          <p className={cn("text-xs font-semibold", status.colorClass)}>{status.label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{status.message}</p>
        </div>
      </div>
    </DashboardCard>
  );
}

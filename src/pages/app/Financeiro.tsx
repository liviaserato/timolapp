import { useState } from "react";
import { BonusSummaryCard } from "@/components/app/financeiro/BonusSummaryCard";
import { BancoTimolCard } from "@/components/app/financeiro/BancoTimolCard";
import { PontosCard } from "@/components/app/financeiro/PontosCard";
import { AddBalanceDialog } from "@/components/app/financeiro/AddBalanceDialog";
import { WithdrawDialog } from "@/components/app/financeiro/WithdrawDialog";
import { ConvertBonusDialog } from "@/components/app/financeiro/ConvertBonusDialog";
import { BonusExtractTable } from "@/components/app/financeiro/BonusExtractTable";
import { BancoTimolExtractTable } from "@/components/app/financeiro/BancoTimolExtractTable";
import { getCurrencyConfig } from "@/components/app/financeiro/currency-helpers";
import { TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  mockBonusSummary,
  mockBancoTimol,
  mockBonusExtract,
  mockBancoTimolExtract,
  mockUserQualification,
  mockFranchiseStatus,
  type BonusExtractRow,
  type BancoTimolExtractRow,
} from "@/components/app/financeiro/mock-data";

const FRANCHISE_COUNTRY = "BR";
const FRANCHISE_CURRENCY = "BRL";

type ExtractView = "bonus" | "banco";

export default function Financeiro() {
  const currency = getCurrencyConfig(FRANCHISE_COUNTRY, FRANCHISE_CURRENCY);
  const { t } = useLanguage();
  const [addBalanceOpen, setAddBalanceOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [convertBonusOpen, setConvertBonusOpen] = useState(false);
  const [activeExtract, setActiveExtract] = useState<ExtractView>("bonus");

  const [bonusSummary, setBonusSummary] = useState(mockBonusSummary);
  const [bancoTimol, setBancoTimol] = useState(mockBancoTimol);
  const [bonusExtract, setBonusExtract] = useState<BonusExtractRow[]>(mockBonusExtract);
  const [bancoExtract, setBancoExtract] = useState<BancoTimolExtractRow[]>(mockBancoTimolExtract);

  const availableBonus = bonusSummary.nextFriday;

  function handleConvert(amount: number, bonus: number, total: number) {
    const todayStr = new Date().toISOString().slice(0, 10);
    setBonusSummary((prev) => ({ ...prev, nextFriday: Math.max(0, prev.nextFriday - amount) }));
    setBancoTimol((prev) => ({ ...prev, available: prev.available + total }));
    setBonusExtract((prev) => [
      { date: todayStr, orderNumber: "—", id: "—", qualification: "lider", type: "Depósito" as const, points: null, value: -amount },
      ...prev,
    ]);
    setBancoExtract((prev) => [
      { date: todayStr, description: "Transferência de bônus", value: amount },
      { date: todayStr, description: "Extra de transferência", value: bonus },
      ...prev,
    ]);
  }

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-primary">{t("fin.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("fin.subtitle")}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
        <BonusSummaryCard
          nextFriday={bonusSummary.nextFriday}
          awaitingRelease={bonusSummary.awaitingRelease}
          currency={currency}
          onConvertBonus={() => setConvertBonusOpen(true)}
        />
        <BancoTimolCard
          available={bancoTimol.available}
          pendingWithdrawal={bancoTimol.pendingWithdrawal}
          currency={currency}
          onAddBalance={() => setAddBalanceOpen(true)}
          onWithdraw={() => setWithdrawOpen(true)}
        />
        <PontosCard
          currentQualification={mockUserQualification.current}
          totalPoints={mockUserQualification.totalPoints}
          expiringPoints={mockUserQualification.expiringPoints}
          expirationDate={mockUserQualification.expirationDate}
        />
      </div>

      <div className="mt-6 mb-4 border-t border-app-card-border" />

      <h2 className="text-xl font-bold text-primary">{t("fin.extract")}</h2>
      <p className="text-sm text-muted-foreground mt-1 mb-3">{t("fin.extractSubtitle")}</p>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setActiveExtract("bonus")}
          className={cn(
            "flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all",
            activeExtract === "bonus"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-app-card-border bg-card hover:border-primary/30"
          )}
        >
          <div className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            activeExtract === "bonus" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className={cn("text-sm font-bold", activeExtract === "bonus" ? "text-primary" : "text-foreground")}>
              {t("fin.bonusAndPoints")}
            </p>
            <p className="text-[11px] text-muted-foreground hidden sm:block">{t("fin.bonusAndPointsSub")}</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveExtract("banco")}
          className={cn(
            "flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all",
            activeExtract === "banco"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-app-card-border bg-card hover:border-primary/30"
          )}
        >
          <div className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
           activeExtract === "banco" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <Wallet className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className={cn("text-sm font-bold", activeExtract === "banco" ? "text-primary" : "text-foreground")}>
              {t("fin.wallet")}
            </p>
            <p className="text-[11px] text-muted-foreground hidden sm:block">{t("fin.walletSub")}</p>
          </div>
        </button>
      </div>

      <div className="mt-4">
        {activeExtract === "bonus" ? (
          <BonusExtractTable data={bonusExtract} currency={currency} />
        ) : (
          <BancoTimolExtractTable data={bancoExtract} currency={currency} />
        )}
      </div>

      <AddBalanceDialog open={addBalanceOpen} onOpenChange={setAddBalanceOpen} currency={currency} />
      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        currency={currency}
        availableBalance={bancoTimol.available}
      />
      <ConvertBonusDialog
        open={convertBonusOpen}
        onOpenChange={setConvertBonusOpen}
        currency={currency}
        availableBonus={availableBonus}
        onConvert={handleConvert}
      />
    </div>
  );
}

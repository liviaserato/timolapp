import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BonusSummaryCard } from "@/components/app/financeiro/BonusSummaryCard";
import { BancoTimolCard } from "@/components/app/financeiro/BancoTimolCard";
import { AddBalanceDialog } from "@/components/app/financeiro/AddBalanceDialog";
import { WithdrawDialog } from "@/components/app/financeiro/WithdrawDialog";
import { BonusExtractTable } from "@/components/app/financeiro/BonusExtractTable";
import { BancoTimolExtractTable } from "@/components/app/financeiro/BancoTimolExtractTable";
import { PrizesSection } from "@/components/app/financeiro/PrizesSection";
import { getCurrencyConfig } from "@/components/app/financeiro/currency-helpers";
import {
  mockBonusSummary,
  mockBancoTimol,
  mockBonusExtract,
  mockBancoTimolExtract,
  mockPrizes,
  mockUserQualification,
} from "@/components/app/financeiro/mock-data";

// Mock franchise config — will come from FranchiseContext later
const FRANCHISE_COUNTRY = "BR";
const FRANCHISE_CURRENCY = "BRL";

export default function Financeiro() {
  const currency = getCurrencyConfig(FRANCHISE_COUNTRY, FRANCHISE_CURRENCY);
  const [addBalanceOpen, setAddBalanceOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  return (
    <div>
      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold text-primary">Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bônus, saldos, extratos e prêmios da sua franquia
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <BonusSummaryCard
          nextFriday={mockBonusSummary.nextFriday}
          awaitingRelease={mockBonusSummary.awaitingRelease}
          currency={currency}
        />
        <BancoTimolCard
          available={mockBancoTimol.available}
          pendingWithdrawal={mockBancoTimol.pendingWithdrawal}
          currency={currency}
          onAddBalance={() => setAddBalanceOpen(true)}
          onWithdraw={() => setWithdrawOpen(true)}
        />
      </div>

      {/* Extract Tabs */}
      <div className="mt-6">
        <Tabs defaultValue="bonus" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="bonus">Bônus e Pontos</TabsTrigger>
            <TabsTrigger value="banco">Banco Timol</TabsTrigger>
          </TabsList>
          <TabsContent value="bonus">
            <BonusExtractTable data={mockBonusExtract} currency={currency} />
          </TabsContent>
          <TabsContent value="banco">
            <BancoTimolExtractTable data={mockBancoTimolExtract} currency={currency} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Prizes */}
      <div className="mt-6">
        <PrizesSection
          currentQualification={mockUserQualification.current}
          totalPoints={mockUserQualification.totalPoints}
          expiringPoints={mockUserQualification.expiringPoints}
          expirationDate={mockUserQualification.expirationDate}
          prizes={mockPrizes}
        />
      </div>

      {/* Dialogs */}
      <AddBalanceDialog open={addBalanceOpen} onOpenChange={setAddBalanceOpen} currency={currency} />
      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        currency={currency}
        availableBalance={mockBancoTimol.available}
      />
    </div>
  );
}

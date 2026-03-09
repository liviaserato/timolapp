import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BonusSummaryCard } from "@/components/app/financeiro/BonusSummaryCard";
import { BancoTimolCard } from "@/components/app/financeiro/BancoTimolCard";
import { PontosCard } from "@/components/app/financeiro/PontosCard";
import { AddBalanceDialog } from "@/components/app/financeiro/AddBalanceDialog";
import { WithdrawDialog } from "@/components/app/financeiro/WithdrawDialog";
import { BonusExtractTable } from "@/components/app/financeiro/BonusExtractTable";
import { BancoTimolExtractTable } from "@/components/app/financeiro/BancoTimolExtractTable";
import { getCurrencyConfig } from "@/components/app/financeiro/currency-helpers";
import {
  mockBonusSummary,
  mockBancoTimol,
  mockBonusExtract,
  mockBancoTimolExtract,
  mockUserQualification,
} from "@/components/app/financeiro/mock-data";

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
          Acompanhe seus ganhos e tenha controle total do seu dinheiro
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
        <PontosCard
          currentQualification={mockUserQualification.current}
          totalPoints={mockUserQualification.totalPoints}
          expiringPoints={mockUserQualification.expiringPoints}
          expirationDate={mockUserQualification.expirationDate}
        />
      </div>

      {/* Extract Tabs */}
      <div className="mt-6">
        <Tabs defaultValue="bonus" className="w-full">
          <TabsList className="w-full grid grid-cols-2 max-w-3xl">
            <TabsTrigger value="bonus">Bônus e Pontos</TabsTrigger>
            <TabsTrigger value="banco">Banco Timol</TabsTrigger>
          </TabsList>
          <TabsContent value="bonus" className="mt-3">
            <BonusExtractTable data={mockBonusExtract} currency={currency} />
          </TabsContent>
          <TabsContent value="banco" className="mt-3">
            <BancoTimolExtractTable data={mockBancoTimolExtract} currency={currency} />
          </TabsContent>
        </Tabs>
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

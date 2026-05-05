import { useState } from "react";
import { TrendingUp, Wallet, Search, Users, ArrowDownUp, X } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { BonusExtractTable } from "@/components/app/financeiro/BonusExtractTable";
import { BancoTimolExtractTable } from "@/components/app/financeiro/BancoTimolExtractTable";
import { getCurrencyConfig, formatCurrency, CurrencyConfig } from "@/components/app/financeiro/currency-helpers";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  mockBonusExtract,
  mockBancoTimolExtract,
  type BonusExtractRow,
  type BancoTimolExtractRow,
} from "@/components/app/financeiro/mock-data";

const FRANCHISE_COUNTRY = "BR";
const FRANCHISE_CURRENCY = "BRL";

type ExtractView = "bonus" | "banco";

// Mock aggregated data for all franchisees
const mockAggregatedData = {
  totalBonusGenerated: 48520.75,
  bonusAwaitingRelease: 12340.0,
  totalWalletBalance: 156780.5,
  totalPendingWithdrawals: 8450.0,
  activeFranchisees: 342,
  totalTransactionsMonth: 1247,
};

// Mock individual franchisee lookup
const mockFranchisees: Record<string, {
  id: string;
  name: string;
  bonusGenerated: number;
  awaitingRelease: number;
  walletBalance: number;
  pendingWithdrawal: number;
  bonusExtract: BonusExtractRow[];
  walletExtract: BancoTimolExtractRow[];
}> = {
  "100231": {
    id: "100231",
    name: "Maria Silva Santos",
    bonusGenerated: 342.5,
    awaitingRelease: 128.0,
    walletBalance: 1250.0,
    pendingWithdrawal: 200.0,
    bonusExtract: mockBonusExtract,
    walletExtract: mockBancoTimolExtract,
  },
  "200587": {
    id: "200587",
    name: "João Pedro Oliveira",
    bonusGenerated: 180.0,
    awaitingRelease: 45.0,
    walletBalance: 890.0,
    pendingWithdrawal: 0,
    bonusExtract: mockBonusExtract.filter((r) => r.id === "200587"),
    walletExtract: mockBancoTimolExtract.slice(0, 3),
  },
};

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function InternalFinanceiro() {
  const currency = getCurrencyConfig(FRANCHISE_COUNTRY, FRANCHISE_CURRENCY);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFranchisee, setSelectedFranchisee] = useState<typeof mockFranchisees[string] | null>(null);
  const [activeExtract, setActiveExtract] = useState<ExtractView>("bonus");
  const [aggregatedExtract, setAggregatedExtract] = useState<ExtractView>("bonus");

  function handleSearch() {
    if (!searchQuery.trim()) {
      setSelectedFranchisee(null);
      return;
    }
    const q = normalize(searchQuery.trim());
    const found = Object.values(mockFranchisees).find(
      (f) => f.id === q || normalize(f.name).includes(q)
    );
    setSelectedFranchisee(found ?? null);
  }

  function clearSearch() {
    setSearchQuery("");
    setSelectedFranchisee(null);
  }

  const showingIndividual = !!selectedFranchisee;

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-primary">Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral financeira de todas as franquias</p>
      </header>

      {/* KPI Cards - Aggregated */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
        <DashboardCard icon={TrendingUp} title="Bônus Gerados" tooltip="Total de bônus gerados por todos os franqueados no período">
          <div className="mt-3 rounded-md border border-success/30 bg-success/5 p-3 text-center">
            <p className="text-xs text-muted-foreground">Total gerado</p>
            <p className="text-lg font-bold text-success">{formatCurrency(mockAggregatedData.totalBonusGenerated, currency)}</p>
          </div>
          <div className="mt-2 rounded-md border border-app-card-border p-3 text-center">
            <p className="text-xs text-muted-foreground">Aguardando liberação</p>
            <p className="text-sm font-medium text-muted-foreground">{formatCurrency(mockAggregatedData.bonusAwaitingRelease, currency)}</p>
          </div>
        </DashboardCard>

        <DashboardCard icon={Wallet} title="Carteira Total" tooltip="Somatório do saldo em carteira de todos os franqueados">
          <div className="mt-3 rounded-md border border-app-card-border p-3 text-center">
            <p className="text-xs text-muted-foreground">Saldo total</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(mockAggregatedData.totalWalletBalance, currency)}</p>
          </div>
          {mockAggregatedData.totalPendingWithdrawals > 0 && (
            <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-center">
              <p className="text-xs text-muted-foreground">Resgates pendentes</p>
              <p className="text-sm font-medium text-destructive">{formatCurrency(mockAggregatedData.totalPendingWithdrawals, currency)}</p>
            </div>
          )}
        </DashboardCard>

        <DashboardCard icon={Users} title="Franqueados Ativos" tooltip="Número de franqueados com franquia ativa">
          <div className="mt-3 rounded-md border border-app-card-border p-3 text-center">
            <p className="text-xs text-muted-foreground">Com carteira ativa</p>
            <p className="text-lg font-bold text-primary">{mockAggregatedData.activeFranchisees}</p>
          </div>
        </DashboardCard>

        <DashboardCard icon={ArrowDownUp} title="Movimentações" tooltip="Total de transações financeiras no mês corrente">
          <div className="mt-3 rounded-md border border-app-card-border p-3 text-center">
            <p className="text-xs text-muted-foreground">Transações no mês</p>
            <p className="text-lg font-bold text-primary">{mockAggregatedData.totalTransactionsMonth.toLocaleString("pt-BR")}</p>
          </div>
        </DashboardCard>
      </div>

      {/* Divider */}
      <div className="mt-6 mb-4 border-t border-app-card-border" />

      {/* Search by franchisee */}
      <h2 className="text-xl font-bold text-primary">Consultar Franqueado</h2>
      <p className="text-sm text-muted-foreground mt-1 mb-3">Digite o ID ou nome do franqueado para visualizar os dados financeiros individuais</p>

      <div className="flex items-center gap-2 max-w-md mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ID ou nome do franqueado..."
            className="pl-9 pr-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
              if (e.key === "Escape") clearSearch();
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Individual franchisee view */}
      {searchQuery && !selectedFranchisee && (
        <div className="rounded-md border border-app-card-border p-6 text-center text-sm text-muted-foreground">
          Nenhum franqueado encontrado. Pressione Enter para buscar.
        </div>
      )}

      {showingIndividual && (
        <div className="space-y-4">
          <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-2 flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">#{selectedFranchisee.id}</span>
            <span className="text-sm font-bold text-primary">{selectedFranchisee.name}</span>
          </div>

          {/* Individual summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DashboardCard icon={TrendingUp} title="Bônus">
              <div className="mt-3 flex flex-row sm:flex-col gap-3">
                <div className="rounded-md border border-success/30 bg-success/5 p-3 text-center flex-1">
                  <p className="text-xs text-muted-foreground">Bônus gerado</p>
                  <p className="text-lg font-bold text-success">{formatCurrency(selectedFranchisee.bonusGenerated, currency)}</p>
                </div>
                <div className="rounded-md border border-app-card-border p-3 text-center flex-1">
                  <p className="text-xs text-muted-foreground">Aguardando liberação</p>
                  <p className="text-sm font-medium text-muted-foreground">{formatCurrency(selectedFranchisee.awaitingRelease, currency)}</p>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard icon={Wallet} title="Carteira">
              <div className="mt-3 flex flex-row sm:flex-col gap-3">
                <div className="rounded-md border border-app-card-border p-3 text-center flex-1">
                  <p className="text-xs text-muted-foreground">Saldo para compras</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(selectedFranchisee.walletBalance, currency)}</p>
                </div>
                {selectedFranchisee.pendingWithdrawal > 0 && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-center flex-1">
                    <p className="text-xs text-muted-foreground">Resgate solicitado</p>
                    <p className="text-sm font-medium text-destructive">{formatCurrency(selectedFranchisee.pendingWithdrawal, currency)}</p>
                  </div>
                )}
              </div>
            </DashboardCard>
          </div>

          {/* Extract toggle */}
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
                  Bônus e Pontos
                </p>
                <p className="text-[11px] text-muted-foreground hidden sm:block">Extrato de movimentações</p>
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
                  Carteira
                </p>
                <p className="text-[11px] text-muted-foreground hidden sm:block">Extrato de saldo</p>
              </div>
            </button>
          </div>

          {/* Extract tables */}
          <div>
            {activeExtract === "bonus" ? (
              <BonusExtractTable data={selectedFranchisee.bonusExtract} currency={currency} />
            ) : (
              <BancoTimolExtractTable data={selectedFranchisee.walletExtract} currency={currency} />
            )}
          </div>
        </div>
      )}

      {!showingIndividual && (
        <>
          <div className="mt-6 mb-4 border-t border-app-card-border" />
          <h2 className="text-xl font-bold text-primary">Extrato Consolidado</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-3">Movimentações financeiras agregadas de toda a rede</p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAggregatedExtract("bonus")}
              className={cn(
                "flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all",
                aggregatedExtract === "bonus"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-app-card-border bg-card hover:border-primary/30"
              )}
            >
              <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                aggregatedExtract === "bonus" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-bold", aggregatedExtract === "bonus" ? "text-primary" : "text-foreground")}>
                  Bônus e Pontos
                </p>
                <p className="text-[11px] text-muted-foreground hidden sm:block">Extrato de movimentações</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setAggregatedExtract("banco")}
              className={cn(
                "flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all",
                aggregatedExtract === "banco"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-app-card-border bg-card hover:border-primary/30"
              )}
            >
              <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                aggregatedExtract === "banco" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Wallet className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-bold", aggregatedExtract === "banco" ? "text-primary" : "text-foreground")}>
                  Carteira
                </p>
                <p className="text-[11px] text-muted-foreground hidden sm:block">Extrato de saldo</p>
              </div>
            </button>
          </div>

          <div className="mt-4">
            {aggregatedExtract === "bonus" ? (
              <BonusExtractTable data={mockBonusExtract} currency={currency} showPerson />
            ) : (
              <BancoTimolExtractTable data={mockBancoTimolExtract} currency={currency} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

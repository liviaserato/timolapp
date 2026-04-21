import { useState, useMemo } from "react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  BarChart3, Package, ChevronRight, ChevronLeft, Info,
  Trophy, Users, AlertTriangle, RotateCcw, PackageX,
  TrendingUp, Layers,
} from "lucide-react";
import { products as mockProducts, categories } from "@/data/mock-products";

/* ════════════════════════════════════════
   Mock sales data per product (period-scoped)
   In production, this comes from the backend.
   ════════════════════════════════════════ */
interface ProductSale {
  productId: string;
  unitsSold: number;
  unitsReturned: number;
  franchiseesSelling: { id: string; name: string; units: number }[];
  lastSoldAt: string; // ISO date
  prevPeriodUnits: number; // for growth comparison
}

const mockProductSales: ProductSale[] = [
  { productId: "p1", unitsSold: 142, unitsReturned: 4, lastSoldAt: "2026-04-19", prevPeriodUnits: 98,
    franchiseesSelling: [
      { id: "100237", name: "Maria Silva", units: 28 },
      { id: "100231", name: "Lívia Serato", units: 22 },
      { id: "100232", name: "Carlos Mendes", units: 18 },
      { id: "100235", name: "Fernanda Santos", units: 14 },
      { id: "100238", name: "Juan García", units: 12 },
    ]},
  { productId: "p2", unitsSold: 98, unitsReturned: 1, lastSoldAt: "2026-04-18", prevPeriodUnits: 110,
    franchiseesSelling: [
      { id: "100231", name: "Lívia Serato", units: 19 },
      { id: "100237", name: "Maria Silva", units: 17 },
    ]},
  { productId: "p3", unitsSold: 76, unitsReturned: 2, lastSoldAt: "2026-04-15", prevPeriodUnits: 64,
    franchiseesSelling: [
      { id: "100232", name: "Carlos Mendes", units: 21 },
      { id: "100237", name: "Maria Silva", units: 14 },
    ]},
  { productId: "p4", unitsSold: 64, unitsReturned: 0, lastSoldAt: "2026-04-17", prevPeriodUnits: 40,
    franchiseesSelling: [
      { id: "100235", name: "Fernanda Santos", units: 18 },
      { id: "100238", name: "Juan García", units: 11 },
    ]},
  { productId: "p5", unitsSold: 51, unitsReturned: 3, lastSoldAt: "2026-04-12", prevPeriodUnits: 55,
    franchiseesSelling: [
      { id: "100231", name: "Lívia Serato", units: 15 },
      { id: "100233", name: "Ana Costa", units: 9 },
    ]},
  { productId: "p6", unitsSold: 32, unitsReturned: 1, lastSoldAt: "2026-04-10", prevPeriodUnits: 28,
    franchiseesSelling: [
      { id: "100237", name: "Maria Silva", units: 12 },
    ]},
  { productId: "p7", unitsSold: 18, unitsReturned: 0, lastSoldAt: "2026-04-05", prevPeriodUnits: 22,
    franchiseesSelling: [
      { id: "100232", name: "Carlos Mendes", units: 8 },
    ]},
  { productId: "p8", unitsSold: 12, unitsReturned: 0, lastSoldAt: "2026-03-28", prevPeriodUnits: 8,
    franchiseesSelling: [
      { id: "100231", name: "Lívia Serato", units: 6 },
    ]},
];

/* ── Helpers ── */
function getMonthLabel(date: Date, locale: string): string {
  const m = date.toLocaleDateString(locale, { month: "long" });
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${date.getFullYear()}`;
}

function getMonthRange(date: Date): { from: string; to: string } {
  const y = date.getFullYear();
  const m = date.getMonth();
  return { from: new Date(y, m, 1).toISOString().slice(0, 10), to: new Date(y, m + 1, 0).toISOString().slice(0, 10) };
}

/* ── Horizontal bar chart (same pattern used in RegistrationReportsTab) ── */
function HBarChart({
  items,
  barColorClass = "bg-primary/60",
  labelWidth = "w-14",
}: {
  items: { label: string; count: number; extra?: string; tooltip?: string }[];
  barColorClass?: string;
  labelWidth?: string;
}) {
  const max = Math.max(...items.map(i => i.count), 1);
  return (
    <div className="space-y-1.5">
      {items.map(({ label, count, extra, tooltip }) => {
        const pct = Math.round((count / max) * 100);
        return (
          <div key={label} className="flex items-center gap-2" title={tooltip} aria-label={tooltip}>
            <span className={`text-xs ${labelWidth} shrink-0 text-muted-foreground truncate`}>
              {extra && <span className="mr-1 font-mono text-[10px] text-muted-foreground/80">{extra}</span>}
              {label}
            </span>
            <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
              <div className={`h-full rounded ${barColorClass} transition-all`} style={{ width: `${Math.max(pct, count > 0 ? 6 : 0)}%` }} />
            </div>
            <span className="text-xs font-semibold w-10 text-right tabular-nums">{count}</span>
          </div>
        );
      })}
      {items.length === 0 && <p className="text-xs text-muted-foreground italic">—</p>}
    </div>
  );
}

export default function ProductReportsTab() {
  const dateLocale = "pt-BR";
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [dateFilterMode, setDateFilterMode] = useState<"off" | "month" | "custom">("month");
  const [monthRef, setMonthRef] = useState(new Date());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const isCurrentMonth = monthRef.getFullYear() === today.getFullYear() && monthRef.getMonth() === today.getMonth();

  /* Filter sales data by period.
     For now, mock data is treated as "current period" regardless of filter.
     In production, the API will receive date range and return scoped data. */
  const salesInPeriod = useMemo(() => {
    if (dateFilterMode === "month") {
      const range = getMonthRange(monthRef);
      return mockProductSales.filter(s => s.lastSoldAt >= range.from && s.lastSoldAt <= range.to);
    } else if (dateFilterMode === "custom") {
      let list = mockProductSales;
      if (dateFrom) list = list.filter(s => s.lastSoldAt >= dateFrom);
      if (dateTo) list = list.filter(s => s.lastSoldAt <= dateTo);
      return list;
    }
    return mockProductSales;
  }, [dateFilterMode, monthRef, dateFrom, dateTo]);

  /* ── KPIs ── */
  const totalSold = salesInPeriod.reduce((s, x) => s + x.unitsSold, 0);
  const totalReturned = salesInPeriod.reduce((s, x) => s + x.unitsReturned, 0);
  const returnRate = totalSold > 0 ? Math.round((totalReturned / totalSold) * 100 * 10) / 10 : 0;
  const outOfStockCount = mockProducts.filter(p => !p.inStock).length;
  const lowStockCount = 3; // mock — items with low (but not zero) stock
  const inactiveCount = mockProducts.filter(p => !salesInPeriod.find(s => s.productId === p.id)).length;
  const totalCatalog = mockProducts.length;
  const prevPeriodTotal = salesInPeriod.reduce((s, x) => s + x.prevPeriodUnits, 0);
  const growth = prevPeriodTotal > 0 ? Math.round(((totalSold - prevPeriodTotal) / prevPeriodTotal) * 100) : 0;

  /* Top 5 products */
  const topProducts = useMemo(() => {
    return salesInPeriod
      .slice()
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5)
      .map(s => {
        const p = mockProducts.find(p => p.id === s.productId);
        return { id: s.productId, name: p?.name ?? "—", units: s.unitsSold };
      });
  }, [salesInPeriod]);

  /* Top 5 franchisees by units sold (aggregated across products) */
  const topFranchisees = useMemo(() => {
    const map = new Map<string, { id: string; name: string; units: number }>();
    salesInPeriod.forEach(s => {
      s.franchiseesSelling.forEach(f => {
        const ex = map.get(f.id);
        if (ex) ex.units += f.units;
        else map.set(f.id, { id: f.id, name: f.name, units: f.units });
      });
    });
    return Array.from(map.values()).sort((a, b) => b.units - a.units).slice(0, 5);
  }, [salesInPeriod]);

  /* Sales by category */
  const salesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    salesInPeriod.forEach(s => {
      const p = mockProducts.find(p => p.id === s.productId);
      if (!p) return;
      const cat = categories.find(c => c.id === p.category);
      if (!cat) return;
      map.set(cat.name, (map.get(cat.name) ?? 0) + s.unitsSold);
    });
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [salesInPeriod]);

  const topCategory = salesByCategory[0]?.label ?? "—";

  /* Best growth product (vs prev period) */
  const bestGrowth = useMemo(() => {
    const ranked = salesInPeriod
      .map(s => {
        const p = mockProducts.find(p => p.id === s.productId);
        const growthPct = s.prevPeriodUnits > 0 ? Math.round(((s.unitsSold - s.prevPeriodUnits) / s.prevPeriodUnits) * 100) : 0;
        return { name: p?.name ?? "—", growthPct };
      })
      .sort((a, b) => b.growthPct - a.growthPct);
    return ranked[0];
  }, [salesInPeriod]);

  /* Stale product — longest without selling */
  const staleProduct = useMemo(() => {
    const ranked = salesInPeriod
      .slice()
      .sort((a, b) => a.lastSoldAt.localeCompare(b.lastSoldAt));
    const stale = ranked[0];
    if (!stale) return null;
    const p = mockProducts.find(p => p.id === stale.productId);
    return p ? { name: p.name, lastSoldAt: stale.lastSoldAt } : null;
  }, [salesInPeriod]);

  return (
    <div className="space-y-4">
      <DashboardCard icon={BarChart3} title="Indicadores de Produtos">
        <div className="mt-2 space-y-4">
          {/* Date filter row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border border-app-card-border overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setDateFilterMode(dateFilterMode === "month" ? "off" : "month")}
                className={`px-3 h-9 text-xs font-medium transition-colors min-w-[52px] text-center ${
                  dateFilterMode === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Mês
              </button>
              <button
                type="button"
                onClick={() => {
                  if (dateFilterMode === "custom") setDateFilterMode("off");
                  else { setDateFilterMode("custom"); setDateTo(todayStr); }
                }}
                className={`px-3 h-9 text-xs font-medium transition-colors min-w-[52px] text-center ${
                  dateFilterMode === "custom" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Período
              </button>
            </div>

            {dateFilterMode === "month" && (
              <div className="flex items-center gap-0 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonthRef(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium min-w-[120px] text-center">
                  {getMonthLabel(monthRef, dateLocale)}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { if (!isCurrentMonth) setMonthRef(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); }} disabled={isCurrentMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {dateFilterMode === "custom" && (
              <div className="flex gap-2 items-center shrink-0">
                <Input type="date" className="h-9 w-[148px] text-xs" max={todayStr} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                <span className="text-xs text-muted-foreground">até</span>
                <Input type="date" className="h-9 w-[148px] text-xs" max={todayStr} value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            )}
          </div>

          {/* 4-column KPI + Chart layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Column 1: Produtos Vendidos */}
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-app-card-border bg-muted/30 p-3 min-h-[120px] flex flex-col justify-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Produtos Vendidos</span>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex cursor-help"><Info className="h-3 w-3 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[240px] text-xs">
                      Total de unidades vendidas no período selecionado, considerando todos os produtos do catálogo.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-3xl font-bold text-foreground">{totalSold}</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-primary/70 leading-tight">vs período anterior</span>
                    <span className={`text-sm font-semibold leading-tight ${growth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {growth >= 0 ? "+" : ""}{growth}%
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 text-center">unidades comercializadas</p>
              </div>
              <div className="space-y-1.5 px-2">
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" />
                  Vendas por Categoria
                </h4>
                <HBarChart
                  items={salesByCategory}
                  barColorClass="bg-primary/60"
                  labelWidth="w-[110px]"
                />
              </div>
            </div>

            {/* Column 2: Top 5 Produtos */}
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-app-card-border bg-muted/30 p-3 min-h-[120px] flex flex-col justify-center">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <h3 className="text-xs font-semibold text-foreground text-center mb-2 cursor-help flex items-center justify-center gap-1">
                      <Trophy className="h-4 w-4 text-primary shrink-0" />
                      <span>Categoria Líder</span>
                      <Info className="h-3 w-3 text-muted-foreground shrink-0" />
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[240px] text-xs">
                    Categoria com maior número de unidades vendidas no período.
                  </TooltipContent>
                </Tooltip>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-base font-bold text-foreground text-center">{topCategory}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{salesByCategory[0]?.count ?? 0} unidades</span>
                </div>
              </div>
              <div className="space-y-1.5 px-2">
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Top 5 Produtos Vendidos</h4>
                <HBarChart
                  items={topProducts.map(p => ({ label: p.name, count: p.units, extra: p.id.toUpperCase(), tooltip: `${p.id.toUpperCase()} · ${p.name}` }))}
                  barColorClass="bg-primary/50"
                  labelWidth="w-[120px]"
                />
              </div>
            </div>

            {/* Column 3: Top 5 Franqueados */}
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-app-card-border bg-muted/30 p-3 min-h-[120px] flex flex-col justify-center">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <h3 className="text-xs font-semibold text-foreground text-center mb-2 cursor-help flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-primary shrink-0" />
                      <span>Franqueados Vendendo</span>
                      <Info className="h-3 w-3 text-muted-foreground shrink-0" />
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[240px] text-xs">
                    Quantidade de franqueados que efetuaram ao menos uma venda no período.
                  </TooltipContent>
                </Tooltip>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-foreground">{topFranchisees.length > 0 ? new Set(topFranchisees.map(f => f.id)).size : 0}</span>
                  <span className="text-xs text-muted-foreground">franqueados</span>
                </div>
              </div>
              <div className="space-y-1.5 px-2">
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Top 5 Franqueados</h4>
                <HBarChart
                  items={topFranchisees.map(f => ({ label: f.name, count: f.units, extra: f.id, tooltip: `${f.id} · ${f.name}` }))}
                  barColorClass="bg-primary/50"
                  labelWidth="w-[120px]"
                />
              </div>
            </div>

            {/* Column 4: Saúde do Catálogo */}
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-app-card-border bg-muted/30 p-3 min-h-[120px] flex flex-col justify-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Atenção no Catálogo</span>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex cursor-help"><Info className="h-3 w-3 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[240px] text-xs">
                      Produtos sem estoque ou que precisam de reposição imediata.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-red-500">{outOfStockCount}</span>
                    <p className="text-[11px] text-muted-foreground">sem estoque</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-amber-500">{lowStockCount}</span>
                    <p className="text-[11px] text-muted-foreground">estoque baixo</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 px-2">
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Indicadores Operacionais</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between py-1 px-2 rounded bg-muted/40">
                    <div className="flex items-center gap-1.5">
                      <PackageX className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Sem venda no período</span>
                    </div>
                    <span className="text-xs font-semibold tabular-nums">{inactiveCount} <span className="text-muted-foreground/70 font-normal">/ {totalCatalog}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer insights */}
          {staleProduct && (
            <p className="text-[11px] text-muted-foreground/70 pt-2 border-t border-app-card-border">
              <strong className="text-muted-foreground">Produto encalhado:</strong> {staleProduct.name} — última venda em{" "}
              {new Date(staleProduct.lastSoldAt).toLocaleDateString(dateLocale)}.{" "}
              <strong className="text-muted-foreground">Maior crescimento:</strong> {bestGrowth?.name} (+{bestGrowth?.growthPct}%).
            </p>
          )}
        </div>
      </DashboardCard>
    </div>
  );
}

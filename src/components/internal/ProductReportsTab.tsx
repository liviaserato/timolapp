import { useState, useMemo } from "react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  BarChart3, Package, ChevronRight, ChevronLeft, Info,
  Sparkles, Users, AlertTriangle, PackageX,
  Layers, Download,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* Mock — total active franchisees in the period.
   In production, comes from the backend. */
const TOTAL_ACTIVE_FRANCHISEES = 47;

/* ════════════════════════════════════════
   Sylocimol — flagship product line.
   In production, this list will be provided by the user/backend.
   ════════════════════════════════════════ */
const SYLOCIMOL_PRODUCT_IDS = new Set<string>(["p1", "p2"]);
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

/* ── Compact list (label + count, no bars) ── */
function HBarChart({
  items,
  labelWidth = "w-14",
}: {
  items: { label: string; count: number; extra?: string; tooltip?: string }[];
  barColorClass?: string;
  labelWidth?: string;
}) {
  return (
    <div className="space-y-1">
      {items.map(({ label, count, extra, tooltip }) => (
        <div
          key={label}
          className="flex items-center justify-between gap-2 py-1 px-2 rounded bg-muted/40"
          title={tooltip}
          aria-label={tooltip}
        >
          <span className={`text-xs ${labelWidth} flex-1 min-w-0 text-muted-foreground truncate`}>
            {extra && <span className="mr-1 font-mono text-[10px] text-muted-foreground/80">{extra}</span>}
            {label}
          </span>
          <span className="text-xs font-semibold tabular-nums shrink-0">{count}</span>
        </div>
      ))}
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

  /* Sylocimol — flagship product family stats */
  const sylocimolStats = useMemo(() => {
    const matching = salesInPeriod.filter(s => SYLOCIMOL_PRODUCT_IDS.has(s.productId));
    const current = matching.reduce((sum, s) => sum + s.unitsSold, 0);
    const previous = matching.reduce((sum, s) => sum + s.prevPeriodUnits, 0);
    const growthPct = previous > 0 ? Math.round(((current - previous) / previous) * 100) : (current > 0 ? 100 : 0);
    return { current, previous, growthPct };
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

  /* All sold products in the period — sorted desc */
  const allSoldProducts = useMemo(() => {
    return salesInPeriod
      .slice()
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .map(s => {
        const p = mockProducts.find(p => p.id === s.productId);
        return { id: s.productId, name: p?.name ?? "—", units: s.unitsSold, returned: s.unitsReturned };
      });
  }, [salesInPeriod]);

  /* Products without any sales in the period */
  const productsWithoutSales = useMemo(() => {
    const soldIds = new Set(salesInPeriod.map(s => s.productId));
    return mockProducts.filter(p => !soldIds.has(p.id));
  }, [salesInPeriod]);

  /* Period label for popup subtitle / PDF */
  const periodLabel = useMemo(() => {
    if (dateFilterMode === "month") return getMonthLabel(monthRef, dateLocale);
    if (dateFilterMode === "custom") {
      const f = dateFrom ? new Date(dateFrom + "T00:00:00").toLocaleDateString(dateLocale) : "—";
      const t = dateTo ? new Date(dateTo + "T00:00:00").toLocaleDateString(dateLocale) : "—";
      return `${f} até ${t}`;
    }
    return "Todos os períodos";
  }, [dateFilterMode, monthRef, dateFrom, dateTo]);

  /* Dialog states */
  const [showAllSoldDialog, setShowAllSoldDialog] = useState(false);
  const [showWithoutSalesDialog, setShowWithoutSalesDialog] = useState(false);

  /* PDF download — A4 portrait, all columns fit on the same page */
  function downloadPdf(opts: { title: string; head: string[]; body: (string | number)[][]; }) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFontSize(14);
    doc.text(opts.title, 14, 16);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Período: ${periodLabel}`, 14, 22);
    autoTable(doc, {
      head: [opts.head],
      body: opts.body,
      startY: 28,
      styles: { fontSize: 9, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [0, 56, 133], textColor: 255 },
      tableWidth: "auto",
      margin: { left: 10, right: 10 },
    });
    const safeName = opts.title.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
    doc.save(`${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

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
              <div className="rounded-lg border border-app-card-border bg-muted/30 p-3 min-h-[120px] flex flex-col justify-start">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Package className="h-4 w-4 text-primary shrink-0" />
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
                <div className="flex-1 flex flex-col justify-center">
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

            {/* Column 2: Sylocimol (linha campeã) */}
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-app-card-border bg-muted/30 p-3 min-h-[120px] flex flex-col justify-start">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-foreground">Sylocimol Vendidos</span>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex cursor-help"><Info className="h-3 w-3 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[240px] text-xs">
                      <p>Total de unidades vendidas da linha Sylocimol no período, comparado ao período anterior.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-3xl font-bold text-foreground">{sylocimolStats.current}</span>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-primary/70 leading-tight">vs período anterior</span>
                      <span className={`text-sm font-semibold leading-tight ${sylocimolStats.growthPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {sylocimolStats.growthPct >= 0 ? "+" : ""}{sylocimolStats.growthPct}%
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 text-center">{sylocimolStats.previous} no período anterior</p>
                </div>
              </div>
              <div className="space-y-1.5 px-2">
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Top 5 Produtos Vendidos</h4>
                <HBarChart
                  items={topProducts.map(p => ({ label: p.name, count: p.units, extra: p.id.toUpperCase(), tooltip: `${p.id.toUpperCase()} · ${p.name}` }))}
                  barColorClass="bg-primary/50"
                  labelWidth="w-[120px]"
                />
                {allSoldProducts.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllSoldDialog(true)}
                    className="text-[11px] text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors"
                  >
                    Ver Todos ({allSoldProducts.length})
                  </button>
                )}
              </div>
            </div>

            {/* Column 3: Top 5 Franqueados */}
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-app-card-border bg-muted/30 p-3 min-h-[120px] flex flex-col justify-start">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Users className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-foreground">Franqueados Comprando</span>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex cursor-help"><Info className="h-3 w-3 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[240px] text-xs">
                      Quantidade de franqueados que efetuaram ao menos uma venda no período, em relação ao total de franqueados ativos no mesmo período.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-foreground">{topFranchisees.length > 0 ? new Set(topFranchisees.map(f => f.id)).size : 0}</span>
                    <span className="text-xs text-muted-foreground">/ {TOTAL_ACTIVE_FRANCHISEES}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 text-center">franqueados / ativos</p>
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
              <div className="rounded-lg border border-app-card-border bg-muted/30 p-3 min-h-[120px] flex flex-col justify-start">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <AlertTriangle className="h-4 w-4 text-primary shrink-0" />
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
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-destructive">{outOfStockCount}</span>
                      <p className="text-[11px] text-muted-foreground">sem estoque</p>
                    </div>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-amber-500">{lowStockCount}</span>
                      <p className="text-[11px] text-muted-foreground">estoque baixo</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 px-2">
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">PRODUTOS SEM VENDA</h4>
                <div className="space-y-1">
                  {productsWithoutSales.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-2 py-1 px-2 rounded bg-muted/40">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <PackageX className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground truncate" title={p.name}>{p.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground/70 shrink-0 self-center leading-none">{p.id.toUpperCase()}</span>
                    </div>
                  ))}
                  {productsWithoutSales.length === 0 && (
                    <p className="text-[11px] text-muted-foreground italic px-2">Todos os produtos tiveram vendas.</p>
                  )}
                  {productsWithoutSales.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowWithoutSalesDialog(true)}
                      className="text-[11px] text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors px-2"
                    >
                      Ver Todos ({productsWithoutSales.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer insights */}
          <p className="text-[11px] text-muted-foreground/70 pt-2 border-t border-app-card-border">
            No período selecionado, {totalReturned} {totalReturned === 1 ? "item foi devolvido" : "itens foram devolvidos"}
            {totalSold > 0 && <> ({returnRate}% do total vendido)</>}.
            {staleProduct && (
              <> {" "}<strong className="text-muted-foreground">Produto encalhado:</strong> {staleProduct.name} — última venda em{" "}
              {new Date(staleProduct.lastSoldAt).toLocaleDateString(dateLocale)}.</>
            )}
          </p>
        </div>
      </DashboardCard>

      {/* Dialog: Todos os produtos vendidos no período */}
      <Dialog open={showAllSoldDialog} onOpenChange={setShowAllSoldDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="pr-10">
            <div className="flex items-start justify-between gap-2">
              <div>
                <DialogTitle>Produtos vendidos no período</DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-12 top-4 h-8 gap-1.5"
                onClick={() => downloadPdf({
                  title: "Produtos vendidos no período",
                  head: ["Código", "Produto", "Vendidos", "Devolvidos"],
                  body: allSoldProducts.map(p => [p.id.toUpperCase(), p.name, p.units, p.returned]),
                })}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="text-xs">PDF</span>
              </Button>
            </div>
          </DialogHeader>
          <div className="overflow-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-9 text-xs">Código</TableHead>
                  <TableHead className="h-9 text-xs">Produto</TableHead>
                  <TableHead className="h-9 text-xs text-right">Vendidos</TableHead>
                  <TableHead className="h-9 text-xs text-right">Devolvidos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allSoldProducts.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="py-2 text-xs font-mono">{p.id.toUpperCase()}</TableCell>
                    <TableCell className="py-2 text-xs">{p.name}</TableCell>
                    <TableCell className="py-2 text-xs text-right tabular-nums">{p.units}</TableCell>
                    <TableCell className="py-2 text-xs text-right tabular-nums">{p.returned}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Produtos sem venda no período */}
      <Dialog open={showWithoutSalesDialog} onOpenChange={setShowWithoutSalesDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="pr-10">
            <div className="flex items-start justify-between gap-2">
              <div>
                <DialogTitle>Produtos sem venda no período</DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-12 top-4 h-8 gap-1.5"
                onClick={() => downloadPdf({
                  title: "Produtos sem venda no período",
                  head: ["Código", "Produto", "Categoria", "Estoque"],
                  body: productsWithoutSales.map(p => {
                    const cat = categories.find(c => c.id === p.category);
                    return [p.id.toUpperCase(), p.name, cat?.name ?? "—", p.inStock ? "Em estoque" : "Sem estoque"];
                  }),
                })}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="text-xs">PDF</span>
              </Button>
            </div>
          </DialogHeader>
          <div className="overflow-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-9 text-xs">Código</TableHead>
                  <TableHead className="h-9 text-xs">Produto</TableHead>
                  <TableHead className="h-9 text-xs">Categoria</TableHead>
                  <TableHead className="h-9 text-xs">Estoque</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsWithoutSales.map(p => {
                  const cat = categories.find(c => c.id === p.category);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="py-2 text-xs font-mono">{p.id.toUpperCase()}</TableCell>
                      <TableCell className="py-2 text-xs">{p.name}</TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">{cat?.name ?? "—"}</TableCell>
                      <TableCell className="py-2 text-xs">
                        <span className={p.inStock ? "text-emerald-600" : "text-destructive"}>
                          {p.inStock ? "Em estoque" : "Sem estoque"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

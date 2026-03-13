import { useState, useMemo } from "react";
import {
  Package,
  ShoppingBag,
  Award,
  Star,
  Users,
  ChevronRight,
  ChevronLeft,
  Calendar,
  CalendarRange,
  CalendarDays,
  Eye,
  EyeOff,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, addMonths, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

/* ── Types ── */

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  number: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: string;
  tracking?: string;
}

interface FranchiseDistribution {
  type: string;
  count: number;
  color: string;
}

interface OrderSummaryCardProps {
  orders: Order[];
}

/* ── Helpers ── */

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const HIDDEN = "•••";

type PeriodMode = "30d" | "month" | "custom";

/* ── Component ── */

export function OrderSummaryCard({ orders }: OrderSummaryCardProps) {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showFranchiseDetail, setShowFranchiseDetail] = useState(false);
  const [visible, setVisible] = useState(true);

  // Period state
  const [mode, setMode] = useState<PeriodMode>("30d");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [customFrom, setCustomFrom] = useState<Date | undefined>(subDays(new Date(), 30));
  const [customTo, setCustomTo] = useState<Date | undefined>(new Date());

  const today = new Date();

  // Compute date range
  const { from, to } = useMemo(() => {
    if (mode === "30d") {
      return { from: subDays(today, 30), to: today };
    }
    if (mode === "month") {
      const s = startOfMonth(selectedMonth);
      const e = endOfMonth(selectedMonth);
      return { from: s, to: isAfter(e, today) ? today : e };
    }
    return { from: customFrom || subDays(today, 30), to: customTo || today };
  }, [mode, selectedMonth, customFrom, customTo]);

  // Period label
  const periodLabel = useMemo(() => {
    if (mode === "30d") return "Últimos 30 dias";
    if (mode === "month") return format(selectedMonth, "MMMM yyyy", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase());
    return `${format(from, "dd/MM/yy")} — ${format(to, "dd/MM/yy")}`;
  }, [mode, selectedMonth, from, to]);

  // Filter orders by period
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const d = new Date(o.date + "T00:00:00");
      return d >= from && d <= to && o.status !== "cancelado";
    });
  }, [orders, from, to]);

  // 1) Pedidos realizados
  const totalOrders = filteredOrders.length;

  // 2) Produtos adquiridos
  const productMap: Record<string, number> = {};
  let totalUnits = 0;
  filteredOrders.forEach((o) =>
    o.items.forEach((i) => {
      productMap[i.name] = (productMap[i.name] || 0) + i.qty;
      totalUnits += i.qty;
    })
  );
  const sortedProducts = Object.entries(productMap).sort((a, b) => b[1] - a[1]);
  const top3 = sortedProducts.slice(0, 3);

  // 3) Franquias cadastradas (mock)
  const franchiseDistribution: FranchiseDistribution[] = [
    { type: "Bronze", count: 3, color: "bg-amber-700/15 text-amber-800 border-amber-300" },
    { type: "Prata", count: 2, color: "bg-slate-200/60 text-slate-700 border-slate-300" },
    { type: "Ouro", count: 1, color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    { type: "Platina", count: 1, color: "bg-cyan-100 text-cyan-700 border-cyan-300" },
  ];
  const totalFranchises = franchiseDistribution.reduce((s, f) => s + f.count, 0);

  // 4) Bônus + Pontos
  const totalSpent = filteredOrders.reduce((s, o) => s + o.total, 0);
  const bonusGenerated = totalSpent * 0.08;
  const pointsGenerated = Math.floor(totalSpent / 10);

  // Month navigation
  const canGoForward = mode === "month" && isAfter(today, endOfMonth(selectedMonth));

  // Visibility toggle button for headerRight
  const visibilityToggle = (
    <button
      type="button"
      onClick={() => setVisible((v) => !v)}
      className="p-1.5 rounded-md bg-card border-2 border-app-card-border hover:bg-muted/60 transition-colors"
      aria-label={visible ? "Ocultar valores" : "Mostrar valores"}
    >
      {visible ? (
        <Eye className="h-4 w-4 text-muted-foreground" />
      ) : (
        <EyeOff className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <>
      <DashboardCard icon={Package} title="Resumo" headerRight={visibilityToggle}>
        {/* Period selector */}
        <div className="mt-2 flex flex-col gap-2">
          {/* Mode chips */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-1">
              {([
                { key: "30d", label: "30 dias", icon: CalendarDays },
                { key: "month", label: "Mês", icon: Calendar },
                { key: "custom", label: "Período", icon: CalendarRange },
              ] as const).map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setMode(m.key);
                    if (m.key === "custom" && !customFrom) {
                      setCustomFrom(subDays(today, 30));
                      setCustomTo(today);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                    mode === m.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <m.icon className="h-3 w-3" />
                  {m.label}
                </button>
              ))}
            </div>

            {mode === "month" && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setSelectedMonth((p) => subMonths(p, 1))}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs font-medium text-foreground min-w-[120px] text-center capitalize">
                  {format(selectedMonth, "MMMM yyyy", { locale: ptBR })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={!canGoForward}
                  onClick={() => setSelectedMonth((p) => addMonths(p, 1))}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {mode === "custom" && (
              <div className="flex items-center gap-1.5">
                <DatePickerButton
                  date={customFrom}
                  onSelect={(d) => setCustomFrom(d)}
                  maxDate={customTo || today}
                  placeholder="Início"
                />
                <span className="text-xs text-muted-foreground">—</span>
                <DatePickerButton
                  date={customTo}
                  onSelect={(d) => setCustomTo(d)}
                  minDate={customFrom}
                  maxDate={today}
                  placeholder="Fim"
                />
              </div>
            )}

            {mode === "30d" && (
              <span className="text-[11px] text-muted-foreground">{periodLabel}</span>
            )}
          </div>

          {/* KPI grid — 4 cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Pedidos realizados */}
            <MiniCard
              icon={ShoppingBag}
              label="Pedidos realizados"
              value={visible ? String(totalOrders) : HIDDEN}
              accent="text-primary"
            />

            {/* Produtos adquiridos */}
            <div className="rounded-lg border border-app-card-border p-3 flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 mb-1">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground leading-tight">Produtos adquiridos</span>
              </div>
              <p className="text-xl font-bold text-primary">{visible ? totalUnits : HIDDEN}</p>
              {visible && top3.length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  {top3.map(([name, qty], idx) => (
                    <div key={name} className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground truncate mr-1">
                        {idx + 1}. {name}
                      </span>
                      <span className="font-semibold text-foreground shrink-0">{qty}x</span>
                    </div>
                  ))}
                </div>
              )}
              {visible && sortedProducts.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllProducts(true)}
                  className="mt-1.5 text-[10px] text-primary hover:underline self-start flex items-center gap-0.5"
                >
                  Ver todos <ChevronRight className="h-2.5 w-2.5" />
                </button>
              )}
              {!visible && (
                <div className="mt-1.5 space-y-0.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="text-[10px] text-muted-foreground">{HIDDEN}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Franquias cadastradas */}
            <button
              type="button"
              onClick={() => visible && setShowFranchiseDetail(true)}
              className={cn(
                "rounded-lg border border-app-card-border p-3 flex flex-col text-left transition-colors group",
                visible && "hover:bg-muted/40 cursor-pointer"
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground leading-tight">Franquias cadastradas</span>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-xl font-bold text-primary">{visible ? totalFranchises : HIDDEN}</p>
                {visible && <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
            </button>

            {/* Bônus e Pontos */}
            <div className="rounded-lg border border-app-card-border p-3 flex flex-col">
              {/* Bônus */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <Award className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground leading-tight">Bônus gerados</span>
              </div>
              <p className="text-xl font-bold text-primary">{visible ? formatCurrency(bonusGenerated) : HIDDEN}</p>

              {/* Divider */}
              <div className="my-1.5 border-t border-app-card-border/50" />

              {/* Pontos */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <Star className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground leading-tight">Pontos gerados</span>
              </div>
              <p className="text-xl font-bold text-primary">{visible ? pointsGenerated.toLocaleString("pt-BR") : HIDDEN}</p>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Dialog: Todos os produtos */}
      <Dialog open={showAllProducts} onOpenChange={setShowAllProducts}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary text-base">
              <Package className="h-4 w-4" />
              Produtos adquiridos
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-2 mb-1">{periodLabel}</p>
          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
            {sortedProducts.map(([name, qty], idx) => (
              <div
                key={name}
                className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md even:bg-muted/30"
              >
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground mr-1.5">{idx + 1}.</span>
                  {name}
                </span>
                <span className="font-bold text-foreground">{qty}x</span>
              </div>
            ))}
            {sortedProducts.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">Nenhum produto no período.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Distribuição de franquias */}
      <Dialog open={showFranchiseDetail} onOpenChange={setShowFranchiseDetail}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary text-base">
              <Users className="h-4 w-4" />
              Franquias cadastradas
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-2 mb-1">{periodLabel}</p>
          <div className="space-y-2">
            {franchiseDistribution.map((f) => (
              <div
                key={f.type}
                className="flex items-center justify-between text-sm py-2 px-3 rounded-md border border-app-card-border"
              >
                <Badge variant="outline" className={cn("text-xs font-medium", f.color)}>
                  {f.type}
                </Badge>
                <span className="font-bold text-foreground">{f.count}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm font-bold pt-2 border-t border-app-card-border px-3">
              <span>Total</span>
              <span className="text-primary">{totalFranchises}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ── Date Picker Button ── */

function DatePickerButton({
  date,
  onSelect,
  minDate,
  maxDate,
  placeholder,
}: {
  date: Date | undefined;
  onSelect: (d: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-7 px-2 text-[11px] font-normal w-[100px] justify-start",
            !date && "text-muted-foreground"
          )}
        >
          <Calendar className="h-3 w-3 mr-1 shrink-0" />
          {date ? format(date, "dd/MM/yy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarPicker
          mode="single"
          selected={date}
          onSelect={onSelect}
          disabled={(d) => {
            if (maxDate && d > maxDate) return true;
            if (minDate && d < minDate) return true;
            return false;
          }}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

/* ── Mini Card helper ── */

function MiniCard({
  icon: Icon,
  label,
  value,
  accent,
  valueClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border border-app-card-border p-3 flex flex-col">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
      </div>
      <p className={cn("font-bold", accent, valueClass || "text-xl")}>{value}</p>
    </div>
  );
}

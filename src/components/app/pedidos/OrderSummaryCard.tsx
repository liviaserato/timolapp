import { useState } from "react";
import {
  Package,
  ShoppingBag,
  Award,
  Star,
  Users,
  ChevronRight,
  X,
} from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

/* ── Component ── */

export function OrderSummaryCard({ orders }: OrderSummaryCardProps) {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showFranchiseDetail, setShowFranchiseDetail] = useState(false);

  // Filter out cancelled orders for calculations
  const activeOrders = orders.filter((o) => o.status !== "cancelado");

  // 1) Pedidos realizados
  const totalOrders = activeOrders.length;

  // 2) Produtos adquiridos
  const productMap: Record<string, number> = {};
  let totalUnits = 0;
  activeOrders.forEach((o) =>
    o.items.forEach((i) => {
      productMap[i.name] = (productMap[i.name] || 0) + i.qty;
      totalUnits += i.qty;
    })
  );
  const sortedProducts = Object.entries(productMap)
    .sort((a, b) => b[1] - a[1]);
  const top3 = sortedProducts.slice(0, 3);

  // 3) Franquias cadastradas (mock)
  const franchiseDistribution: FranchiseDistribution[] = [
    { type: "Bronze", count: 3, color: "bg-amber-700/15 text-amber-800 border-amber-300" },
    { type: "Prata", count: 2, color: "bg-slate-200/60 text-slate-700 border-slate-300" },
    { type: "Ouro", count: 1, color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    { type: "Platina", count: 1, color: "bg-cyan-100 text-cyan-700 border-cyan-300" },
  ];
  const totalFranchises = franchiseDistribution.reduce((s, f) => s + f.count, 0);

  // 4) Bônus gerados (mock — % of order total)
  const totalSpent = activeOrders.reduce((s, o) => s + o.total, 0);
  const bonusGenerated = totalSpent * 0.08;

  // 5) Pontos gerados (mock — 1 point per R$10)
  const pointsGenerated = Math.floor(totalSpent / 10);

  return (
    <>
      <DashboardCard icon={Package} title="Resumo">
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {/* Pedidos realizados */}
          <MiniCard
            icon={ShoppingBag}
            label="Pedidos realizados"
            value={String(totalOrders)}
            accent="text-primary"
          />

          {/* Produtos adquiridos */}
          <div className="rounded-lg border border-app-card-border p-3 flex flex-col col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground leading-tight">Produtos adquiridos</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">{totalUnits}</p>
            {top3.length > 0 && (
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
            {sortedProducts.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllProducts(true)}
                className="mt-1.5 text-[10px] text-primary hover:underline self-start flex items-center gap-0.5"
              >
                Ver todos <ChevronRight className="h-2.5 w-2.5" />
              </button>
            )}
          </div>

          {/* Franquias cadastradas */}
          <button
            type="button"
            onClick={() => setShowFranchiseDetail(true)}
            className="rounded-lg border border-app-card-border p-3 flex flex-col text-left hover:bg-muted/40 transition-colors group"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground leading-tight">Franquias cadastradas</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-bold text-violet-600">{totalFranchises}</p>
              <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          {/* Bônus gerados */}
          <MiniCard
            icon={Award}
            label="Bônus gerados"
            value={formatCurrency(bonusGenerated)}
            accent="text-amber-600"
            valueClass="text-base"
          />

          {/* Pontos gerados */}
          <MiniCard
            icon={Star}
            label="Pontos gerados"
            value={pointsGenerated.toLocaleString("pt-BR")}
            accent="text-blue-600"
          />
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

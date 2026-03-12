import { useState } from "react";
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Search,
  Filter,
  Megaphone,
} from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ── Mock data ── */

const mockBanners = [
  { id: 1, title: "🔥 Combo Mega com 30% OFF", subtitle: "Válido até 31/03", bg: "from-primary/90 to-primary/60" },
  { id: 2, title: "🚀 Lançamento Linha Premium", subtitle: "Novos produtos disponíveis", bg: "from-emerald-600/80 to-emerald-500/60" },
  { id: 3, title: "🎁 Compre 3, Leve 4", subtitle: "Promoção exclusiva para franqueados", bg: "from-amber-600/80 to-amber-500/60" },
];

type OrderStatus = "pendente" | "confirmado" | "enviado" | "entregue" | "cancelado";

interface Order {
  id: string;
  number: string;
  date: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  tracking?: string;
}

const mockOrders: Order[] = [
  {
    id: "1", number: "#5001", date: "2026-03-10",
    items: [{ name: "Combo Mega", qty: 2, price: 189.9 }, { name: "Combo Mini", qty: 1, price: 99.9 }],
    total: 479.7, status: "enviado", tracking: "BR123456789",
  },
  {
    id: "2", number: "#4998", date: "2026-03-07",
    items: [{ name: "Loader Transparente", qty: 5, price: 29.9 }],
    total: 149.5, status: "entregue",
  },
  {
    id: "3", number: "#4985", date: "2026-03-03",
    items: [{ name: "Combo Mega", qty: 1, price: 189.9 }, { name: "Produtos Separados", qty: 3, price: 49.9 }],
    total: 339.6, status: "confirmado",
  },
  {
    id: "4", number: "#4970", date: "2026-03-01",
    items: [{ name: "Combo Mini", qty: 4, price: 99.9 }],
    total: 399.6, status: "entregue",
  },
  {
    id: "5", number: "#4955", date: "2026-02-25",
    items: [{ name: "Combo Mega", qty: 1, price: 189.9 }],
    total: 189.9, status: "cancelado",
  },
];

const statusConfig: Record<OrderStatus, { label: string; shortLabel: string; icon: React.ElementType; color: string }> = {
  pendente: { label: "Pendente", shortLabel: "Pend.", icon: Clock, color: "bg-amber-100 text-amber-700 border-amber-200" },
  confirmado: { label: "Confirmado", shortLabel: "Conf.", icon: CheckCircle2, color: "bg-blue-100 text-blue-700 border-blue-200" },
  enviado: { label: "Enviado", shortLabel: "Env.", icon: Truck, color: "bg-violet-100 text-violet-700 border-violet-200" },
  entregue: { label: "Entregue", shortLabel: "Entr.", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelado: { label: "Cancelado", shortLabel: "Canc.", icon: XCircle, color: "bg-red-100 text-red-700 border-red-200" },
};

function StatusBadge({ status, compact = false }: { status: OrderStatus; compact?: boolean }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border justify-center max-w-full",
        compact ? "text-[10px] px-1.5 py-0" : "gap-1 text-[11px]",
        cfg.color,
      )}
    >
      {!compact && <Icon className="h-3 w-3" />}
      {compact ? cfg.shortLabel : cfg.label}
    </Badge>
  );
}

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
}

/* ── Component ── */

export default function Pedidos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const filtered = mockOrders.filter((o) => {
    const matchSearch =
      o.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === "todos" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentOrders = mockOrders.filter((o) => new Date(o.date + "T00:00:00") >= thirtyDaysAgo && o.status !== "cancelado");

  const productSales: Record<string, number> = {};
  recentOrders.forEach((o) => o.items.forEach((i) => {
    productSales[i.name] = (productSales[i.name] || 0) + i.qty;
  }));
  const topProduct = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0];

  const summary = {
    topProduct: topProduct ? { name: topProduct[0], qty: topProduct[1] } : null,
    pending: mockOrders.filter((o) => o.status === "pendente" || o.status === "confirmado").length,
    inTransit: mockOrders.filter((o) => o.status === "enviado").length,
    delivered: mockOrders.filter((o) => o.status === "entregue").length,
  };

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-primary">Pedidos</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie seus pedidos e acompanhe entregas</p>
      </header>

      <section className="flex flex-col gap-2">
        {/* Banners de promoção */}
        <DashboardCard icon={Megaphone} title="Promoções">
          <div className="mt-2">
            <Carousel className="w-full">
              <CarouselContent>
                {mockBanners.map((b) => (
                  <CarouselItem key={b.id}>
                    <div
                      className={cn(
                        "flex min-h-[140px] flex-col items-center justify-center rounded-lg bg-gradient-to-r text-primary-foreground px-6 py-8 text-center",
                        b.bg,
                      )}
                    >
                      <p className="text-xl font-bold">{b.title}</p>
                      <p className="text-sm mt-1 opacity-90">{b.subtitle}</p>
                      <Button size="sm" variant="secondary" className="mt-3 text-xs font-semibold">
                        Ver oferta
                      </Button>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-3 h-8 w-8 border-app-card-border" />
              <CarouselNext className="-right-3 h-8 w-8 border-app-card-border" />
            </Carousel>
          </div>
        </DashboardCard>

        {/* Realizar Pedido + Resumo */}
        <DashboardCard icon={ShoppingCart} title="Novo Pedido">
          <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="text-sm text-muted-foreground flex-1">
              Acesse o catálogo de produtos e faça seu pedido diretamente pelo sistema.
            </p>
            <Button className="gap-2 shrink-0">
              <ShoppingCart className="h-4 w-4" />
              Realizar Pedido
            </Button>
          </div>
        </DashboardCard>

        {/* Resumo rápido */}
        <DashboardCard icon={Package} title="Resumo">
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Mais vendido (30d)", value: summary.topProduct ? `${summary.topProduct.qty}x` : "—", subtitle: summary.topProduct?.name || "Sem dados", accent: "text-primary" },
              { label: "Em processamento", value: String(summary.pending), subtitle: undefined, accent: "text-amber-600" },
              { label: "Em trânsito", value: String(summary.inTransit), subtitle: undefined, accent: "text-violet-600" },
              { label: "Entregues", value: String(summary.delivered), subtitle: undefined, accent: "text-emerald-600" },
            ].map((s) => (
              <div key={s.label} className="rounded-md border border-app-card-border p-3 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={cn("text-xl font-bold", s.accent)}>{s.value}</p>
                {s.subtitle && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{s.subtitle}</p>}
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Histórico de Pedidos */}
        <DashboardCard icon={Clock} title="Histórico de Pedidos">
          {/* Filtros */}
          <div className="mt-2 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nº ou produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 text-xs rounded-md"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-full sm:w-[160px] text-xs">
                <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="mt-3 rounded-md border border-app-card-border overflow-hidden overflow-x-hidden">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow className="bg-[hsl(var(--table-header))]">
                  <TableHead className="w-[38%] text-xs font-semibold px-1.5 sm:px-2 md:px-3 lg:px-4">Pedido</TableHead>
                  <TableHead className="w-[20%] text-xs font-semibold hidden sm:table-cell px-1.5 sm:px-2 md:px-3 lg:px-4">Data</TableHead>
                  <TableHead className="w-[14%] text-xs font-semibold hidden lg:table-cell px-1.5 sm:px-2 md:px-3 lg:px-4">Itens</TableHead>
                  <TableHead className="w-[20%] text-xs font-semibold text-right px-1.5 sm:px-2 md:px-3 lg:px-4">Total</TableHead>
                  <TableHead className="w-[22%] sm:w-[18%] text-xs font-semibold text-center px-1 sm:px-2 md:px-3 lg:px-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      Nenhum pedido encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setDetailOrder(order)}>
                      <TableCell className="text-xs font-medium px-1.5 sm:px-2 md:px-3 lg:px-4">
                        <div className="flex flex-col leading-tight">
                          <span>{order.number}</span>
                          <span className="text-[10px] text-muted-foreground sm:hidden">{formatDate(order.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden sm:table-cell px-1.5 sm:px-2 md:px-3 lg:px-4">{formatDate(order.date)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden lg:table-cell px-1.5 sm:px-2 md:px-3 lg:px-4">
                        {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-right whitespace-nowrap px-1.5 sm:px-2 md:px-3 lg:px-4">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell className="text-center px-1 sm:px-2 md:px-3 lg:px-4">
                        <span className="sm:hidden inline-flex"><StatusBadge status={order.status} compact /></span>
                        <span className="hidden sm:inline-flex"><StatusBadge status={order.status} /></span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DashboardCard>

        {/* Cards de Pedidos (agrupados por mês) */}
        <DashboardCard icon={Package} title="Pedidos (Cards)">
          <div className="mt-2 space-y-4">
            {Object.entries(
              filtered.reduce<Record<string, Order[]>>((acc, order) => {
                const d = new Date(order.date + "T00:00:00");
                const key = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
                if (!acc[key]) acc[key] = [];
                acc[key].push(order);
                return acc;
              }, {})
            ).map(([month, orders]) => (
              <div key={month}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-semibold text-primary capitalize">{month}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-lg border border-app-card-border bg-card p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => setDetailOrder(order)}
                    >
                      {/* Row 1: date + order number */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground">{formatDate(order.date)}</span>
                        <span className="text-xs font-bold text-primary">{order.number}</span>
                      </div>
                      {/* Row 2: items summary + total */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-foreground truncate mr-2">
                          {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                        </span>
                        <span className="text-sm font-bold whitespace-nowrap">{formatCurrency(order.total)}</span>
                      </div>
                      {/* Row 3: status + tracking */}
                      <div className="flex items-center justify-between">
                        <StatusBadge status={order.status} />
                        {order.tracking && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Truck className="h-3 w-3" />
                            <span className="font-mono">{order.tracking}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">Nenhum pedido encontrado.</p>
            )}
          </div>
        </DashboardCard>
      </section>

      {/* Dialog de detalhes do pedido */}
      <Dialog open={!!detailOrder} onOpenChange={(open) => !open && setDetailOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Package className="h-5 w-5" />
              Pedido {detailOrder?.number}
            </DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data: {formatDate(detailOrder.date)}</span>
                <StatusBadge status={detailOrder.status} />
              </div>

              {detailOrder.tracking && (
                <div className="rounded-md border border-app-card-border p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground">Código de rastreio</p>
                  <p className="text-sm font-mono font-semibold text-primary">{detailOrder.tracking}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Itens do pedido</p>
                <div className="space-y-2">
                  {detailOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span>
                        {item.qty}x {item.name}
                      </span>
                      <span className="font-medium">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-app-card-border pt-3">
                <span className="text-sm font-bold">Total</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(detailOrder.total)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

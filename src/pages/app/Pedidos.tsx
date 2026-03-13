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
  Users,
  BookOpen,
  ExternalLink,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    items: [{ name: "Combo Mega", qty: 2, price: 189.9 }, { name: "Combo Mini", qty: 1, price: 99.9 }, { name: "Refil Alcalino", qty: 3, price: 59.9 }],
    total: 479.7, status: "enviado", tracking: "BR123456789",
  },
  {
    id: "2", number: "#4998", date: "2026-03-07",
    items: [{ name: "Loader Transparente", qty: 5, price: 29.9 }, { name: "Filtro Premium", qty: 2, price: 79.9 }],
    total: 149.5, status: "entregue",
  },
  {
    id: "3", number: "#4985", date: "2026-03-03",
    items: [{ name: "Combo Mega", qty: 1, price: 189.9 }, { name: "Produtos Separados", qty: 3, price: 49.9 }, { name: "Galão Ionizado", qty: 2, price: 45.0 }],
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

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; badgeColor: string; borderColor: string }> = {
  pendente:   { label: "Pendente",   icon: Clock,        badgeColor: "bg-amber-100 text-amber-700 border-amber-200",     borderColor: "border-l-gray-400" },
  confirmado: { label: "Confirmado", icon: CheckCircle2,  badgeColor: "bg-blue-100 text-blue-700 border-blue-200",       borderColor: "border-l-blue-500" },
  enviado:    { label: "Enviado",    icon: Truck,         badgeColor: "bg-amber-100 text-amber-700 border-amber-200",    borderColor: "border-l-amber-400" },
  entregue:   { label: "Entregue",   icon: CheckCircle2,  badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200", borderColor: "border-l-emerald-500" },
  cancelado:  { label: "Cancelado",  icon: XCircle,       badgeColor: "bg-red-100 text-red-700 border-red-200",          borderColor: "border-l-red-500" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn("font-medium border gap-1 text-[11px]", cfg.badgeColor)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
}

function handleTrackingClick(e: React.MouseEvent, tracking: string) {
  e.stopPropagation();
  navigator.clipboard.writeText(tracking);
  toast.success("Código copiado!", { description: tracking });
  window.open(`https://www.linkcorreios.com.br/?id=${tracking}`, "_blank");
}

/* ── Component ── */

export default function Pedidos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const filtered = mockOrders
    .filter((o) => {
      const matchSearch =
        o.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.items.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === "todos" || o.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group by month
  const grouped = filtered.reduce<Record<string, Order[]>>((acc, order) => {
    const d = new Date(order.date + "T00:00:00");
    const monthName = d.toLocaleDateString("pt-BR", { month: "long" });
    const key = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${d.getFullYear()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-primary">Pedidos</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie seus pedidos e acompanhe entregas</p>
      </header>

      <section className="flex flex-col gap-2">

        {/* Banners de promoção */}
        <DashboardCard icon={Megaphone} title="Promoções">
          <div className="mt-2 relative">
            <Carousel className="w-full" opts={{ loop: true }}>
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
              <CarouselPrevious className="left-0 h-full w-12 rounded-none bg-transparent border-0 shadow-none hover:bg-black/5 text-white/70 drop-shadow-md [&>svg]:h-7 [&>svg]:w-7 transition-colors" />
              <CarouselNext className="right-0 h-full w-12 rounded-none bg-transparent border-0 shadow-none hover:bg-black/5 text-white/70 drop-shadow-md [&>svg]:h-7 [&>svg]:w-7 transition-colors" />
            </Carousel>
          </div>
        </DashboardCard>

        {/* Realizar Pedido */}
        <DashboardCard icon={ShoppingCart} title="Novo Pedido">
          <div className="mt-2 flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Acesse o catálogo, faça seu pedido ou indique uma nova franquia.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button className="gap-2 w-full">
                <ShoppingCart className="h-4 w-4" />
                Realizar Pedido
              </Button>
              <Button variant="outline" className="gap-2 w-full">
                <Users className="h-4 w-4" />
                Indicar Franquia
              </Button>
              <Button variant="outline" className="gap-2 w-full truncate">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="truncate">Catálogo Produtos</span>
              </Button>
            </div>
          </div>
        </DashboardCard>

        {/* Pedidos em Cards */}
        <DashboardCard icon={Package} title="Pedidos">
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

          {/* Cards agrupados por mês */}
          <div className="mt-4 space-y-6">
            {Object.entries(grouped).map(([month, orders]) => (
              <div key={month}>
                <h3 className="text-sm font-bold text-primary capitalize mb-3">{month}</h3>
                <div className="space-y-2">
                  {orders.map((order) => {
                    const sortedItems = [...order.items].sort((a, b) => b.qty - a.qty);
                    const itemsSummary = sortedItems.map((i) => `${i.name} x ${i.qty}`).join(", ");

                    return (
                      <div
                        key={order.id}
                        className={cn(
                          "rounded-lg border border-app-card-border bg-card cursor-pointer hover:bg-muted/40 transition-colors overflow-hidden border-l-4",
                          statusConfig[order.status].borderColor,
                        )}
                        onClick={() => setDetailOrder(order)}
                      >
                        <div className="p-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5">
                          {/* Row 1 left: #pedido + data */}
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base font-extrabold text-foreground">{order.number}</span>
                            <span className="text-[11px] text-muted-foreground">{formatDate(order.date)}</span>
                          </div>
                          {/* Row 1 right: tracking + status */}
                          <div className="flex items-center justify-end gap-1.5">
                            {order.status === "enviado" && order.tracking && (
                              <button
                                onClick={(e) => handleTrackingClick(e, order.tracking!)}
                                className="flex items-center gap-0.5 text-primary hover:text-primary/80 transition-colors"
                                title="Rastrear pedido"
                              >
                                <Truck className="h-4 w-4" />
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            )}
                            <StatusBadge status={order.status} />
                          </div>
                          {/* Row 2 left: resumo */}
                          <p className="text-xs text-muted-foreground truncate flex items-center">{itemsSummary}</p>
                          {/* Row 2 right: valor */}
                          <span className="text-sm font-bold whitespace-nowrap flex items-center justify-end">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    );
                  })}
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
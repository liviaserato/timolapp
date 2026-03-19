import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Search,
  Filter,
  Users,
  BookOpen,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  PackageCheck,
} from "lucide-react";
import { OrderDetailDialog, type Order, type OrderStatus } from "@/components/app/pedidos/OrderDetailDialog";
import { IndicarFranquiaDialog } from "@/components/app/IndicarFranquiaDialog";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ── Mock data ── */

const mockBanners = [
  { id: 1, title: "🔥 Combo Mega com 30% OFF", subtitle: "Válido até 31/03", bg: "from-primary/90 to-primary/60" },
  { id: 2, title: "🚀 Lançamento Linha Premium", subtitle: "Novos produtos disponíveis", bg: "from-emerald-600/80 to-emerald-500/60" },
  { id: 3, title: "🎁 Compre 3, Leve 4", subtitle: "Promoção exclusiva para franqueados", bg: "from-amber-600/80 to-amber-500/60" },
];

const mockOrders: Order[] = [
  {
    id: "1", number: "#5001", date: "2026-03-10",
    items: [
      { name: "Combo Mega", qty: 2, price: 189.9 },
      { name: "Combo Mini", qty: 1, price: 99.9 },
      { name: "Refil Alcalino", qty: 3, price: 59.9, discountedTotal: 119.8 },
    ],
    total: 599.5, status: "enviado", tracking: "BR123456789",
    subtotal: 659.4, freight: 0, coupon: { name: "COMPRE3PAGUE2", discount: 59.9 },
    pointsUnilevel: 132, pointsBinary: 28,
    payments: [
      { method: "PIX", value: 450.1 },
      { method: "Crédito", label: "•••• 1234", value: 149.4, installments: "em 2 parcelas de R$ 74,70" },
    ],
    delivery: {
      type: "entrega",
      address: "Av. Dom Pedro II 841, apto 1234, bloco 3",
      city: "Alto Umuarama — Uberlândia, MG",
      zip: "38405-280",
      note: "Rua de esquina sem saída",
      tracking: "BR123456789",
    },
  },
  {
    id: "2", number: "#4998", date: "2026-03-07",
    items: [{ name: "Loader Transparente", qty: 5, price: 29.9 }, { name: "Filtro Premium", qty: 2, price: 79.9 }],
    total: 309.3, status: "entregue",
    subtotal: 309.3, freight: 0,
    pointsUnilevel: 62, pointsBinary: 14,
    payments: [{ method: "PIX", value: 309.3 }],
    delivery: {
      type: "retirada",
      pickupLocation: "Unidade Salvador, BA",
      deliveryDate: "2026-03-12",
      deliveredTo: "João",
    },
  },
  {
    id: "3", number: "#4985", date: "2026-03-03",
    items: [{ name: "Combo Mega", qty: 1, price: 189.9 }, { name: "Produtos Separados", qty: 3, price: 49.9 }, { name: "Galão Ionizado", qty: 2, price: 45.0 }],
    total: 429.6, status: "confirmado",
    subtotal: 429.6, freight: 0,
    pointsUnilevel: 86, pointsBinary: 20,
    payments: [{ method: "Saldo Carteira", value: 15 }, { method: "PIX", value: 414.6 }],
    delivery: {
      type: "entrega",
      address: "Rua das Flores 123",
      city: "Belo Horizonte, MG",
      zip: "30100-000",
    },
  },
  {
    id: "4", number: "#4970", date: "2026-03-01",
    items: [{ name: "Combo Mini", qty: 4, price: 99.9 }],
    total: 399.6, status: "entregue",
    subtotal: 399.6, freight: 0,
    pointsUnilevel: 80, pointsBinary: 18,
    payments: [{ method: "Crédito", label: "•••• 5678", value: 399.6, installments: "em 3 parcelas de R$ 133,20" }],
    delivery: {
      type: "entrega",
      address: "Av. Paulista 1000, sala 501",
      city: "São Paulo, SP",
      zip: "01310-100",
      deliveryDate: "2026-03-08",
      tracking: "BR555444333",
      deliveredTo: "Maria",
    },
  },
  {
    id: "5", number: "#4955", date: "2026-02-25",
    items: [{ name: "Combo Mega", qty: 1, price: 189.9 }],
    total: 189.9, status: "cancelado",
    subtotal: 189.9, freight: 0,
    payments: [{ method: "PIX", value: 189.9 }],
  },
  {
    id: "6", number: "#4940", date: "2026-02-20",
    items: [{ name: "Filtro Premium", qty: 3, price: 79.9 }],
    total: 239.7, status: "pendente",
    subtotal: 239.7, freight: 0,
    pointsUnilevel: 48, pointsBinary: 10,
    delivery: {
      type: "retirada",
      pickupLocation: "Unidade Uberlândia, MG",
    },
  },
  {
    id: "7", number: "#4932", date: "2026-02-18",
    items: [{ name: "Combo Mini", qty: 2, price: 99.9 }, { name: "Refil Alcalino", qty: 1, price: 59.9 }],
    total: 259.7, status: "enviado", tracking: "BR987654321",
    subtotal: 259.7, freight: 0,
    payments: [{ method: "PIX", value: 259.7 }],
    delivery: {
      type: "entrega",
      address: "Rua XV de Novembro 200",
      city: "Curitiba, PR",
      zip: "80020-310",
      tracking: "BR987654321",
    },
  },
  {
    id: "8", number: "#4920", date: "2026-02-14",
    items: [{ name: "Galão Ionizado", qty: 4, price: 45.0 }],
    total: 180.0, status: "entregue",
    subtotal: 180.0, freight: 0,
    payments: [{ method: "Voucher", label: "BEMVINDO", value: 10 }, { method: "PIX", value: 170 }],
    delivery: {
      type: "entrega",
      address: "Rua do Comércio 50",
      city: "Recife, PE",
      zip: "50010-000",
      deliveryDate: "2026-02-20",
      deliveredTo: "Carlos",
    },
  },
  {
    id: "9", number: "#4905", date: "2026-02-10",
    items: [{ name: "Combo Mega", qty: 1, price: 189.9 }, { name: "Combo Mini", qty: 1, price: 99.9 }],
    total: 289.8, status: "confirmado",
    subtotal: 289.8, freight: 0,
    pointsUnilevel: 58, pointsBinary: 12,
    payments: [{ method: "Crédito", label: "•••• 9012", value: 289.8 }],
    delivery: {
      type: "retirada",
      pickupLocation: "Unidade Rio de Janeiro, RJ",
    },
  },
  {
    id: "10", number: "#4890", date: "2026-02-05",
    items: [{ name: "Produtos Separados", qty: 6, price: 49.9 }],
    total: 299.4, status: "cancelado",
    subtotal: 299.4, freight: 0,
  },
  {
    id: "11", number: "#4878", date: "2026-01-28",
    items: [{ name: "Loader Transparente", qty: 10, price: 29.9 }],
    total: 299.0, status: "entregue",
    subtotal: 299.0, freight: 0,
    payments: [{ method: "PIX", value: 299 }],
    delivery: {
      type: "entrega",
      address: "Av. Brasil 3000",
      city: "Goiânia, GO",
      zip: "74000-000",
      deliveryDate: "2026-02-03",
      tracking: "BR111222333",
      deliveredTo: "Ana",
    },
  },
];

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; textColor: string; borderColor: string }> = {
  pendente:            { label: "Pendente",               icon: Clock,        textColor: "text-gray-500",       borderColor: "border-l-gray-400" },
  confirmado:          { label: "Confirmado",             icon: CheckCircle2,  textColor: "text-blue-600",       borderColor: "border-l-blue-500" },
  enviado:             { label: "Enviado",                icon: Truck,         textColor: "text-emerald-600",    borderColor: "border-l-emerald-500" },
  disponivel_retirada: { label: "Disp. p/ Retirada",     icon: PackageCheck,  textColor: "text-emerald-600",    borderColor: "border-l-emerald-500" },
  entregue:            { label: "Entregue",               icon: CheckCircle2,  textColor: "text-[#003885]",      borderColor: "border-l-[#003885]" },
  cancelado:           { label: "Cancelado",              icon: XCircle,       textColor: "text-red-600",        borderColor: "border-l-red-500" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold", cfg.textColor)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
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
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [indicarOpen, setIndicarOpen] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!carouselApi) return;
    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselApi]);

  const filtered = mockOrders
    .filter((o) => {
      const matchSearch =
        o.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.items.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        formatDate(o.date).includes(searchTerm);
      const matchStatus = statusFilter === "todos" || o.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedOrders = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => { setSearchTerm(value); setCurrentPage(1); };
  const handleStatusChange = (value: string) => { setStatusFilter(value); setCurrentPage(1); };

  const grouped = paginatedOrders.reduce<Record<string, Order[]>>((acc, order) => {
    const d = new Date(order.date + "T00:00:00");
    const monthName = d.toLocaleDateString("pt-BR", { month: "long" });
    const key = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${d.getFullYear()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-primary">{t("pedidos.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("pedidos.subtitle")}</p>
      </header>

      <section className="flex flex-col gap-2">

        {/* Banners de promoção — sem card, direto na página */}
        <div className="relative">
          <Carousel className="w-full" opts={{ loop: true }} setApi={setCarouselApi}>
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
                      {t("pedidos.seeOffer")}
                    </Button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 h-full w-12 rounded-none bg-transparent border-0 shadow-none hover:bg-transparent text-white/50 hover:text-white drop-shadow-md [&>svg]:h-7 [&>svg]:w-7 transition-colors" />
            <CarouselNext className="right-0 h-full w-12 rounded-none bg-transparent border-0 shadow-none hover:bg-transparent text-white/50 hover:text-white drop-shadow-md [&>svg]:h-7 [&>svg]:w-7 transition-colors" />
          </Carousel>
        </div>

        {/* Realizar Pedido */}
        <DashboardCard icon={ShoppingCart} title={t("pedidos.newOrder")}>
          <div className="mt-2 flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {t("pedidos.newOrderDesc")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button className="gap-2 w-full" onClick={() => navigate("/app/pedidos/realizar")}>
                <ShoppingCart className="h-4 w-4" />
                {t("pedidos.placeOrder")}
              </Button>
              <Button variant="outline" className="gap-2 w-full" onClick={() => setIndicarOpen(true)}>
                <Users className="h-4 w-4" />
                {t("pedidos.referFranchise")}
              </Button>
              <Button variant="outline" className="gap-2 w-full truncate">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="truncate">{t("pedidos.productCatalog")}</span>
              </Button>
            </div>
          </div>
        </DashboardCard>

        {/* Pedidos em Cards */}
        <DashboardCard icon={Package} title={t("pedidos.orders")}>
          {/* Filtros — mobile: filter first, search second */}
          <div className="mt-2 flex flex-col sm:flex-row gap-2">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-8 w-full sm:w-[160px] sm:order-2 text-xs">
                <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos" className="hover:bg-muted/60 cursor-pointer">{t("pedidos.all")}</SelectItem>
                <SelectItem value="pendente" className="hover:bg-muted/60 cursor-pointer">{t("pedidos.pending")}</SelectItem>
                <SelectItem value="confirmado" className="hover:bg-muted/60 cursor-pointer">{t("pedidos.confirmed")}</SelectItem>
                <SelectItem value="enviado" className="hover:bg-muted/60 cursor-pointer">{t("pedidos.shipped")}</SelectItem>
                <SelectItem value="disponivel_retirada" className="hover:bg-muted/60 cursor-pointer">{t("pedidos.readyForPickup")}</SelectItem>
                <SelectItem value="entregue" className="hover:bg-muted/60 cursor-pointer">{t("pedidos.delivered")}</SelectItem>
                <SelectItem value="cancelado" className="hover:bg-muted/60 cursor-pointer">{t("pedidos.cancelled")}</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 sm:order-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t("pedidos.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-8 pl-8 text-xs rounded-md"
              />
            </div>
          </div>

          {/* Cards agrupados por mês */}
          <div className="mt-4 space-y-6">
            {Object.entries(grouped).map(([month, orders]) => (
              <div key={month}>
                <h3 className="text-sm font-bold text-foreground capitalize mb-3">{month}</h3>
                <div className="space-y-2">
                  {orders.map((order) => {
                    const sortedItems = [...order.items].sort((a, b) => b.qty - a.qty);
                    const itemsSummary = sortedItems.map((i) => `${i.name} x ${i.qty}`).join(", ");

                    return (
                      <div
                        key={order.id}
                        className={cn(
                          "rounded-r-lg rounded-l-[2px] border border-app-card-border bg-card cursor-pointer hover:bg-muted/40 transition-colors overflow-hidden border-l-[5px]",
                          statusConfig[order.status].borderColor,
                        )}
                        onClick={() => setDetailOrder(order)}
                      >
                        <div className="p-3 flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-base font-extrabold text-foreground">{order.number}</span>
                              <span className="text-[11px] text-muted-foreground">{formatDate(order.date)}</span>
                            </div>
                            <p className="hidden sm:block text-xs text-muted-foreground truncate max-w-[50%] text-right">{itemsSummary}</p>
                            <span className="sm:hidden text-sm font-bold whitespace-nowrap">{formatCurrency(order.total)}</span>
                          </div>
                          <p className="sm:hidden text-xs text-muted-foreground truncate mb-1">{itemsSummary}</p>
                          <div className="flex items-center justify-between gap-2">
                            <StatusBadge status={order.status} />
                            {order.status === "enviado" && order.tracking && (
                              <button
                                onClick={(e) => handleTrackingClick(e, order.tracking!)}
                                className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors sm:order-none order-last ml-auto sm:ml-0"
                                title="Rastrear pedido"
                              >
                                <span className="text-[11px] font-mono">{order.tracking}</span>
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            )}
                            <span className="hidden sm:block text-sm font-bold whitespace-nowrap ml-auto">{formatCurrency(order.total)}</span>
                          </div>
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

            {/* Paginação */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-1 pt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {getPageNumbers().map((p, idx) =>
                  p === "ellipsis" ? (
                    <span key={`e-${idx}`} className="flex h-8 w-8 items-center justify-center text-muted-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition-colors",
                        currentPage === p
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-foreground hover:bg-muted/60"
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </div>
        </DashboardCard>
      </section>

      {/* Dialog de detalhes do pedido */}
      <OrderDetailDialog order={detailOrder} onClose={() => setDetailOrder(null)} />

      {/* Dialog Indicar Franquia */}
      <IndicarFranquiaDialog open={indicarOpen} onOpenChange={setIndicarOpen} />
    </div>
  );
}

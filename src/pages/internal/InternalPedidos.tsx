import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Package, Filter, ChevronLeft, ChevronRight, MoreHorizontal,
  Clock, CheckCircle2, XCircle, Truck, PackageCheck, ExternalLink,
  ShoppingBag, TrendingUp, DollarSign, AlertTriangle,
} from "lucide-react";
import { OrderDetailDialog, type Order, type OrderStatus } from "@/components/app/pedidos/OrderDetailDialog";
import { toast } from "sonner";

/* ── Status config ── */
const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; textColor: string; borderColor: string }> = {
  pendente:            { label: "Pendente",           icon: Clock,        textColor: "text-gray-500",    borderColor: "border-l-gray-400" },
  confirmado:          { label: "Confirmado",         icon: CheckCircle2, textColor: "text-blue-600",    borderColor: "border-l-blue-500" },
  enviado:             { label: "Enviado",            icon: Truck,        textColor: "text-emerald-600", borderColor: "border-l-emerald-500" },
  disponivel_retirada: { label: "Disp. p/ Retirada", icon: PackageCheck, textColor: "text-emerald-600", borderColor: "border-l-emerald-500" },
  entregue:            { label: "Entregue",           icon: CheckCircle2, textColor: "text-[#003885]",   borderColor: "border-l-[#003885]" },
  cancelado:           { label: "Cancelado",          icon: XCircle,      textColor: "text-[#8B0000]",   borderColor: "border-l-[#8B0000]" },
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

/* ── Mock Data (staff-level: includes franchisee info) ── */
interface StaffOrder extends Order {
  franchiseeId: string;
  franchiseeName: string;
  franchiseeCode: string;
}

const mockStaffOrders: StaffOrder[] = [
  {
    id: "1", number: "#5001", date: "2026-03-10",
    franchiseeId: "1", franchiseeName: "Lívia Serato", franchiseeCode: "100231",
    items: [{ name: "Combo Mega", qty: 2, price: 189.9 }, { name: "Combo Mini", qty: 1, price: 99.9 }],
    total: 479.7, status: "enviado", tracking: "BR123456789",
    subtotal: 479.7, freight: 0,
    pointsUnilevel: 96, pointsBinary: 20,
    payments: [{ method: "PIX", value: 479.7 }],
    delivery: { type: "entrega", address: "Av. Paulista 1000", city: "São Paulo, SP", zip: "01310-100", tracking: "BR123456789" },
  },
  {
    id: "2", number: "#5002", date: "2026-03-11",
    franchiseeId: "2", franchiseeName: "Carlos Eduardo Mendes", franchiseeCode: "100232",
    items: [{ name: "Filtro Premium", qty: 3, price: 79.9 }],
    total: 239.7, status: "pendente",
    subtotal: 239.7, freight: 0,
    pointsUnilevel: 48, pointsBinary: 10,
    payments: [{ method: "PIX", value: 239.7 }],
    delivery: { type: "retirada", pickupLocation: "Unidade Rio de Janeiro, RJ" },
  },
  {
    id: "3", number: "#5003", date: "2026-03-09",
    franchiseeId: "3", franchiseeName: "Ana Paula Costa", franchiseeCode: "100233",
    items: [{ name: "Combo Mega", qty: 1, price: 189.9 }, { name: "Galão Ionizado", qty: 2, price: 45.0 }],
    total: 279.9, status: "confirmado",
    subtotal: 279.9, freight: 0,
    pointsUnilevel: 56, pointsBinary: 12,
    payments: [{ method: "Crédito", label: "•••• 1234", value: 279.9 }],
    delivery: { type: "entrega", address: "Rua das Flores 123", city: "Belo Horizonte, MG", zip: "30100-000" },
  },
  {
    id: "4", number: "#5004", date: "2026-03-08",
    franchiseeId: "5", franchiseeName: "Fernanda Oliveira Santos", franchiseeCode: "100235",
    items: [{ name: "Loader Transparente", qty: 10, price: 29.9 }],
    total: 299.0, status: "entregue",
    subtotal: 299.0, freight: 0,
    pointsUnilevel: 60, pointsBinary: 14,
    payments: [{ method: "PIX", value: 299.0 }],
    delivery: { type: "entrega", address: "Rua XV de Novembro 200", city: "Curitiba, PR", zip: "80020-310", deliveryDate: "2026-03-14", deliveredTo: "Fernanda" },
  },
  {
    id: "5", number: "#5005", date: "2026-03-07",
    franchiseeId: "7", franchiseeName: "Maria Silva", franchiseeCode: "100237",
    items: [{ name: "Combo Mini", qty: 4, price: 99.9 }],
    total: 399.6, status: "entregue",
    subtotal: 399.6, freight: 0,
    pointsUnilevel: 80, pointsBinary: 18,
    payments: [{ method: "Crédito", label: "•••• 5678", value: 399.6, installments: "em 3x de R$ 133,20" }],
    delivery: { type: "entrega", address: "Av. Dom Pedro II 841", city: "São Paulo, SP", zip: "01000-000", deliveryDate: "2026-03-12", deliveredTo: "Maria" },
  },
  {
    id: "6", number: "#5006", date: "2026-03-06",
    franchiseeId: "8", franchiseeName: "Juan García López", franchiseeCode: "100238",
    items: [{ name: "Combo Mega", qty: 1, price: 189.9 }],
    total: 189.9, status: "cancelado",
    subtotal: 189.9, freight: 0,
    payments: [{ method: "PIX", value: 189.9 }],
  },
  {
    id: "7", number: "#5007", date: "2026-03-05",
    franchiseeId: "4", franchiseeName: "Roberto Almeida Filho", franchiseeCode: "100234",
    items: [{ name: "Filtro Premium", qty: 2, price: 79.9 }, { name: "Refil Alcalino", qty: 3, price: 59.9 }],
    total: 339.5, status: "enviado", tracking: "BR555444333",
    subtotal: 339.5, freight: 0,
    payments: [{ method: "PIX", value: 339.5 }],
    delivery: { type: "entrega", address: "Rua do Comércio 50", city: "Curitiba, PR", zip: "80010-000", tracking: "BR555444333" },
  },
  {
    id: "8", number: "#5008", date: "2026-03-04",
    franchiseeId: "1", franchiseeName: "Lívia Serato", franchiseeCode: "100231",
    items: [{ name: "Produtos Separados", qty: 5, price: 49.9 }],
    total: 249.5, status: "entregue",
    subtotal: 249.5, freight: 0,
    payments: [{ method: "PIX", value: 249.5 }],
    delivery: { type: "retirada", pickupLocation: "Unidade São Paulo, SP", deliveryDate: "2026-03-08", deliveredTo: "Lívia" },
  },
  {
    id: "9", number: "#5009", date: "2026-03-03",
    franchiseeId: "2", franchiseeName: "Carlos Eduardo Mendes", franchiseeCode: "100232",
    items: [{ name: "Galão Ionizado", qty: 6, price: 45.0 }],
    total: 270.0, status: "disponivel_retirada",
    subtotal: 270.0, freight: 0,
    payments: [{ method: "Saldo Carteira", value: 70 }, { method: "PIX", value: 200.0 }],
    delivery: { type: "retirada", pickupLocation: "Unidade Rio de Janeiro, RJ" },
  },
  {
    id: "10", number: "#5010", date: "2026-03-02",
    franchiseeId: "5", franchiseeName: "Fernanda Oliveira Santos", franchiseeCode: "100235",
    items: [{ name: "Combo Mega", qty: 3, price: 189.9 }],
    total: 569.7, status: "confirmado",
    subtotal: 569.7, freight: 0,
    pointsUnilevel: 114, pointsBinary: 24,
    payments: [{ method: "Crédito", label: "•••• 9012", value: 569.7, installments: "em 4x de R$ 142,43" }],
    delivery: { type: "entrega", address: "Rua das Acácias 300", city: "Porto Alegre, RS", zip: "90000-000" },
  },
  {
    id: "11", number: "#5011", date: "2026-03-01",
    franchiseeId: "7", franchiseeName: "Maria Silva", franchiseeCode: "100237",
    items: [{ name: "Combo Mini", qty: 2, price: 99.9 }, { name: "Combo Mega", qty: 1, price: 189.9 }],
    total: 389.7, status: "pendente",
    subtotal: 389.7, freight: 0,
    payments: [{ method: "PIX", value: 389.7 }],
    delivery: { type: "entrega", address: "Av. Brasil 3000", city: "São Paulo, SP", zip: "01000-000" },
  },
  {
    id: "12", number: "#5012", date: "2026-02-28",
    franchiseeId: "3", franchiseeName: "Ana Paula Costa", franchiseeCode: "100233",
    items: [{ name: "Loader Transparente", qty: 8, price: 29.9 }],
    total: 239.2, status: "entregue",
    subtotal: 239.2, freight: 0,
    payments: [{ method: "PIX", value: 239.2 }],
    delivery: { type: "entrega", address: "Rua Parana 100", city: "Belo Horizonte, MG", zip: "30100-000", deliveryDate: "2026-03-05", deliveredTo: "Ana" },
  },
];

/* ── Helpers ── */
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[.\-\/\s\+\(\)#]/g, "");

function handleTrackingClick(e: React.MouseEvent, tracking: string) {
  e.stopPropagation();
  navigator.clipboard.writeText(tracking);
  toast.success("Código copiado!", { description: tracking });
  window.open(`https://www.linkcorreios.com.br/?id=${tracking}`, "_blank");
}

/* ── Component ── */
export default function InternalPedidos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [periodFilter, setPeriodFilter] = useState<string>("todos");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  /* Summary stats */
  const stats = useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    const monthOrders = mockStaffOrders.filter(o => {
      const d = new Date(o.date + "T00:00:00");
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const totalRevenue = monthOrders.reduce((sum, o) => o.status !== "cancelado" ? sum + o.total : sum, 0);
    const pendingCount = mockStaffOrders.filter(o => o.status === "pendente").length;
    return {
      totalMonth: monthOrders.length,
      revenue: totalRevenue,
      pending: pendingCount,
    };
  }, []);

  /* Filter */
  const filtered = useMemo(() => {
    return mockStaffOrders
      .filter(o => {
        // Search
        if (searchTerm) {
          const q = norm(searchTerm);
          const matchNum = norm(o.number).includes(q);
          const matchName = norm(o.franchiseeName).includes(q);
          const matchCode = norm(o.franchiseeCode).includes(q);
          const matchItem = o.items.some(i => norm(i.name).includes(q));
          if (!matchNum && !matchName && !matchCode && !matchItem) return false;
        }
        // Status
        if (statusFilter !== "todos" && o.status !== statusFilter) return false;
        // Period
        if (periodFilter !== "todos") {
          const d = new Date(o.date + "T00:00:00");
          const now = new Date();
          if (periodFilter === "7d") {
            const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 7);
            if (d < cutoff) return false;
          } else if (periodFilter === "30d") {
            const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 30);
            if (d < cutoff) return false;
          } else if (periodFilter === "90d") {
            const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 90);
            if (d < cutoff) return false;
          }
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchTerm, statusFilter, periodFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSearch = (v: string) => { setSearchTerm(v); setCurrentPage(1); };
  const handleStatus = (v: string) => { setStatusFilter(v); setCurrentPage(1); };
  const handlePeriod = (v: string) => { setPeriodFilter(v); setCurrentPage(1); };

  /* Group by month */
  const grouped = paginated.reduce<Record<string, StaffOrder[]>>((acc, order) => {
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
        <h1 className="text-2xl font-bold text-primary">Pedidos</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie todos os pedidos dos franqueados</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-3 rounded-lg border border-app-card-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pedidos este mês</p>
            <p className="text-xl font-bold text-foreground">{stats.totalMonth}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-app-card-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Faturamento do mês</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(stats.revenue)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-app-card-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="text-xl font-bold text-foreground">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Orders list */}
      <DashboardCard icon={Package} title="Todos os Pedidos">
        {/* Filters */}
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nº pedido, franqueado, ID ou produto..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-8 pl-8 text-xs rounded-md"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatus}>
            <SelectTrigger className="h-8 w-full sm:w-[160px] text-xs">
              <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="disponivel_retirada">Disp. p/ Retirada</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={periodFilter} onValueChange={handlePeriod}>
            <SelectTrigger className="h-8 w-full sm:w-[140px] text-xs">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo período</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-[11px] text-muted-foreground mt-2">
          {filtered.length} pedido{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Order cards grouped by month */}
        <div className="mt-3 space-y-5">
          {Object.entries(grouped).map(([month, orders]) => (
            <div key={month}>
              <h3 className="text-sm font-bold text-foreground capitalize mb-2">{month}</h3>
              <div className="space-y-2">
                {orders.map((order) => {
                  const itemsSummary = order.items.map(i => `${i.name} x${i.qty}`).join(", ");
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
                        {/* Row 1: Number + date + franchisee + total */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base font-extrabold text-foreground">{order.number}</span>
                            <span className="text-[11px] text-muted-foreground">{formatDate(order.date)}</span>
                            <span className="hidden sm:inline-flex text-[11px] text-muted-foreground">•</span>
                            <span className="hidden sm:inline-flex text-[11px] font-medium text-foreground/80 truncate">
                              {order.franchiseeName} <span className="text-muted-foreground font-normal">#{order.franchiseeCode}</span>
                            </span>
                          </div>
                          <span className="hidden sm:block text-sm font-bold whitespace-nowrap">{formatCurrency(order.total)}</span>
                          <span className="sm:hidden text-sm font-bold whitespace-nowrap">{formatCurrency(order.total)}</span>
                        </div>
                        {/* Row 1.5 (mobile): franchisee name */}
                        <p className="sm:hidden text-[11px] font-medium text-foreground/80 truncate">
                          {order.franchiseeName} <span className="text-muted-foreground font-normal">#{order.franchiseeCode}</span>
                        </p>
                        {/* Row 2: items + status + tracking */}
                        <div className="flex items-center justify-between gap-2">
                          <StatusBadge status={order.status} />
                          <p className="hidden sm:block text-xs text-muted-foreground truncate max-w-[40%] text-right">{itemsSummary}</p>
                          {order.status === "enviado" && order.tracking && (
                            <button
                              onClick={(e) => handleTrackingClick(e, order.tracking!)}
                              className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors ml-auto sm:ml-0"
                              title="Rastrear pedido"
                            >
                              <span className="text-[11px] font-mono">{order.tracking}</span>
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          )}
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

          {/* Pagination */}
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

      {/* Order detail dialog (reused from franchisee) */}
      <OrderDetailDialog order={detailOrder} onClose={() => setDetailOrder(null)} />
    </div>
  );
}

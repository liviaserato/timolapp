import { useMemo, useState } from "react";
import {
  Ticket,
  Search,
  X,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Inbox,
  TrendingUp,
  Hourglass,
  Plus,
} from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TicketDetailDialog, { type TicketDetail } from "@/components/app/suporte/TicketDetailDialog";
import { toast } from "sonner";

type StaffStatus = "aberto" | "em_andamento" | "respondido" | "concluido" | "expirado";
type Departamento =
  | "Cadastro"
  | "Financeiro"
  | "Franquia"
  | "Rede"
  | "Pedidos"
  | "Produtos"
  | "Clientes"
  | "Treinamentos"
  | "Outro";

interface StaffTicket {
  id: string;
  numero: string;
  assunto: string;
  franqueado: string;
  franchiseId: string;
  departamento: Departamento;
  status: StaffStatus;
  dataAbertura: string;
  ultimaAtualizacao: string;
  slaHoras: number;
}

const mockTickets: StaffTicket[] = [
  { id: "1", numero: "#00142", assunto: "Dúvida sobre pontos acumulados", franqueado: "Lívia Serato", franchiseId: "100231", departamento: "Financeiro", status: "em_andamento", dataAbertura: "06/03/2026", ultimaAtualizacao: "08/03/2026", slaHoras: 18 },
  { id: "2", numero: "#00138", assunto: "Erro no pagamento do pedido", franqueado: "Carlos Mendes", franchiseId: "100232", departamento: "Pedidos", status: "respondido", dataAbertura: "02/03/2026", ultimaAtualizacao: "05/03/2026", slaHoras: 4 },
  { id: "3", numero: "#00141", assunto: "Solicitação de upgrade", franqueado: "Ana Costa", franchiseId: "100233", departamento: "Franquia", status: "aberto", dataAbertura: "08/03/2026", ultimaAtualizacao: "08/03/2026", slaHoras: 2 },
  { id: "4", numero: "#00135", assunto: "Como adicionar novo cliente", franqueado: "Pedro Lima", franchiseId: "100236", departamento: "Clientes", status: "concluido", dataAbertura: "01/03/2026", ultimaAtualizacao: "02/03/2026", slaHoras: 6 },
  { id: "5", numero: "#00133", assunto: "Material de treinamento Bronze", franqueado: "Fernanda Santos", franchiseId: "100235", departamento: "Treinamentos", status: "aberto", dataAbertura: "07/03/2026", ultimaAtualizacao: "07/03/2026", slaHoras: 24 },
  { id: "6", numero: "#00128", assunto: "Estoque do produto X", franqueado: "Roberto Almeida", franchiseId: "100234", departamento: "Produtos", status: "em_andamento", dataAbertura: "04/03/2026", ultimaAtualizacao: "06/03/2026", slaHoras: 36 },
  { id: "7", numero: "#00125", assunto: "Indireto não aparece na rede", franqueado: "Maria Silva", franchiseId: "100237", departamento: "Rede", status: "expirado", dataAbertura: "20/02/2026", ultimaAtualizacao: "25/02/2026", slaHoras: 120 },
  { id: "8", numero: "#00120", assunto: "Trocar e-mail cadastrado", franqueado: "Juan García", franchiseId: "100238", departamento: "Cadastro", status: "concluido", dataAbertura: "18/02/2026", ultimaAtualizacao: "19/02/2026", slaHoras: 3 },
];

const statusConfig: Record<StaffStatus, { label: string; color: string; icon: typeof Clock }> = {
  aberto: { label: "Aberto", color: "bg-blue-100 text-blue-700", icon: Inbox },
  em_andamento: { label: "Em andamento", color: "bg-amber-100 text-amber-700", icon: Clock },
  respondido: { label: "Respondido", color: "bg-purple-100 text-purple-700", icon: CheckCircle2 },
  concluido: { label: "Concluído", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  expirado: { label: "Expirado", color: "bg-red-100 text-red-700", icon: AlertCircle },
};

const DEPARTAMENTOS: ("todos" | Departamento)[] = [
  "todos",
  "Cadastro",
  "Financeiro",
  "Franquia",
  "Rede",
  "Pedidos",
  "Produtos",
  "Clientes",
  "Treinamentos",
  "Outro",
];

function buildTicketDetail(t: StaffTicket): TicketDetail {
  // Map staff status -> dialog status
  const statusMap: Record<StaffStatus, TicketDetail["status"]> = {
    aberto: "em_andamento",
    em_andamento: "em_andamento",
    respondido: "respondido",
    concluido: "concluido",
    expirado: "expirado",
  };
  return {
    id: t.id,
    numero: t.numero,
    assunto: t.assunto,
    categoria: t.departamento,
    status: statusMap[t.status],
    descricaoInicial: `Chamado aberto por ${t.franqueado} (ID ${t.franchiseId}) em ${t.dataAbertura}.`,
    dataAbertura: t.dataAbertura,
    ultimaAtualizacao: t.ultimaAtualizacao,
    historico: [
      {
        id: `${t.id}-h1`,
        autor: "usuario",
        nomeAutor: t.franqueado,
        mensagem: `Olá, gostaria de tratar sobre: ${t.assunto}.`,
        dataHora: t.dataAbertura,
      },
      {
        id: `${t.id}-h2`,
        autor: "equipe",
        nomeAutor: "Equipe Timol",
        mensagem: "Recebemos seu chamado e estamos analisando. Em breve retornaremos com novidades.",
        dataHora: t.ultimaAtualizacao,
      },
    ],
  };
}

export default function StaffTicketsSection() {
  const [statusFilter, setStatusFilter] = useState<"todos" | StaffStatus>("todos");
  const [deptFilter, setDeptFilter] = useState<"todos" | Departamento>("todos");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openTicket(t: StaffTicket) {
    setSelectedTicket(buildTicketDetail(t));
    setDialogOpen(true);
  }

  const indicadores = useMemo(() => {
    const total = mockTickets.length;
    const abertos = mockTickets.filter((t) => t.status === "aberto").length;
    const andamento = mockTickets.filter((t) => t.status === "em_andamento").length;
    const concluidos = mockTickets.filter((t) => t.status === "concluido").length;
    const expirados = mockTickets.filter((t) => t.status === "expirado").length;
    const slaMedio =
      mockTickets.reduce((acc, t) => acc + t.slaHoras, 0) / Math.max(mockTickets.length, 1);
    return { total, abertos, andamento, concluidos, expirados, slaMedio: Math.round(slaMedio) };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockTickets.filter((t) => {
      if (statusFilter !== "todos" && t.status !== statusFilter) return false;
      if (deptFilter !== "todos" && t.departamento !== deptFilter) return false;
      if (q) {
        const blob = `${t.numero} ${t.assunto} ${t.franqueado} ${t.franchiseId}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [search, statusFilter, deptFilter]);

  return (
    <div className="space-y-4">
      {/* Indicadores */}
      <DashboardCard icon={TrendingUp} title="Indicadores de chamados">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-2">
          {[
            { label: "Total", value: indicadores.total, color: "text-foreground", icon: Ticket },
            { label: "Abertos", value: indicadores.abertos, color: "text-blue-700", icon: Inbox },
            { label: "Em andamento", value: indicadores.andamento, color: "text-amber-700", icon: Clock },
            { label: "Concluídos", value: indicadores.concluidos, color: "text-emerald-700", icon: CheckCircle2 },
            { label: "Expirados", value: indicadores.expirados, color: "text-red-700", icon: AlertCircle },
            { label: "SLA médio (h)", value: indicadores.slaMedio, color: "text-foreground", icon: Hourglass },
          ].map((i) => {
            const Icon = i.icon;
            return (
              <div
                key={i.label}
                className="rounded-lg border border-border bg-card p-3 flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[11px]">{i.label}</span>
                </div>
                <p className={`text-xl font-bold ${i.color}`}>{i.value}</p>
              </div>
            );
          })}
        </div>
      </DashboardCard>

      {/* Lista */}
      <DashboardCard
        icon={Ticket}
        title="Chamados recebidos"
        headerRight={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número, assunto ou franqueado..."
                className="h-8 pl-8 pr-8 text-xs rounded-full bg-card border-2 border-app-card-border focus-visible:ring-1"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs text-muted-foreground shrink-0"
              onClick={() => toast.info("Abrir novo chamado (em breve)")}
            >
              <Plus className="h-3.5 w-3.5" />
              Novo chamado
            </Button>
          </div>
        }
      >
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="flex-1">
            <TabsList className="bg-transparent p-0 h-auto gap-1 flex-wrap">
              {(["todos", "aberto", "em_andamento", "respondido", "concluido", "expirado"] as const).map((s) => (
                <TabsTrigger
                  key={s}
                  value={s}
                  className="text-xs rounded-full px-3 py-1.5 border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary"
                >
                  {s === "todos" ? "Todos" : statusConfig[s].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v as typeof deptFilter)}>
            <SelectTrigger className="h-8 text-xs w-[180px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTAMENTOS.map((d) => (
                <SelectItem key={d} value={d} className="text-xs">
                  {d === "todos" ? "Todos os departamentos" : d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhum chamado encontrado com os filtros atuais.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((t) => {
                const st = statusConfig[t.status];
                const StIcon = st.icon;
                return (
                  <button
                    key={t.id}
                    className="w-full flex items-center gap-3 py-3 px-1 text-left hover:bg-muted/50 rounded transition-colors"
                  >
                    <StIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        <span className="text-muted-foreground">{t.numero}</span> {t.assunto}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.franchiseId} – {t.franqueado} · {t.departamento} · atualizado em {t.ultimaAtualizacao}
                      </p>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] shrink-0 ${st.color}`}>
                      {st.label}
                    </Badge>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DashboardCard>
    </div>
  );
}

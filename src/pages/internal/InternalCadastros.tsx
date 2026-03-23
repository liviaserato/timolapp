import { useState, useMemo } from "react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Filter, X, Phone, Mail, KeyRound, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Types ── */
interface Franchisee {
  id: string;
  franchiseId: string;
  fullName: string;
  document: string;
  birthDate: string;
  gender: string;
  email: string;
  phone: string;
  username: string;
  city: string;
  state: string;
  country: string;
  planCode: string;
  planLabel: string;
  franchiseStatus: "active" | "suspended" | "cancelled";
  activationStatus: "activated" | "pending" | "inactive";
  qualification: "starter" | "bronze" | "silver" | "gold" | "platinum" | "diamond";
  sponsorName: string;
  sponsorId: string;
  createdAt: string;
}

/* ── Mock Data ── */
const mockFranchisees: Franchisee[] = [
  { id: "1", franchiseId: "100231", fullName: "Lívia Serato", document: "123.456.789-00", birthDate: "15/03/1990", gender: "Feminino", email: "livia.serato@email.com", phone: "+55 11 99999-0000", username: "livia.serato", city: "São Paulo", state: "SP", country: "Brasil", planCode: "gold", planLabel: "Ouro", franchiseStatus: "active", activationStatus: "activated", qualification: "gold", sponsorName: "Maria Silva", sponsorId: "99001", createdAt: "2024-01-15" },
  { id: "2", franchiseId: "100232", fullName: "Carlos Eduardo Mendes", document: "987.654.321-00", birthDate: "22/08/1985", gender: "Masculino", email: "carlos.mendes@email.com", phone: "+55 21 98888-1111", username: "carlos.mendes", city: "Rio de Janeiro", state: "RJ", country: "Brasil", planCode: "platinum", planLabel: "Platina", franchiseStatus: "active", activationStatus: "activated", qualification: "platinum", sponsorName: "Lívia Serato", sponsorId: "100231", createdAt: "2024-02-20" },
  { id: "3", franchiseId: "100233", fullName: "Ana Paula Costa", document: "456.789.123-00", birthDate: "10/12/1992", gender: "Feminino", email: "ana.costa@email.com", phone: "+55 31 97777-2222", username: "ana.costa", city: "Belo Horizonte", state: "MG", country: "Brasil", planCode: "bronze", planLabel: "Bronze", franchiseStatus: "active", activationStatus: "pending", qualification: "starter", sponsorName: "Carlos Mendes", sponsorId: "100232", createdAt: "2024-03-10" },
  { id: "4", franchiseId: "100234", fullName: "Roberto Almeida Filho", document: "321.654.987-00", birthDate: "05/06/1978", gender: "Masculino", email: "roberto.almeida@email.com", phone: "+55 41 96666-3333", username: "roberto.almeida", city: "Curitiba", state: "PR", country: "Brasil", planCode: "silver", planLabel: "Prata", franchiseStatus: "suspended", activationStatus: "inactive", qualification: "bronze", sponsorName: "Ana Costa", sponsorId: "100233", createdAt: "2024-04-05" },
  { id: "5", franchiseId: "100235", fullName: "Fernanda Oliveira Santos", document: "654.321.987-00", birthDate: "18/09/1988", gender: "Feminino", email: "fernanda.santos@email.com", phone: "+55 51 95555-4444", username: "fernanda.santos", city: "Porto Alegre", state: "RS", country: "Brasil", planCode: "gold", planLabel: "Ouro", franchiseStatus: "active", activationStatus: "activated", qualification: "silver", sponsorName: "Roberto Almeida", sponsorId: "100234", createdAt: "2024-05-12" },
  { id: "6", franchiseId: "100236", fullName: "Pedro Henrique Lima", document: "789.123.456-00", birthDate: "30/01/1995", gender: "Masculino", email: "pedro.lima@email.com", phone: "+55 61 94444-5555", username: "pedro.lima", city: "Brasília", state: "DF", country: "Brasil", planCode: "bronze", planLabel: "Bronze", franchiseStatus: "cancelled", activationStatus: "inactive", qualification: "starter", sponsorName: "Fernanda Santos", sponsorId: "100235", createdAt: "2024-06-01" },
];

/* ── Helpers ── */
const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  suspended: "bg-amber-100 text-amber-700 border-amber-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  activated: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  active: "Ativa",
  suspended: "Suspensa",
  cancelled: "Cancelada",
  activated: "Ativada",
  pending: "Pendente",
  inactive: "Inativa",
};

const qualificationLabels: Record<string, string> = {
  starter: "Starter",
  bronze: "Bronze",
  silver: "Prata",
  gold: "Ouro",
  platinum: "Platina",
  diamond: "Diamante",
};

const qualificationColors: Record<string, string> = {
  starter: "bg-muted text-muted-foreground border-border",
  bronze: "bg-orange-100 text-orange-700 border-orange-200",
  silver: "bg-slate-100 text-slate-600 border-slate-200",
  gold: "bg-yellow-100 text-yellow-700 border-yellow-200",
  platinum: "bg-cyan-100 text-cyan-700 border-cyan-200",
  diamond: "bg-violet-100 text-violet-700 border-violet-200",
};

const planColors: Record<string, string> = {
  bronze: "bg-orange-100 text-orange-700 border-orange-200",
  silver: "bg-slate-100 text-slate-600 border-slate-200",
  gold: "bg-yellow-100 text-yellow-700 border-yellow-200",
  platinum: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

function getMonthLabel(date: Date): string {
  const m = date.toLocaleDateString("pt-BR", { month: "long" });
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${date.getFullYear()}`;
}

function getMonthRange(date: Date): { from: string; to: string } {
  const y = date.getFullYear();
  const m = date.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  return { from: first.toISOString().slice(0, 10), to: last.toISOString().slice(0, 10) };
}

const uniqueCities = Array.from(new Set(mockFranchisees.map(f => f.city))).sort();

/* ── Component ── */
export default function InternalCadastros() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [franchiseStatus, setFranchiseStatus] = useState<string>("all");
  const [activationStatus, setActivationStatus] = useState<string>("all");
  const [qualification, setQualification] = useState<string>("all");
  const [planType, setPlanType] = useState<string>("all");
  const [city, setCity] = useState<string>("all");

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [dateFilterMode, setDateFilterMode] = useState<"off" | "month" | "custom">("off");
  const [monthRef, setMonthRef] = useState(new Date());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const isCurrentMonth = monthRef.getFullYear() === today.getFullYear() && monthRef.getMonth() === today.getMonth();

  const hasFilters = franchiseStatus !== "all" || activationStatus !== "all" || qualification !== "all" || planType !== "all" || city !== "all" || search.trim() !== "" || dateFilterMode !== "off";

  /* Helper: filter list excluding one specific filter to know what's available */
  const getFilteredExcluding = (exclude: string) => {
    let list = mockFranchisees as Franchisee[];
    if (exclude !== "franchiseStatus" && franchiseStatus !== "all") list = list.filter(f => f.franchiseStatus === franchiseStatus);
    if (exclude !== "activationStatus" && activationStatus !== "all") list = list.filter(f => f.activationStatus === activationStatus);
    if (exclude !== "qualification" && qualification !== "all") list = list.filter(f => f.qualification === qualification);
    if (exclude !== "planType" && planType !== "all") list = list.filter(f => f.planCode === planType);
    if (exclude !== "city" && city !== "all") list = list.filter(f => f.city === city);
    if (dateFilterMode === "month") {
      const range = getMonthRange(monthRef);
      list = list.filter(f => f.createdAt >= range.from && f.createdAt <= range.to);
    } else if (dateFilterMode === "custom") {
      if (dateFrom) list = list.filter(f => f.createdAt >= dateFrom);
      if (dateTo) list = list.filter(f => f.createdAt <= dateTo);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        f.fullName.toLowerCase().includes(q) || f.franchiseId.includes(q) || f.document.includes(q) ||
        f.email.toLowerCase().includes(q) || f.phone.includes(q) || f.username.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) || f.sponsorName.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const availableFranchiseStatuses = useMemo(() => new Set(getFilteredExcluding("franchiseStatus").map(f => f.franchiseStatus)), [search, franchiseStatus, activationStatus, qualification, planType, city, dateFilterMode, monthRef, dateFrom, dateTo]);
  const availableActivationStatuses = useMemo(() => new Set(getFilteredExcluding("activationStatus").map(f => f.activationStatus)), [search, franchiseStatus, activationStatus, qualification, planType, city, dateFilterMode, monthRef, dateFrom, dateTo]);
  const availableQualifications = useMemo(() => new Set(getFilteredExcluding("qualification").map(f => f.qualification)), [search, franchiseStatus, activationStatus, qualification, planType, city, dateFilterMode, monthRef, dateFrom, dateTo]);
  const availablePlans = useMemo(() => new Set(getFilteredExcluding("planType").map(f => f.planCode)), [search, franchiseStatus, activationStatus, qualification, planType, city, dateFilterMode, monthRef, dateFrom, dateTo]);
  const availableCities = useMemo(() => new Set(getFilteredExcluding("city").map(f => f.city)), [search, franchiseStatus, activationStatus, qualification, planType, city, dateFilterMode, monthRef, dateFrom, dateTo]);

  const filtered = useMemo(() => {
    let list = mockFranchisees as Franchisee[];
    if (franchiseStatus !== "all") list = list.filter(f => f.franchiseStatus === franchiseStatus);
    if (activationStatus !== "all") list = list.filter(f => f.activationStatus === activationStatus);
    if (qualification !== "all") list = list.filter(f => f.qualification === qualification);
    if (planType !== "all") list = list.filter(f => f.planCode === planType);
    if (city !== "all") list = list.filter(f => f.city === city);

    if (dateFilterMode === "month") {
      const range = getMonthRange(monthRef);
      list = list.filter(f => f.createdAt >= range.from && f.createdAt <= range.to);
    } else if (dateFilterMode === "custom") {
      if (dateFrom) list = list.filter(f => f.createdAt >= dateFrom);
      if (dateTo) list = list.filter(f => f.createdAt <= dateTo);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        f.fullName.toLowerCase().includes(q) ||
        f.franchiseId.includes(q) ||
        f.document.includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.phone.includes(q) ||
        f.username.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) ||
        f.sponsorName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, franchiseStatus, activationStatus, qualification, planType, city, dateFilterMode, monthRef, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearch("");
    setFranchiseStatus("all");
    setActivationStatus("all");
    setQualification("all");
    setPlanType("all");
    setCity("all");
    setDateFilterMode("off");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-primary">Cadastros</h1>
        <p className="text-sm text-muted-foreground mt-1">Busque e gerencie os cadastros de franqueados</p>
      </header>

      <DashboardCard icon={Search} title="Buscar Franqueado">
        <div className="mt-2 space-y-3">
          {/* Search input + Date filter on same row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nome, ID, documento, e-mail, telefone, usuário, cidade..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-9 h-9 text-xs"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground shrink-0">Data cadastro:</span>
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
                    if (dateFilterMode === "custom") { setDateFilterMode("off"); }
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
                    {getMonthLabel(monthRef)}
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
          </div>

          {/* Dropdowns row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Select value={franchiseStatus} onValueChange={setFranchiseStatus}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Status Franquia" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status Franquia</SelectItem>
                <SelectItem value="active" disabled={!availableFranchiseStatuses.has("active")} className={!availableFranchiseStatuses.has("active") ? "opacity-40" : ""}>Ativa</SelectItem>
                <SelectItem value="suspended" disabled={!availableFranchiseStatuses.has("suspended")} className={!availableFranchiseStatuses.has("suspended") ? "opacity-40" : ""}>Suspensa</SelectItem>
                <SelectItem value="cancelled" disabled={!availableFranchiseStatuses.has("cancelled")} className={!availableFranchiseStatuses.has("cancelled") ? "opacity-40" : ""}>Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={activationStatus} onValueChange={setActivationStatus}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Ativação" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Ativação</SelectItem>
                <SelectItem value="activated" disabled={!availableActivationStatuses.has("activated")} className={!availableActivationStatuses.has("activated") ? "opacity-40" : ""}>Ativada</SelectItem>
                <SelectItem value="pending" disabled={!availableActivationStatuses.has("pending")} className={!availableActivationStatuses.has("pending") ? "opacity-40" : ""}>Pendente</SelectItem>
                <SelectItem value="inactive" disabled={!availableActivationStatuses.has("inactive")} className={!availableActivationStatuses.has("inactive") ? "opacity-40" : ""}>Inativa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={qualification} onValueChange={setQualification}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Qualificação" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualificação</SelectItem>
                <SelectItem value="starter" disabled={!availableQualifications.has("starter")} className={!availableQualifications.has("starter") ? "opacity-40" : ""}>Starter</SelectItem>
                <SelectItem value="bronze" disabled={!availableQualifications.has("bronze")} className={!availableQualifications.has("bronze") ? "opacity-40" : ""}>Bronze</SelectItem>
                <SelectItem value="silver" disabled={!availableQualifications.has("silver")} className={!availableQualifications.has("silver") ? "opacity-40" : ""}>Prata</SelectItem>
                <SelectItem value="gold" disabled={!availableQualifications.has("gold")} className={!availableQualifications.has("gold") ? "opacity-40" : ""}>Ouro</SelectItem>
                <SelectItem value="platinum" disabled={!availableQualifications.has("platinum")} className={!availableQualifications.has("platinum") ? "opacity-40" : ""}>Platina</SelectItem>
                <SelectItem value="diamond" disabled={!availableQualifications.has("diamond")} className={!availableQualifications.has("diamond") ? "opacity-40" : ""}>Diamante</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Tipo Franquia" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tipo Franquia</SelectItem>
                <SelectItem value="bronze" disabled={!availablePlans.has("bronze")} className={!availablePlans.has("bronze") ? "opacity-40" : ""}>Bronze</SelectItem>
                <SelectItem value="silver" disabled={!availablePlans.has("silver")} className={!availablePlans.has("silver") ? "opacity-40" : ""}>Prata</SelectItem>
                <SelectItem value="gold" disabled={!availablePlans.has("gold")} className={!availablePlans.has("gold") ? "opacity-40" : ""}>Ouro</SelectItem>
                <SelectItem value="platinum" disabled={!availablePlans.has("platinum")} className={!availablePlans.has("platinum") ? "opacity-40" : ""}>Platina</SelectItem>
              </SelectContent>
            </Select>

            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Cidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cidade</SelectItem>
                {uniqueCities.map(c => (
                  <SelectItem key={c} value={c} disabled={!availableCities.has(c)} className={!availableCities.has(c) ? "opacity-40" : ""}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
              </span>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </DashboardCard>

      {/* Results */}
      <div className="mt-4 space-y-3">
        {!hasFilters && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Filter className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Use a busca ou os filtros acima para encontrar franqueados</p>
          </div>
        )}

        {hasFilters && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum franqueado encontrado com os filtros selecionados</p>
          </div>
        )}

        {hasFilters && filtered.map(f => (
          <FranchiseeCard key={f.id} franchisee={f} />
        ))}
      </div>
    </div>
  );
}

/* ── Franchisee Result Card ── */
function FranchiseeCard({ franchisee: f }: { franchisee: Franchisee }) {
  return (
    <div className="rounded-[10px] border border-app-card-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground truncate">{f.fullName}</h3>
            <span className="text-xs text-muted-foreground shrink-0">#{f.franchiseId}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Patrocinador: {f.sponsorName} (#{f.sponsorId})
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${planColors[f.planCode] || ""}`}>{f.planLabel}</Badge>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${statusColors[f.franchiseStatus]}`}>{statusLabels[f.franchiseStatus]}</Badge>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${statusColors[f.activationStatus]}`}>{statusLabels[f.activationStatus]}</Badge>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${qualificationColors[f.qualification]}`}>{qualificationLabels[f.qualification]}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
          <Mail className="h-3 w-3 shrink-0" />
          <span className="truncate">{f.email}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
          <Phone className="h-3 w-3 shrink-0" />
          <span className="truncate">{f.phone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
          <KeyRound className="h-3 w-3 shrink-0" />
          <span className="truncate">{f.username}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{f.city}, {f.state}</span>
        </div>
      </div>
    </div>
  );
}

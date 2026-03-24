import { useState, useMemo } from "react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Search, Users, Filter, X, Phone, Mail, KeyRound, MapPin, ChevronRight, ChevronLeft,
  BarChart3, TrendingUp, TrendingDown, UserCheck, UserX, MapPinned, Info, Clock, Trophy, Layers
} from "lucide-react";
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
  countryFlag: string;
  planCode: string;
  planLabel: string;
  franchiseStatus: "active" | "suspended" | "cancelled";
  activationStatus: "activated" | "pending" | "inactive";
  qualification: "starter" | "bronze" | "silver" | "gold" | "platinum" | "diamond";
  sponsorName: string;
  sponsorId: string;
  createdAt: string;
  paidAt: string | null;
}

/* ── Mock Data ── */
const mockFranchisees: Franchisee[] = [
  { id: "1", franchiseId: "100231", fullName: "Lívia Serato", document: "123.456.789-00", birthDate: "15/03/1990", gender: "Feminino", email: "livia.serato@email.com", phone: "+55 11 99999-0000", username: "livia.serato", city: "São Paulo", state: "SP", country: "Brasil", countryFlag: "🇧🇷", planCode: "gold", planLabel: "Ouro", franchiseStatus: "active", activationStatus: "activated", qualification: "gold", sponsorName: "Maria Silva", sponsorId: "99001", createdAt: "2026-03-02", paidAt: "2026-03-05" },
  { id: "2", franchiseId: "100232", fullName: "Carlos Eduardo Mendes", document: "987.654.321-00", birthDate: "22/08/1985", gender: "Masculino", email: "carlos.mendes@email.com", phone: "+55 21 98888-1111", username: "carlos.mendes", city: "Rio de Janeiro", state: "RJ", country: "Brasil", countryFlag: "🇧🇷", planCode: "platinum", planLabel: "Platina", franchiseStatus: "active", activationStatus: "activated", qualification: "platinum", sponsorName: "Lívia Serato", sponsorId: "100231", createdAt: "2026-03-10", paidAt: "2026-03-12" },
  { id: "3", franchiseId: "100233", fullName: "Ana Paula Costa", document: "456.789.123-00", birthDate: "10/12/1992", gender: "Feminino", email: "ana.costa@email.com", phone: "+55 31 97777-2222", username: "ana.costa", city: "Belo Horizonte", state: "MG", country: "Brasil", countryFlag: "🇧🇷", planCode: "bronze", planLabel: "Bronze", franchiseStatus: "active", activationStatus: "pending", qualification: "starter", sponsorName: "Carlos Mendes", sponsorId: "100232", createdAt: "2026-03-15", paidAt: null },
  { id: "4", franchiseId: "100234", fullName: "Roberto Almeida Filho", document: "321.654.987-00", birthDate: "05/06/1978", gender: "Masculino", email: "roberto.almeida@email.com", phone: "+55 41 96666-3333", username: "roberto.almeida", city: "Curitiba", state: "PR", country: "Brasil", countryFlag: "🇧🇷", planCode: "silver", planLabel: "Prata", franchiseStatus: "suspended", activationStatus: "inactive", qualification: "bronze", sponsorName: "Ana Costa", sponsorId: "100233", createdAt: "2026-03-08", paidAt: "2026-03-20" },
  { id: "5", franchiseId: "100235", fullName: "Fernanda Oliveira Santos", document: "654.321.987-00", birthDate: "18/09/1988", gender: "Feminino", email: "fernanda.santos@email.com", phone: "+55 51 95555-4444", username: "fernanda.santos", city: "Porto Alegre", state: "RS", country: "Brasil", countryFlag: "🇧🇷", planCode: "gold", planLabel: "Ouro", franchiseStatus: "active", activationStatus: "activated", qualification: "silver", sponsorName: "Roberto Almeida", sponsorId: "100234", createdAt: "2026-03-01", paidAt: "2026-03-03" },
  { id: "6", franchiseId: "100236", fullName: "Pedro Henrique Lima", document: "789.123.456-00", birthDate: "30/01/1995", gender: "Masculino", email: "pedro.lima@email.com", phone: "+55 61 94444-5555", username: "pedro.lima", city: "São Paulo", state: "SP", country: "Brasil", countryFlag: "🇧🇷", planCode: "bronze", planLabel: "Bronze", franchiseStatus: "cancelled", activationStatus: "inactive", qualification: "starter", sponsorName: "Fernanda Santos", sponsorId: "100235", createdAt: "2026-02-15", paidAt: null },
  { id: "7", franchiseId: "100237", fullName: "Maria Silva", document: "111.222.333-00", birthDate: "12/07/1980", gender: "Feminino", email: "maria.silva@email.com", phone: "+55 11 93333-6666", username: "maria.silva", city: "São Paulo", state: "SP", country: "Brasil", countryFlag: "🇧🇷", planCode: "platinum", planLabel: "Platina", franchiseStatus: "active", activationStatus: "activated", qualification: "diamond", sponsorName: "Timol", sponsorId: "00001", createdAt: "2026-02-01", paidAt: "2026-02-02" },
  { id: "8", franchiseId: "100238", fullName: "Juan García López", document: "A12345678", birthDate: "03/11/1991", gender: "Masculino", email: "juan.garcia@email.com", phone: "+34 612 345 678", username: "juan.garcia", city: "Madrid", state: "MD", country: "España", countryFlag: "🇪🇸", planCode: "gold", planLabel: "Ouro", franchiseStatus: "active", activationStatus: "activated", qualification: "gold", sponsorName: "Maria Silva", sponsorId: "99001", createdAt: "2026-03-18", paidAt: "2026-03-19" },
];

/* Previous month mock for trend comparison */
const prevMonthCompleted = 3;
const prevMonthAbandoned = 2;

/* ── Helpers ── */
const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  suspended: "bg-amber-100 text-amber-700 border-amber-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  activated: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-muted text-muted-foreground border-border",
};

const statusLabelKeys: Record<string, string> = {
  active: "internal.cadastros.statusActive",
  suspended: "internal.cadastros.statusSuspended",
  cancelled: "internal.cadastros.statusCancelled",
  activated: "internal.cadastros.statusActivated",
  pending: "internal.cadastros.statusPending",
  inactive: "internal.cadastros.statusInactive",
};

const qualificationLabelKeys: Record<string, string> = {
  starter: "internal.cadastros.qualStarter",
  bronze: "internal.cadastros.qualBronze",
  silver: "internal.cadastros.qualSilver",
  gold: "internal.cadastros.qualGold",
  platinum: "internal.cadastros.qualPlatinum",
  diamond: "internal.cadastros.qualDiamond",
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

function getMonthLabel(date: Date, locale: string): string {
  const m = date.toLocaleDateString(locale, { month: "long" });
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

/* ── Horizontal bar chart helper ── */
function HBarChart({ items, barColorClass = "bg-primary/60", labelWidth = "w-14" }: { items: { label: string; count: number; extra?: string }[]; barColorClass?: string; labelWidth?: string }) {
  const max = Math.max(...items.map(i => i.count), 1);
  return (
    <div className="space-y-1.5">
      {items.map(({ label, count, extra }) => {
        const pct = Math.round((count / max) * 100);
        return (
          <div key={label} className="flex items-center gap-2">
            <span className={`text-xs ${labelWidth} shrink-0 text-muted-foreground truncate`}>
              {extra && <span className="mr-1">{extra}</span>}{label}
            </span>
            <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
              <div className={`h-full rounded ${barColorClass} transition-all`} style={{ width: `${Math.max(pct, count > 0 ? 6 : 0)}%` }} />
            </div>
            <span className="text-xs font-semibold w-6 text-right">{count}</span>
          </div>
        );
      })}
      {items.length === 0 && <p className="text-xs text-muted-foreground italic">—</p>}
    </div>
  );
}

/* ── Component ── */
export default function InternalCadastros() {
  const { t, language } = useLanguage();
  const dateLocale = language === "pt" ? "pt-BR" : language === "es" ? "es-ES" : "en-US";
  const [search, setSearch] = useState("");
  const [franchiseStatus, setFranchiseStatus] = useState<string>("all");
  const [activationStatus, setActivationStatus] = useState<string>("all");
  const [qualification, setQualification] = useState<string>("all");
  const [planType, setPlanType] = useState<string>("all");
  const [city, setCity] = useState<string>("all");

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [dateFilterMode, setDateFilterMode] = useState<"off" | "month" | "custom">("month");
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
        f.fullName.toLowerCase().includes(q) || f.franchiseId.includes(q) || f.document.includes(q) ||
        f.email.toLowerCase().includes(q) || f.phone.includes(q) || f.username.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) || f.sponsorName.toLowerCase().includes(q)
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

  /* ── Dashboard metrics ── */
  const completedCount = useMemo(() => filtered.filter(f => f.paidAt).length, [filtered]);
  const pendingCount = useMemo(() => filtered.filter(f => !f.paidAt).length, [filtered]);
  const conversionRate = (completedCount + pendingCount) > 0 ? Math.round((completedCount / (completedCount + pendingCount)) * 100) : 0;

  // Trend: only when month filter is active
  const showTrend = dateFilterMode === "month";
  const trendDiff = showTrend ? completedCount - prevMonthCompleted : 0;
  const trendUp = trendDiff > 0;
  const trendDown = trendDiff < 0;

  // Franchise status
  const activeCount = useMemo(() => filtered.filter(f => f.franchiseStatus === "active").length, [filtered]);
  const inactiveCount = useMemo(() => filtered.filter(f => f.franchiseStatus !== "active").length, [filtered]);

  // Avg franchises per franchisee (mock: unique sponsors who are active)
  const activeFranchisees = useMemo(() => {
    const uniqueOwners = new Set(filtered.filter(f => f.franchiseStatus === "active").map(f => f.fullName));
    return uniqueOwners.size;
  }, [filtered]);
  const avgFranchises = activeFranchisees > 0 ? (activeCount / activeFranchisees).toFixed(1) : "0";

  // Avg activation time (days between createdAt and paidAt)
  const avgActivationDays = useMemo(() => {
    const completed = filtered.filter(f => f.paidAt);
    if (completed.length === 0) return 0;
    const totalDays = completed.reduce((sum, f) => {
      const d1 = new Date(f.createdAt);
      const d2 = new Date(f.paidAt!);
      return sum + Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
    }, 0);
    return Math.round(totalDays / completed.length);
  }, [filtered]);

  // Plan breakdown
  const planBreakdown = useMemo(() => {
    const counts: Record<string, number> = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    filtered.forEach(f => { if (counts[f.planCode] !== undefined) counts[f.planCode]++; });
    return counts;
  }, [filtered]);

  // Qualification breakdown (active only)
  const qualBreakdown = useMemo(() => {
    const counts: Record<string, number> = { starter: 0, bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0 };
    filtered.filter(f => f.franchiseStatus === "active").forEach(f => {
      if (counts[f.qualification] !== undefined) counts[f.qualification]++;
    });
    return counts;
  }, [filtered]);

  // Top sponsors
  const topSponsors = useMemo(() => {
    const map = new Map<string, { name: string; id: string; count: number }>();
    filtered.forEach(f => {
      const existing = map.get(f.sponsorId);
      if (existing) existing.count++;
      else map.set(f.sponsorId, { name: f.sponsorName, id: f.sponsorId, count: 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filtered]);

  // Top cities
  const topCities = useMemo(() => {
    const map = new Map<string, { city: string; flag: string; count: number }>();
    filtered.forEach(f => {
      const existing = map.get(f.city);
      if (existing) existing.count++;
      else map.set(f.city, { city: f.city, flag: f.countryFlag, count: 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filtered]);

  const barColors: Record<string, string> = { bronze: "bg-orange-400", silver: "bg-slate-400", gold: "bg-yellow-400", platinum: "bg-cyan-400" };
  const qualBarColors: Record<string, string> = { starter: "bg-muted-foreground/40", bronze: "bg-orange-400", silver: "bg-slate-400", gold: "bg-yellow-400", platinum: "bg-cyan-400", diamond: "bg-violet-400" };

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-primary">{t("internal.cadastros.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("internal.cadastros.subtitle")}</p>
      </header>

      {/* ── Indicadores Card ── */}
      <DashboardCard icon={BarChart3} title={t("internal.cadastros.indicators")}>
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
                {t("internal.cadastros.month")}
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
                {t("internal.cadastros.period")}
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
                <span className="text-xs text-muted-foreground">{t("internal.cadastros.until")}</span>
                <Input type="date" className="h-9 w-[148px] text-xs" max={todayStr} value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            )}
          </div>

          {/* 4-column KPI + Chart layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ─── Column 1: Cadastros ─── */}
            <div className="flex flex-col gap-3">
               <div className="rounded-lg border border-app-card-border bg-muted/30 p-3 min-h-[120px] flex flex-col justify-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">{t("internal.cadastros.cardRegistrations")}</span>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex cursor-help"><Info className="h-3 w-3 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[240px] text-xs">{t("internal.cadastros.tooltipRegistrations")}</TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-3xl font-bold text-foreground">{completedCount}</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-primary/70 leading-tight">{t("internal.cadastros.completionRate")}</span>
                    <span className="text-sm font-semibold text-primary leading-tight">{conversionRate}%</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 text-center">{pendingCount} {t("internal.cadastros.pendingRegistrations")}</p>
              </div>
              {/* Chart: by franchise type */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{t("internal.cadastros.byFranchiseType")}</h4>
                {(["bronze", "silver", "gold", "platinum"] as const).map(plan => {
                  const count = planBreakdown[plan] || 0;
                  const planLabelKeys: Record<string, string> = { bronze: "internal.cadastros.qualBronze", silver: "internal.cadastros.qualSilver", gold: "internal.cadastros.qualGold", platinum: "internal.cadastros.qualPlatinum" };
                  return (
                    <div key={plan} className="flex items-center gap-2">
                      <span className="text-xs w-14 shrink-0 text-muted-foreground">{t(planLabelKeys[plan])}</span>
                      <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                        <div className={`h-full rounded ${barColors[plan]} transition-all`} style={{ width: `${count > 0 ? Math.max(Math.round((count / Math.max(...Object.values(planBreakdown), 1)) * 100), 6) : 0}%` }} />
                      </div>
                      <span className="text-xs font-semibold w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── Column 2: Status das Franquias ─── */}
            <div className="flex flex-col gap-3">
               <div className="rounded-lg border border-app-card-border bg-muted/30 p-3 min-h-[120px] flex flex-col justify-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">{t("internal.cadastros.cardFranchiseStatus")}</span>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex cursor-help"><Info className="h-3 w-3 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[240px] text-xs">{t("internal.cadastros.tooltipFranchiseStatus")}</TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-emerald-600">{activeCount}</span>
                    <p className="text-[11px] text-muted-foreground">{t("internal.cadastros.activeCount")}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-red-500">{inactiveCount}</span>
                    <p className="text-[11px] text-muted-foreground">{t("internal.cadastros.inactiveCount")}</p>
                  </div>
                </div>
              </div>
              {/* Chart: qualification (active only) */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{t("internal.cadastros.activeQualOnly")}</h4>
                {(["starter", "bronze", "silver", "gold", "platinum", "diamond"] as const).map(q => {
                  const count = qualBreakdown[q] || 0;
                  const maxQ = Math.max(...Object.values(qualBreakdown), 1);
                  return (
                    <div key={q} className="flex items-center gap-2">
                      <span className="text-xs w-14 shrink-0 text-muted-foreground">{t(qualificationLabelKeys[q])}</span>
                      <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                        <div className={`h-full rounded ${qualBarColors[q]} transition-all`} style={{ width: `${count > 0 ? Math.max(Math.round((count / maxQ) * 100), 6) : 0}%` }} />
                      </div>
                      <span className="text-xs font-semibold w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── Column 3: Média Franquias por Franqueado ─── */}
            <div className="flex flex-col gap-3">
               <div className="rounded-lg border border-app-card-border bg-muted/30 p-3 min-h-[120px] flex flex-col justify-center">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <h3 className="text-xs font-semibold text-foreground text-center mb-2 cursor-help flex items-center justify-center gap-1">
                      <Trophy className="h-4 w-4 text-primary shrink-0" />
                      <span>{t("internal.cadastros.cardAvgFranchisesLine1")}</span>
                      <Info className="h-3 w-3 text-muted-foreground shrink-0" />
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[240px] text-xs">{t("internal.cadastros.tooltipAvgFranchises")}</TooltipContent>
                </Tooltip>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-foreground">{Math.round(Number(avgFranchises))}</span>
                  <span className="text-xs text-muted-foreground">{t("internal.cadastros.franchisesLabel")}</span>
                </div>
              </div>
              {/* Chart: top sponsors */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{t("internal.cadastros.topSponsors")}</h4>
                <HBarChart
                  items={topSponsors.map(s => ({ label: s.name, count: s.count, extra: `#${s.id}` }))}
                  barColorClass="bg-primary/50"
                  labelWidth="w-[120px]"
                />
              </div>
            </div>

            {/* ─── Column 4: Tempo Médio de Ativação ─── */}
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-app-card-border bg-muted/30 p-3 min-h-[120px] flex flex-col justify-center">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <h3 className="text-xs font-semibold text-foreground text-center mb-2 cursor-help flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <span>{t("internal.cadastros.cardAvgActivationLine1")}</span>
                      <Info className="h-3 w-3 text-muted-foreground shrink-0" />
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[240px] text-xs">{t("internal.cadastros.tooltipAvgActivation")}</TooltipContent>
                </Tooltip>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-foreground">{avgActivationDays}</span>
                  <span className="text-xs text-muted-foreground">{t("internal.cadastros.days")}</span>
                </div>
              </div>
              {/* Chart: top cities */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <MapPinned className="h-3.5 w-3.5" />
                  {t("internal.cadastros.topCities")}
                </h4>
                <HBarChart
                  items={topCities.map(c => ({ label: c.city, count: c.count, extra: c.flag }))}
                  barColorClass="bg-primary/60"
                  labelWidth="w-[120px]"
                />
              </div>
            </div>
          </div>

          {/* Footer: abandoned registrations */}
          <p className="text-[11px] text-muted-foreground/70 pt-2 border-t border-app-card-border">
            {t("internal.cadastros.abandonedFooter").replace("{count}", String(prevMonthAbandoned))}
          </p>
        </div>
      </DashboardCard>

      {/* ── Buscar Franqueado ── */}
      <div className="mt-4">
        <DashboardCard icon={Search} title={t("internal.cadastros.searchFranchisee")}>
          <div className="mt-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("internal.cadastros.searchPlaceholder")}
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
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <Select value={franchiseStatus} onValueChange={setFranchiseStatus}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("internal.cadastros.franchiseStatus")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("internal.cadastros.franchiseStatus")}</SelectItem>
                  <SelectItem value="active" disabled={!availableFranchiseStatuses.has("active")} className={!availableFranchiseStatuses.has("active") ? "opacity-40" : ""}>{t("internal.cadastros.statusActive")}</SelectItem>
                  <SelectItem value="suspended" disabled={!availableFranchiseStatuses.has("suspended")} className={!availableFranchiseStatuses.has("suspended") ? "opacity-40" : ""}>{t("internal.cadastros.statusSuspended")}</SelectItem>
                  <SelectItem value="cancelled" disabled={!availableFranchiseStatuses.has("cancelled")} className={!availableFranchiseStatuses.has("cancelled") ? "opacity-40" : ""}>{t("internal.cadastros.statusCancelled")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={activationStatus} onValueChange={setActivationStatus}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("internal.cadastros.activationFilter")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("internal.cadastros.activationFilter")}</SelectItem>
                  <SelectItem value="activated" disabled={!availableActivationStatuses.has("activated")} className={!availableActivationStatuses.has("activated") ? "opacity-40" : ""}>{t("internal.cadastros.statusActivated")}</SelectItem>
                  <SelectItem value="pending" disabled={!availableActivationStatuses.has("pending")} className={!availableActivationStatuses.has("pending") ? "opacity-40" : ""}>{t("internal.cadastros.statusPending")}</SelectItem>
                  <SelectItem value="inactive" disabled={!availableActivationStatuses.has("inactive")} className={!availableActivationStatuses.has("inactive") ? "opacity-40" : ""}>{t("internal.cadastros.statusInactive")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={qualification} onValueChange={setQualification}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("internal.cadastros.qualificationFilter")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("internal.cadastros.qualificationFilter")}</SelectItem>
                  <SelectItem value="starter" disabled={!availableQualifications.has("starter")} className={!availableQualifications.has("starter") ? "opacity-40" : ""}>{t("internal.cadastros.qualStarter")}</SelectItem>
                  <SelectItem value="bronze" disabled={!availableQualifications.has("bronze")} className={!availableQualifications.has("bronze") ? "opacity-40" : ""}>{t("internal.cadastros.qualBronze")}</SelectItem>
                  <SelectItem value="silver" disabled={!availableQualifications.has("silver")} className={!availableQualifications.has("silver") ? "opacity-40" : ""}>{t("internal.cadastros.qualSilver")}</SelectItem>
                  <SelectItem value="gold" disabled={!availableQualifications.has("gold")} className={!availableQualifications.has("gold") ? "opacity-40" : ""}>{t("internal.cadastros.qualGold")}</SelectItem>
                  <SelectItem value="platinum" disabled={!availableQualifications.has("platinum")} className={!availableQualifications.has("platinum") ? "opacity-40" : ""}>{t("internal.cadastros.qualPlatinum")}</SelectItem>
                  <SelectItem value="diamond" disabled={!availableQualifications.has("diamond")} className={!availableQualifications.has("diamond") ? "opacity-40" : ""}>{t("internal.cadastros.qualDiamond")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={planType} onValueChange={setPlanType}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("internal.cadastros.franchiseType")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("internal.cadastros.franchiseType")}</SelectItem>
                  <SelectItem value="bronze" disabled={!availablePlans.has("bronze")} className={!availablePlans.has("bronze") ? "opacity-40" : ""}>{t("internal.cadastros.qualBronze")}</SelectItem>
                  <SelectItem value="silver" disabled={!availablePlans.has("silver")} className={!availablePlans.has("silver") ? "opacity-40" : ""}>{t("internal.cadastros.qualSilver")}</SelectItem>
                  <SelectItem value="gold" disabled={!availablePlans.has("gold")} className={!availablePlans.has("gold") ? "opacity-40" : ""}>{t("internal.cadastros.qualGold")}</SelectItem>
                  <SelectItem value="platinum" disabled={!availablePlans.has("platinum")} className={!availablePlans.has("platinum") ? "opacity-40" : ""}>{t("internal.cadastros.qualPlatinum")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("internal.cadastros.city")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("internal.cadastros.city")}</SelectItem>
                  {uniqueCities.map(c => (
                    <SelectItem key={c} value={c} disabled={!availableCities.has(c)} className={!availableCities.has(c) ? "opacity-40" : ""}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {filtered.length} {filtered.length !== 1 ? t("internal.cadastros.resultsFoundPlural") : t("internal.cadastros.resultsFound")}
                </span>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                  {t("internal.cadastros.clearFilters")}
                </Button>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Results */}
      <div className="mt-4 space-y-3">
        {!hasFilters && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Filter className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">{t("internal.cadastros.useSearchHint")}</p>
          </div>
        )}

        {hasFilters && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">{t("internal.cadastros.noResults")}</p>
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
  const { t } = useLanguage();
  return (
    <div className="rounded-[10px] border border-app-card-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground truncate">{f.fullName}</h3>
            <span className="text-xs text-muted-foreground shrink-0">#{f.franchiseId}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("internal.cadastros.sponsor")}: {f.sponsorName} (#{f.sponsorId})
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${planColors[f.planCode] || ""}`}>{t(qualificationLabelKeys[f.planCode] || f.planCode)}</Badge>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${statusColors[f.franchiseStatus]}`}>{t(statusLabelKeys[f.franchiseStatus])}</Badge>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${statusColors[f.activationStatus]}`}>{t(statusLabelKeys[f.activationStatus])}</Badge>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${qualificationColors[f.qualification]}`}>{t(qualificationLabelKeys[f.qualification])}</Badge>
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

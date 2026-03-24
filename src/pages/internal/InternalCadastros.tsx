import { useState, useMemo } from "react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Search, Users, Filter, X, Phone, Mail, MapPin, ChevronRight, ChevronLeft,
  BarChart3, UserCheck, UserX, MapPinned, Info, Clock, Trophy, Layers, TrendingUp, TrendingDown,
  Calendar, Award, ArrowDownRight, ArrowUpRight, MapPinHouse, Landmark, Pencil, Lock,
  FileText, Cake, Gem
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { qualificationConfig } from "@/components/app/rede/mock-data";

/* ── Types ── */
interface Franchisee {
  id: string;
  franchiseId: string;
  extraFranchiseIds?: string[];
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
  qualification: "consultor" | "distribuidor" | "lider" | "rubi" | "esmeralda" | "diamante";
  sponsorName: string;
  sponsorId: string;
  createdAt: string;
  paidAt: string | null;
}

/* ── Mock Data ── */
const mockFranchisees: Franchisee[] = [
  { id: "1", franchiseId: "100231", fullName: "Lívia Serato", document: "123.456.789-00", birthDate: "15/03/1990", gender: "Feminino", email: "livia.serato@email.com", phone: "+55 11 99999-0000", username: "livia.serato", city: "São Paulo", state: "SP", country: "Brasil", countryFlag: "🇧🇷", planCode: "gold", planLabel: "Ouro", franchiseStatus: "active", activationStatus: "activated", qualification: "esmeralda", sponsorName: "Maria Silva", sponsorId: "99001", createdAt: "2026-03-02", paidAt: "2026-03-05" },
  { id: "2", franchiseId: "100232", fullName: "Carlos Eduardo Mendes", document: "987.654.321-00", birthDate: "22/08/1985", gender: "Masculino", email: "carlos.mendes@email.com", phone: "+55 21 98888-1111", username: "carlos.mendes", city: "Rio de Janeiro", state: "RJ", country: "Brasil", countryFlag: "🇧🇷", planCode: "platinum", planLabel: "Platina", franchiseStatus: "active", activationStatus: "activated", qualification: "rubi", sponsorName: "Lívia Serato", sponsorId: "100231", createdAt: "2026-03-10", paidAt: "2026-03-12" },
  { id: "3", franchiseId: "100233", fullName: "Ana Paula Costa", document: "456.789.123-00", birthDate: "10/12/1992", gender: "Feminino", email: "ana.costa@email.com", phone: "+55 31 97777-2222", username: "ana.costa", city: "Belo Horizonte", state: "MG", country: "Brasil", countryFlag: "🇧🇷", planCode: "bronze", planLabel: "Bronze", franchiseStatus: "active", activationStatus: "pending", qualification: "consultor", sponsorName: "Carlos Mendes", sponsorId: "100232", createdAt: "2026-03-15", paidAt: null },
  { id: "4", franchiseId: "100234", fullName: "Roberto Almeida Filho", document: "321.654.987-00", birthDate: "05/06/1978", gender: "Masculino", email: "roberto.almeida@email.com", phone: "+55 41 96666-3333", username: "roberto.almeida", city: "Curitiba", state: "PR", country: "Brasil", countryFlag: "🇧🇷", planCode: "silver", planLabel: "Prata", franchiseStatus: "suspended", activationStatus: "inactive", qualification: "distribuidor", sponsorName: "Ana Costa", sponsorId: "100233", createdAt: "2026-03-08", paidAt: "2026-03-20" },
  { id: "5", franchiseId: "100235", fullName: "Fernanda Oliveira Santos", document: "654.321.987-00", birthDate: "18/09/1988", gender: "Feminino", email: "fernanda.santos@email.com", phone: "+55 51 95555-4444", username: "fernanda.santos", city: "Porto Alegre", state: "RS", country: "Brasil", countryFlag: "🇧🇷", planCode: "gold", planLabel: "Ouro", franchiseStatus: "active", activationStatus: "activated", qualification: "lider", sponsorName: "Roberto Almeida", sponsorId: "100234", createdAt: "2026-03-01", paidAt: "2026-03-03" },
  { id: "6", franchiseId: "100236", fullName: "Pedro Henrique Lima", document: "789.123.456-00", birthDate: "30/01/1995", gender: "Masculino", email: "pedro.lima@email.com", phone: "+55 61 94444-5555", username: "pedro.lima", city: "São Paulo", state: "SP", country: "Brasil", countryFlag: "🇧🇷", planCode: "bronze", planLabel: "Bronze", franchiseStatus: "cancelled", activationStatus: "inactive", qualification: "consultor", sponsorName: "Fernanda Santos", sponsorId: "100235", createdAt: "2026-02-15", paidAt: null },
  { id: "7", franchiseId: "100237", fullName: "Maria Silva", extraFranchiseIds: ["100299"], document: "111.222.333-00", birthDate: "12/07/1980", gender: "Feminino", email: "maria.silva@email.com", phone: "+55 11 93333-6666", username: "maria.silva", city: "São Paulo", state: "SP", country: "Brasil", countryFlag: "🇧🇷", planCode: "platinum", planLabel: "Platina", franchiseStatus: "active", activationStatus: "activated", qualification: "diamante", sponsorName: "Timol", sponsorId: "00001", createdAt: "2026-02-01", paidAt: "2026-02-02" },
  { id: "8", franchiseId: "100238", fullName: "Juan García López", document: "A12345678", birthDate: "03/11/1991", gender: "Masculino", email: "juan.garcia@email.com", phone: "+34 612 345 678", username: "juan.garcia", city: "Madrid", state: "MD", country: "España", countryFlag: "🇪🇸", planCode: "gold", planLabel: "Ouro", franchiseStatus: "active", activationStatus: "activated", qualification: "esmeralda", sponsorName: "Maria Silva", sponsorId: "99001", createdAt: "2026-03-18", paidAt: "2026-03-19" },
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

const statusLabelKeys: Record<string, string> = {
  active: "internal.cadastros.statusActive",
  suspended: "internal.cadastros.statusSuspended",
  cancelled: "internal.cadastros.statusCancelled",
  activated: "internal.cadastros.statusActivated",
  pending: "internal.cadastros.statusPending",
  inactive: "internal.cadastros.statusInactive",
};

const qualificationLabelKeys: Record<string, string> = {
  consultor: "internal.cadastros.qualConsultor",
  distribuidor: "internal.cadastros.qualDistribuidor",
  lider: "internal.cadastros.qualLider",
  rubi: "internal.cadastros.qualRubi",
  esmeralda: "internal.cadastros.qualEsmeralda",
  diamante: "internal.cadastros.qualDiamante",
};

const qualificationColors: Record<string, string> = {
  consultor: "bg-muted text-muted-foreground border-border",
  distribuidor: "bg-blue-100 text-blue-700 border-blue-200",
  lider: "bg-blue-200 text-blue-800 border-blue-300",
  rubi: "bg-red-100 text-red-700 border-red-200",
  esmeralda: "bg-emerald-100 text-emerald-700 border-emerald-200",
  diamante: "bg-violet-100 text-violet-700 border-violet-200",
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

/* ── Mock annual data ── */
const annualDataCurrentYear: Record<number, number> = { 0: 12, 1: 18, 2: 8, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 };
const annualDataPreviousYear: Record<number, number> = { 0: 8, 1: 14, 2: 11, 3: 9, 4: 15, 5: 20, 6: 17, 7: 22, 8: 13, 9: 19, 10: 16, 11: 10 };
const currentYearValue = new Date().getFullYear();
const currentMonthIdx = new Date().getMonth();


function HBarChart({ items, barColorClass = "bg-primary/60", labelWidth = "w-14" }: { items: { label: string; count: number; extra?: string; tooltip?: string }[]; barColorClass?: string; labelWidth?: string }) {
  const max = Math.max(...items.map(i => i.count), 1);
  return (
    <div className="space-y-1.5">
      {items.map(({ label, count, extra, tooltip }) => {
        const pct = Math.round((count / max) * 100);
        return (
          <div key={label} className="flex items-center gap-2" title={tooltip} aria-label={tooltip}>
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
      const q = search.toLowerCase().replace(/[.\-\/]/g, "");
      list = list.filter(f => {
        const norm = (s: string) => s.toLowerCase().replace(/[.\-\/]/g, "");
        return norm(f.fullName).includes(q) || norm(f.franchiseId).includes(q) || norm(f.document).includes(q) ||
          norm(f.email).includes(q) || norm(f.phone).includes(q) || norm(f.username).includes(q) ||
          norm(f.city).includes(q) || norm(f.sponsorName).includes(q);
      });
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
      const q = search.toLowerCase().replace(/[.\-\/]/g, "");
      list = list.filter(f => {
        const norm = (s: string) => s.toLowerCase().replace(/[.\-\/]/g, "");
        return norm(f.fullName).includes(q) || norm(f.franchiseId).includes(q) || norm(f.document).includes(q) ||
          norm(f.email).includes(q) || norm(f.phone).includes(q) || norm(f.username).includes(q) ||
          norm(f.city).includes(q) || norm(f.sponsorName).includes(q);
      });
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
    const counts: Record<string, number> = { consultor: 0, distribuidor: 0, lider: 0, rubi: 0, esmeralda: 0, diamante: 0 };
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
  const qualBarColors: Record<string, string> = { consultor: "bg-muted-foreground/40", distribuidor: "bg-blue-400", lider: "bg-blue-600", rubi: "bg-red-400", esmeralda: "bg-emerald-400", diamante: "bg-violet-400" };

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
              <div className="space-y-1.5 px-2">
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
              <div className="space-y-1.5 px-2">
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{t("internal.cadastros.activeQualOnly")}</h4>
                {(["consultor", "distribuidor", "lider", "rubi", "esmeralda", "diamante"] as const).map(q => {
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
                  <span className="text-xs text-muted-foreground">{t("internal.cadastros.franchisesPerPersonLabel")}</span>
                </div>
              </div>
              {/* Chart: top sponsors */}
              <div className="space-y-1.5 px-2">
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{t("internal.cadastros.topSponsors")}</h4>
                <HBarChart
                  items={topSponsors.map(s => ({ label: s.id, count: s.count, tooltip: s.name }))}
                  barColorClass="bg-primary/50"
                  labelWidth="w-[80px]"
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
                <div className="flex items-start justify-center gap-1">
                  <span className="text-xs text-muted-foreground mt-1">{t("internal.cadastros.avgLabel")}</span>
                  <span className="text-3xl font-bold text-foreground leading-none">{avgActivationDays}</span>
                  <span className="text-xs text-muted-foreground self-end mb-0.5">{t("internal.cadastros.days")}</span>
                </div>
              </div>
              {/* Chart: top cities */}
              <div className="space-y-1.5 px-2">
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
            {t("internal.cadastros.abandonedFooter").replace("{count}", String(2))}
          </p>
        </div>
      </DashboardCard>

      {/* ── Visão Anual de Cadastros ── */}
      <div className="mt-4">
        <DashboardCard icon={Calendar} title={t("internal.cadastros.annualVision")}>
          <div className="mt-2 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* ─── Card 1: Total do Ano + Variação ─── */}
              <div className="rounded-lg border border-app-card-border bg-muted/30 p-4 min-h-[120px] flex flex-col justify-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">{t("internal.cadastros.annualTotal")}</span>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex cursor-help"><Info className="h-3 w-3 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[260px] text-xs">{t("internal.cadastros.annualTooltip")}</TooltipContent>
                  </Tooltip>
                </div>
                {(() => {
                  const totalCurrent = Object.entries(annualDataCurrentYear).filter(([m]) => Number(m) <= currentMonthIdx).reduce((s, [, v]) => s + v, 0);
                  const totalPrev = Object.entries(annualDataPreviousYear).filter(([m]) => Number(m) <= currentMonthIdx).reduce((s, [, v]) => s + v, 0);
                  const variation = totalPrev > 0 ? Math.round(((totalCurrent - totalPrev) / totalPrev) * 100) : 0;
                  const isUp = variation >= 0;
                  return (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl font-bold text-foreground">{totalCurrent}</span>
                      <div className="flex items-center gap-1">
                        {isUp ? <ArrowUpRight className="h-4 w-4 text-emerald-600" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />}
                        <span className={`text-sm font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}>{isUp ? "+" : ""}{variation}%</span>
                      </div>
                    </div>
                  );
                })()}
                <p className="text-[10px] text-muted-foreground mt-1 text-center">{t("internal.cadastros.vsLastYear")}</p>
              </div>

              {/* ─── Card 2: Melhor e Pior mês ─── */}
              <div className="rounded-lg border border-app-card-border bg-muted/30 p-4 min-h-[120px] flex flex-col justify-center">
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">{t("internal.cadastros.insightsTitle")}</span>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex cursor-help"><Info className="h-3 w-3 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[240px] text-xs">{t("internal.cadastros.bestWorstTooltip")}</TooltipContent>
                  </Tooltip>
                </div>
                {(() => {
                  const monthsWithData = Object.entries(annualDataCurrentYear)
                    .filter(([m]) => Number(m) <= currentMonthIdx)
                    .map(([m, v]) => ({ month: Number(m), count: v }));
                  const best = monthsWithData.reduce((a, b) => b.count > a.count ? b : a, monthsWithData[0]);
                  const worst = monthsWithData.reduce((a, b) => b.count < a.count ? b : a, monthsWithData[0]);
                  const getMonthName = (m: number) => new Date(2026, m).toLocaleDateString(dateLocale, { month: "short" }).replace(".", "");
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-xs text-muted-foreground">{t("internal.cadastros.bestMonth")}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground capitalize">{getMonthName(best.month)} — {best.count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-xs text-muted-foreground">{t("internal.cadastros.worstMonth")}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground capitalize">{getMonthName(worst.month)} — {worst.count}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* ─── Card 3: Média Mensal ─── */}
              <div className="rounded-lg border border-app-card-border bg-muted/30 p-4 min-h-[120px] flex flex-col justify-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">{t("internal.cadastros.monthlyAvg")}</span>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex cursor-help"><Info className="h-3 w-3 text-muted-foreground" /></button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[240px] text-xs">{t("internal.cadastros.monthlyAvgTooltip")}</TooltipContent>
                  </Tooltip>
                </div>
                {(() => {
                  const total = Object.entries(annualDataCurrentYear).filter(([m]) => Number(m) <= currentMonthIdx).reduce((s, [, v]) => s + v, 0);
                  const elapsedMonths = currentMonthIdx + 1;
                  const avg = Math.round(total / elapsedMonths);
                  return (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-foreground">{avg}</span>
                      <span className="text-xs text-muted-foreground">{t("internal.cadastros.registrationsPerMonth")}</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

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
                  <SelectItem value="consultor" disabled={!availableQualifications.has("consultor")} className={!availableQualifications.has("consultor") ? "opacity-40" : ""}>{t("internal.cadastros.qualConsultor")}</SelectItem>
                  <SelectItem value="distribuidor" disabled={!availableQualifications.has("distribuidor")} className={!availableQualifications.has("distribuidor") ? "opacity-40" : ""}>{t("internal.cadastros.qualDistribuidor")}</SelectItem>
                  <SelectItem value="lider" disabled={!availableQualifications.has("lider")} className={!availableQualifications.has("lider") ? "opacity-40" : ""}>{t("internal.cadastros.qualLider")}</SelectItem>
                  <SelectItem value="rubi" disabled={!availableQualifications.has("rubi")} className={!availableQualifications.has("rubi") ? "opacity-40" : ""}>{t("internal.cadastros.qualRubi")}</SelectItem>
                  <SelectItem value="esmeralda" disabled={!availableQualifications.has("esmeralda")} className={!availableQualifications.has("esmeralda") ? "opacity-40" : ""}>{t("internal.cadastros.qualEsmeralda")}</SelectItem>
                  <SelectItem value="diamante" disabled={!availableQualifications.has("diamante")} className={!availableQualifications.has("diamante") ? "opacity-40" : ""}>{t("internal.cadastros.qualDiamante")}</SelectItem>
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

        {hasFilters && filtered.length > 0 && <RegistrationStatusLegend />}
      </div>
    </div>
  );
}

/* ── Registration status helpers ── */
type RegistrationStatus = "concluido" | "cancelado" | "pendente";

function getRegistrationStatus(f: Franchisee): RegistrationStatus {
  if (f.franchiseStatus === "cancelled") return "cancelado";
  if (f.paidAt) return "concluido";
  return "pendente";
}

const registrationStatusBorder: Record<RegistrationStatus, string> = {
  concluido: "border-l-[#003885]",
  cancelado: "border-l-[#8B0000]",
  pendente: "border-l-gray-400",
};

/* ── Franchisee Result Card ── */
function FranchiseeCard({ franchisee: f }: { franchisee: Franchisee }) {
  const { t } = useLanguage();
  const regStatus = getRegistrationStatus(f);
  const isCancelled = regStatus === "cancelado";
  const isActive = f.franchiseStatus === "active";
  const qualConfig = qualificationConfig[f.qualification];

  const planLabels: Record<string, string> = {
    bronze: "Bronze",
    silver: "Prata",
    gold: "Ouro",
    platinum: "Platina",
  };

  const isBrazilian = f.country === "Brasil";
  const docLabel = isBrazilian ? `CPF: ${f.document}` : `${f.document} · ${f.countryFlag} ${f.country}`;

  const allIds = [f.franchiseId, ...(f.extraFranchiseIds || [])];

  return (
    <div
      className={`rounded-r-lg rounded-l-[2px] border border-app-card-border bg-card overflow-hidden border-l-[5px] transition-shadow hover:shadow-md ${registrationStatusBorder[regStatus]} ${isCancelled ? "opacity-50" : ""}`}
    >
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-x-6">
          {/* ── Left side (Grids 1-3) ── */}
          <div className="flex-1 min-w-0">
            {/* ── Grid 1: Name + IDs + Sponsor ── */}
            <div className="mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`h-2 w-2 rounded-full shrink-0 ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                <span className="text-sm font-bold text-foreground">{f.fullName}</span>
                {allIds.map(id => (
                  <Badge key={id} variant="secondary" className="text-xs px-1.5 py-0 h-5 font-medium rounded-sm">
                    ID {id}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 ml-4">
                {t("internal.cadastros.sponsor")}: {f.sponsorName} (ID {f.sponsorId})
              </p>
            </div>

            {/* ── Grid 2 + Grid 3 side by side ── */}
            <div className="flex flex-col sm:flex-row gap-x-14 gap-y-2">
              {/* Grid 2: Registration details */}
              <div className="space-y-1.5 min-w-0">
                <p className="text-sm text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
                  {t("internal.cadastros.registrationDate")}: {f.createdAt.split("-").reverse().join("/")}
                </p>
                <p className="text-sm text-foreground flex items-center gap-1.5">
                  <Gem className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
                  Franquia {planLabels[f.planCode] || f.planCode}
                </p>
                {qualConfig && (
                  <p className="text-sm flex items-center gap-1.5">
                    <span className="text-foreground/70">{qualConfig.icon}</span>
                    <span className="text-foreground">{t(qualificationLabelKeys[f.qualification])}</span>
                  </p>
                )}
                <p className="flex items-center gap-1.5 text-sm text-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
                  <span className="truncate">{f.city}, {f.state} {f.countryFlag}</span>
                </p>
              </div>

              {/* Grid 3: Personal data */}
              <div className="space-y-1.5 min-w-0">
                <p className="flex items-center gap-1.5 text-sm text-foreground truncate">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-foreground/70" />{docLabel}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-foreground">
                  <Cake className="h-3.5 w-3.5 shrink-0 text-foreground/70" />{f.birthDate} · {f.gender}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-foreground/70" /><span className="truncate">{f.email}</span>
                </p>
                <p className="flex items-center gap-1.5 text-sm text-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-foreground/70" /><span className="truncate">{f.phone}</span>
                </p>
              </div>
            </div>
          </div>

          {/* ── Grid 4: Actions (right side, full height) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:w-[170px] shrink-0 mt-3 lg:mt-0">
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5 justify-start w-full">
              <MapPinHouse className="h-3 w-3" />
              {t("internal.cadastros.btnAddresses")}
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5 justify-start w-full">
              <Landmark className="h-3 w-3" />
              {t("internal.cadastros.btnFinancial")}
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5 justify-start w-full">
              <Pencil className="h-3 w-3" />
              {t("internal.cadastros.btnEdit")}
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5 justify-start w-full">
              <Lock className="h-3 w-3" />
              {t("internal.cadastros.btnCredentials")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Registration Status Legend ── */
function RegistrationStatusLegend() {
  const { t } = useLanguage();
  const items = [
    { label: t("internal.cadastros.regCompleted"), color: "bg-[#003885]" },
    { label: t("internal.cadastros.regCancelled"), color: "bg-[#8B0000]" },
    { label: t("internal.cadastros.regPending"), color: "bg-gray-400" },
  ];
  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-3 border-t border-border mt-4">
      {items.map(item => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className={`h-3 w-1 rounded-sm ${item.color}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

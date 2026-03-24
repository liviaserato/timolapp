import { useState, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Search, Users, Filter, X, Phone, Mail, MapPin, ChevronRight, ChevronLeft,
  BarChart3, UserCheck, UserX, MapPinned, Info, Clock, Trophy, Layers, TrendingUp, TrendingDown,
  Calendar, Award, ArrowDownRight, ArrowUpRight, MapPinHouse, Landmark, Pencil, Lock,
  FileText, Cake, Gem, ArrowUpDown
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { qualificationConfig } from "@/components/app/rede/mock-data";

/* ── Types ── */
interface FranchiseEntry {
  franchiseId: string;
  sponsorName: string;
  sponsorId: string;
  createdAt: string;
  planCode: string;
  planLabel: string;
  qualification: "consultor" | "distribuidor" | "lider" | "rubi" | "esmeralda" | "diamante";
  franchiseStatus: "active" | "suspended" | "cancelled";
  activationStatus: "activated" | "pending" | "inactive";
  paidAt: string | null;
}

interface Franchisee {
  id: string;
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
  franchises: FranchiseEntry[];
}

/* ── Mock Data ── */
const mockFranchisees: Franchisee[] = [
  { id: "1", fullName: "Lívia Serato", document: "123.456.789-00", birthDate: "15/03/1990", gender: "female", email: "livia.serato@email.com", phone: "+55 11 99999-0000", username: "livia.serato", city: "São Paulo", state: "SP", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "100231", sponsorName: "Maria Silva", sponsorId: "99001", createdAt: "2026-03-02", planCode: "gold", planLabel: "Ouro", qualification: "esmeralda", franchiseStatus: "active", activationStatus: "activated", paidAt: "2026-03-05" },
  ]},
  { id: "2", fullName: "Carlos Eduardo Mendes", document: "987.654.321-00", birthDate: "22/08/1985", gender: "male", email: "carlos.mendes@email.com", phone: "+55 21 98888-1111", username: "carlos.mendes", city: "Rio de Janeiro", state: "RJ", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "100232", sponsorName: "Lívia Serato", sponsorId: "100231", createdAt: "2026-03-10", planCode: "platinum", planLabel: "Platina", qualification: "rubi", franchiseStatus: "active", activationStatus: "activated", paidAt: "2026-03-12" },
  ]},
  { id: "3", fullName: "Ana Paula Costa", document: "456.789.123-00", birthDate: "10/12/1992", gender: "female", email: "ana.costa@email.com", phone: "+55 31 97777-2222", username: "ana.costa", city: "Belo Horizonte", state: "MG", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "100233", sponsorName: "Carlos Mendes", sponsorId: "100232", createdAt: "2026-03-15", planCode: "bronze", planLabel: "Bronze", qualification: "consultor", franchiseStatus: "active", activationStatus: "pending", paidAt: null },
  ]},
  { id: "4", fullName: "Roberto Almeida Filho", document: "321.654.987-00", birthDate: "05/06/1978", gender: "male", email: "roberto.almeida@email.com", phone: "+55 41 96666-3333", username: "roberto.almeida", city: "Curitiba", state: "PR", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "100234", sponsorName: "Ana Costa", sponsorId: "100233", createdAt: "2026-03-08", planCode: "silver", planLabel: "Prata", qualification: "distribuidor", franchiseStatus: "suspended", activationStatus: "inactive", paidAt: "2026-03-20" },
  ]},
  { id: "5", fullName: "Fernanda Oliveira Santos", document: "654.321.987-00", birthDate: "18/09/1988", gender: "female", email: "fernanda.santos@email.com", phone: "+55 51 95555-4444", username: "fernanda.santos", city: "Porto Alegre", state: "RS", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "100235", sponsorName: "Roberto Almeida", sponsorId: "100234", createdAt: "2026-03-01", planCode: "gold", planLabel: "Ouro", qualification: "lider", franchiseStatus: "active", activationStatus: "activated", paidAt: "2026-03-03" },
  ]},
  { id: "6", fullName: "Pedro Henrique Lima", document: "789.123.456-00", birthDate: "30/01/1995", gender: "male", email: "pedro.lima@email.com", phone: "+55 61 94444-5555", username: "pedro.lima", city: "São Paulo", state: "SP", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "100236", sponsorName: "Fernanda Santos", sponsorId: "100235", createdAt: "2026-02-15", planCode: "bronze", planLabel: "Bronze", qualification: "consultor", franchiseStatus: "cancelled", activationStatus: "inactive", paidAt: null },
  ]},
  { id: "7", fullName: "Maria Silva", document: "111.222.333-00", birthDate: "12/07/1980", gender: "female", email: "maria.silva@email.com", phone: "+55 11 93333-6666", username: "maria.silva", city: "São Paulo", state: "SP", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "100237", sponsorName: "Timol", sponsorId: "00001", createdAt: "2026-02-01", planCode: "platinum", planLabel: "Platina", qualification: "diamante", franchiseStatus: "active", activationStatus: "activated", paidAt: "2026-02-02" },
    { franchiseId: "100299", sponsorName: "Carlos Mendes", sponsorId: "100232", createdAt: "2026-03-10", planCode: "gold", planLabel: "Ouro", qualification: "rubi", franchiseStatus: "active", activationStatus: "activated", paidAt: "2026-03-11" },
  ]},
  { id: "8", fullName: "Juan García López", document: "A12345678", birthDate: "03/11/1991", gender: "male", email: "juan.garcia@email.com", phone: "+34 612 345 678", username: "juan.garcia", city: "Madrid", state: "MD", country: "España", countryFlag: "🇪🇸", franchises: [
    { franchiseId: "100238", sponsorName: "Maria Silva", sponsorId: "99001", createdAt: "2026-03-18", planCode: "gold", planLabel: "Ouro", qualification: "esmeralda", franchiseStatus: "active", activationStatus: "activated", paidAt: "2026-03-19" },
  ]},
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
/** Primary franchise accessor — uses first franchise sorted by createdAt */
const pf = (f: Franchisee): FranchiseEntry => f.franchises[0];

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

/* ── Registration status helpers (before component for filter use) ── */
type RegistrationStatus = "concluido" | "cancelado" | "pendente";

function getRegistrationStatus(f: Franchisee, fr?: FranchiseEntry): RegistrationStatus {
  const entry = fr || pf(f);
  if (entry.franchiseStatus === "cancelled") return "cancelado";
  if (entry.paidAt) return "concluido";
  return "pendente";
}

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
/* qualification priority for sorting */
const qualPriority: Record<string, number> = { consultor: 0, distribuidor: 1, lider: 2, rubi: 3, esmeralda: 4, diamante: 5 };

export default function InternalCadastros() {
  const { t, language } = useLanguage();
  const dateLocale = language === "pt" ? "pt-BR" : language === "es" ? "es-ES" : "en-US";
  const searchCardRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [showActive, setShowActive] = useState(true);
  const [showInactive, setShowInactive] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState<string>("all");
  const [qualification, setQualification] = useState<string>("all");
  const [planType, setPlanType] = useState<string>("all");

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [dateFilterMode, setDateFilterMode] = useState<"off" | "month" | "custom">("month");
  const [monthRef, setMonthRef] = useState(new Date());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const isCurrentMonth = monthRef.getFullYear() === today.getFullYear() && monthRef.getMonth() === today.getMonth();

  const franchiseStatusFilter = (!showActive && !showInactive) ? "none" : (!showActive ? "inactive" : (!showInactive ? "active" : "all"));
  const hasSearchFilters = franchiseStatusFilter !== "all" || registrationStatus !== "all" || qualification !== "all" || planType !== "all" || search.trim() !== "";
  const hasFilters = hasSearchFilters;

  const scrollToSearch = () => {
    searchCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* Helper: filter list excluding one specific filter to know what's available (search filters only, no date) */
  const getFilteredExcluding = (exclude: string) => {
     let list = mockFranchisees as Franchisee[];
    if (exclude !== "franchiseStatus" && franchiseStatusFilter !== "all") {
      if (franchiseStatusFilter === "none") list = [];
      else if (franchiseStatusFilter === "active") list = list.filter(f => pf(f).franchiseStatus === "active");
      else list = list.filter(f => pf(f).franchiseStatus !== "active");
    }
    if (exclude !== "registrationStatus" && registrationStatus !== "all") list = list.filter(f => getRegistrationStatus(f) === registrationStatus);
    if (exclude !== "qualification" && qualification !== "all") list = list.filter(f => pf(f).qualification === qualification);
    if (exclude !== "planType" && planType !== "all") list = list.filter(f => pf(f).planCode === planType);
    
    if (search.trim()) {
      const q = search.toLowerCase().replace(/[.\-\/]/g, "");
      list = list.filter(f => {
        const norm = (s: string) => s.toLowerCase().replace(/[.\-\/]/g, "");
        const anyFranchiseMatch = f.franchises.some(fr => norm(fr.franchiseId).includes(q) || norm(fr.sponsorName).includes(q));
        return norm(f.fullName).includes(q) || anyFranchiseMatch || norm(f.document).includes(q) ||
          norm(f.email).includes(q) || norm(f.phone).includes(q) || norm(f.username).includes(q) ||
          norm(f.city).includes(q);
      });
    }
    return list;
  };

  const availableQualifications = useMemo(() => new Set(getFilteredExcluding("qualification").map(f => pf(f).qualification)), [search, showActive, showInactive, registrationStatus, qualification, planType]);
  const availablePlans = useMemo(() => new Set(getFilteredExcluding("planType").map(f => pf(f).planCode)), [search, showActive, showInactive, registrationStatus, qualification, planType]);

  /* Search results (no date filter) */
  const filtered = useMemo(() => {
    let list = mockFranchisees as Franchisee[];
    if (franchiseStatusFilter === "none") return [];
    if (franchiseStatusFilter === "active") list = list.filter(f => pf(f).franchiseStatus === "active");
    else if (franchiseStatusFilter === "inactive") list = list.filter(f => pf(f).franchiseStatus !== "active");
    if (registrationStatus !== "all") list = list.filter(f => getRegistrationStatus(f) === registrationStatus);
    if (qualification !== "all") list = list.filter(f => pf(f).qualification === qualification);
    if (planType !== "all") list = list.filter(f => pf(f).planCode === planType);
    if (cityFilter) list = list.filter(f => f.city === cityFilter);
    if (search.trim()) {
      const q = search.toLowerCase().replace(/[.\-\/]/g, "");
      list = list.filter(f => {
        const norm = (s: string) => s.toLowerCase().replace(/[.\-\/]/g, "");
        const anyFranchiseMatch = f.franchises.some(fr => norm(fr.franchiseId).includes(q) || norm(fr.sponsorName).includes(q));
        return norm(f.fullName).includes(q) || anyFranchiseMatch || norm(f.document).includes(q) ||
          norm(f.email).includes(q) || norm(f.phone).includes(q) || norm(f.username).includes(q) ||
          norm(f.city).includes(q);
      });
    }
    // Sort
    if (sortBy === "recent") {
      list = [...list].sort((a, b) => pf(b).createdAt.localeCompare(pf(a).createdAt));
    } else if (sortBy === "qualification") {
      list = [...list].sort((a, b) => (qualPriority[pf(b).qualification] || 0) - (qualPriority[pf(a).qualification] || 0));
    } else if (sortBy === "active_first") {
      list = [...list].sort((a, b) => {
        const aActive = pf(a).franchiseStatus === "active" ? 0 : 1;
        const bActive = pf(b).franchiseStatus === "active" ? 0 : 1;
        return aActive - bActive;
      });
    }
    return list;
  }, [search, showActive, showInactive, registrationStatus, qualification, planType, cityFilter, sortBy]);

  /* Indicator metrics (only date filter, independent of search) */
  const indicatorFiltered = useMemo(() => {
    let list = mockFranchisees as Franchisee[];
    if (dateFilterMode === "month") {
      const range = getMonthRange(monthRef);
      list = list.filter(f => pf(f).createdAt >= range.from && pf(f).createdAt <= range.to);
    } else if (dateFilterMode === "custom") {
      if (dateFrom) list = list.filter(f => pf(f).createdAt >= dateFrom);
      if (dateTo) list = list.filter(f => pf(f).createdAt <= dateTo);
    }
    return list;
  }, [dateFilterMode, monthRef, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearch("");
    setSortBy("recent");
    setShowActive(true);
    setShowInactive(true);
    setRegistrationStatus("all");
    setQualification("all");
    setPlanType("all");
    setCitySearch("");
    setCityFilter("");
  };

  /* ── Dashboard metrics (based on date filter only) ── */
  const completedCount = useMemo(() => indicatorFiltered.filter(f => pf(f).paidAt).length, [indicatorFiltered]);
  const pendingCount = useMemo(() => indicatorFiltered.filter(f => !pf(f).paidAt).length, [indicatorFiltered]);
  const conversionRate = (completedCount + pendingCount) > 0 ? Math.round((completedCount / (completedCount + pendingCount)) * 100) : 0;

  // Franchise status
  const activeCount = useMemo(() => indicatorFiltered.filter(f => pf(f).franchiseStatus === "active").length, [indicatorFiltered]);
  const inactiveCount = useMemo(() => indicatorFiltered.filter(f => pf(f).franchiseStatus !== "active").length, [indicatorFiltered]);

  // Avg franchises per franchisee
  const activeFranchisees = useMemo(() => {
    const uniqueOwners = new Set(indicatorFiltered.filter(f => pf(f).franchiseStatus === "active").map(f => f.fullName));
    return uniqueOwners.size;
  }, [indicatorFiltered]);
  const avgFranchises = activeFranchisees > 0 ? (activeCount / activeFranchisees).toFixed(1) : "0";

  // Avg activation time
  const avgActivationDays = useMemo(() => {
    const completed = indicatorFiltered.filter(f => pf(f).paidAt);
    if (completed.length === 0) return 0;
    const totalDays = completed.reduce((sum, f) => {
      const d1 = new Date(pf(f).createdAt);
      const d2 = new Date(pf(f).paidAt!);
      return sum + Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
    }, 0);
    return Math.round(totalDays / completed.length);
  }, [indicatorFiltered]);

  // Plan breakdown
  const planBreakdown = useMemo(() => {
    const counts: Record<string, number> = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    indicatorFiltered.forEach(f => { if (counts[pf(f).planCode] !== undefined) counts[pf(f).planCode]++; });
    return counts;
  }, [indicatorFiltered]);

  // Qualification breakdown (active only)
  const qualBreakdown = useMemo(() => {
    const counts: Record<string, number> = { consultor: 0, distribuidor: 0, lider: 0, rubi: 0, esmeralda: 0, diamante: 0 };
    indicatorFiltered.filter(f => pf(f).franchiseStatus === "active").forEach(f => {
      if (counts[pf(f).qualification] !== undefined) counts[pf(f).qualification]++;
    });
    return counts;
  }, [indicatorFiltered]);

  // Top sponsors
  const topSponsors = useMemo(() => {
    const map = new Map<string, { name: string; id: string; count: number }>();
    indicatorFiltered.forEach(f => {
      const existing = map.get(pf(f).sponsorId);
      if (existing) existing.count++;
      else map.set(pf(f).sponsorId, { name: pf(f).sponsorName, id: pf(f).sponsorId, count: 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [indicatorFiltered]);

  // Top cities
  const topCities = useMemo(() => {
    const map = new Map<string, { city: string; flag: string; count: number }>();
    indicatorFiltered.forEach(f => {
      const existing = map.get(f.city);
      if (existing) existing.count++;
      else map.set(f.city, { city: f.city, flag: f.countryFlag, count: 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [indicatorFiltered]);

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
                  const planLabelKeys: Record<string, string> = { bronze: "franchise.bronze", silver: "franchise.silver", gold: "franchise.gold", platinum: "franchise.platinum" };
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

      <div className="mt-4" ref={searchCardRef}>
        <DashboardCard icon={Search} title={t("internal.cadastros.searchFranchisee")}>
          <div className="mt-2 space-y-3">
            {/* Row 1: Search + Sort */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("internal.cadastros.searchPlaceholder")}
                  value={search}
                  onChange={e => { setSearch(e.target.value); scrollToSearch(); }}
                  onKeyDown={e => { if (e.key === "Escape") { e.preventDefault(); (e.target as HTMLInputElement).select(); } }}
                  className="pl-9 pr-9 h-9 text-xs"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Select value={sortBy} onValueChange={v => { setSortBy(v); scrollToSearch(); }}>
                <SelectTrigger className="h-9 text-xs w-[180px]">
                  <ArrowUpDown className="h-3 w-3 mr-1 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t("internal.cadastros.sortRecent")}</SelectItem>
                  <SelectItem value="active_first">{t("internal.cadastros.sortActiveFirst")}</SelectItem>
                  <SelectItem value="qualification">{t("internal.cadastros.sortQualification")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
              {/* Franchise Status - Checkboxes */}
              <div className="flex items-center gap-3 h-9 px-2 rounded-md border border-input bg-background">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox checked={showActive} onCheckedChange={(v) => { setShowActive(!!v); scrollToSearch(); }} className="h-3.5 w-3.5" />
                  <span className="text-xs text-foreground">{t("internal.cadastros.statusActive")}</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox checked={showInactive} onCheckedChange={(v) => { setShowInactive(!!v); scrollToSearch(); }} className="h-3.5 w-3.5" />
                  <span className="text-xs text-foreground">{t("internal.cadastros.statusInactive")}</span>
                </label>
              </div>

              {/* Registration Status - Select */}
              <Select value={registrationStatus} onValueChange={v => { setRegistrationStatus(v); scrollToSearch(); }}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("internal.cadastros.registrationStatusFilter")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("internal.cadastros.allStatuses")}</SelectItem>
                  <SelectItem value="concluido">{t("internal.cadastros.regCompleted")}</SelectItem>
                  <SelectItem value="cancelado">{t("internal.cadastros.regCancelled")}</SelectItem>
                  <SelectItem value="pendente">{t("internal.cadastros.regPending")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Qualification */}
              <Select value={qualification} onValueChange={v => { setQualification(v); scrollToSearch(); }}>
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

              {/* Plan Type */}
              <Select value={planType} onValueChange={v => { setPlanType(v); scrollToSearch(); }}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("internal.cadastros.franchiseType")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("internal.cadastros.franchiseType")}</SelectItem>
                  <SelectItem value="bronze" disabled={!availablePlans.has("bronze")} className={!availablePlans.has("bronze") ? "opacity-40" : ""}>{t("franchise.bronze")}</SelectItem>
                  <SelectItem value="silver" disabled={!availablePlans.has("silver")} className={!availablePlans.has("silver") ? "opacity-40" : ""}>{t("franchise.silver")}</SelectItem>
                  <SelectItem value="gold" disabled={!availablePlans.has("gold")} className={!availablePlans.has("gold") ? "opacity-40" : ""}>{t("franchise.gold")}</SelectItem>
                  <SelectItem value="platinum" disabled={!availablePlans.has("platinum")} className={!availablePlans.has("platinum") ? "opacity-40" : ""}>{t("franchise.platinum")}</SelectItem>
                </SelectContent>
              </Select>

              {/* City - Autocomplete */}
              <div className="relative">
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder={t("internal.cadastros.city")}
                    value={cityFilter || citySearch}
                    onChange={e => {
                      setCitySearch(e.target.value);
                      setCityFilter("");
                      setShowCitySuggestions(true);
                    }}
                    onFocus={() => setShowCitySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                    className="pl-8 pr-8 h-9 text-xs"
                  />
                  {(cityFilter || citySearch) && (
                    <button onClick={() => { setCitySearch(""); setCityFilter(""); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {showCitySuggestions && citySuggestions.length > 0 && !cityFilter && (
                  <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-md max-h-[160px] overflow-y-auto">
                    {citySuggestions.map(c => (
                      <button
                        key={c}
                        type="button"
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                        onMouseDown={() => { setCityFilter(c); setCitySearch(""); setShowCitySuggestions(false); scrollToSearch(); }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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


const registrationStatusBorder: Record<RegistrationStatus, string> = {
  concluido: "border-l-[#003885]",
  cancelado: "border-l-[#8B0000]",
  pendente: "border-l-gray-400",
};

/* ── Franchisee Result Card ── */
function FranchiseeCard({ franchisee: f }: { franchisee: Franchisee }) {
  const { t } = useLanguage();
  // Sort franchises by createdAt ascending
  const sortedFranchises = useMemo(() => [...f.franchises].sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [f.franchises]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const sel = sortedFranchises[selectedIdx] || sortedFranchises[0];

  const regStatus = getRegistrationStatus(f, sel);
  const isCancelled = regStatus === "cancelado";
  const isActive = sel.franchiseStatus === "active";
  const qualConfig = qualificationConfig[sel.qualification];

  const planLabels: Record<string, string> = {
    bronze: t("franchise.bronze"),
    silver: t("franchise.silver"),
    gold: t("franchise.gold"),
    platinum: t("franchise.platinum"),
  };

  const isBrazilian = f.country === "Brasil";
  const docLabel = isBrazilian ? `CPF: ${f.document}` : `${f.document} · ${f.countryFlag} ${f.country}`;

  return (
    <div
      className={`rounded-r-lg rounded-l-[2px] border border-app-card-border bg-card overflow-hidden border-l-[5px] transition-shadow hover:shadow-md ${registrationStatusBorder[regStatus]} ${isCancelled ? "opacity-50" : ""}`}
    >
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-x-6">
          {/* ── Left side (Grids 1-3) ── */}
          <div className="flex-1 min-w-0">
            {/* ── Grid 1: Name + IDs + Sponsor ── */}
            <div className="mb-3 pb-3 border-b border-border/50">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="h-3.5 w-3.5 shrink-0 flex items-center justify-center"><span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} /></span>
                <span className="text-base font-bold text-foreground mr-1">{f.fullName}</span>
                {sortedFranchises.map((fr, idx) => (
                  <button
                    key={fr.franchiseId}
                    type="button"
                    onClick={() => setSelectedIdx(idx)}
                    className={cn(
                      "text-xs px-1.5 py-0 h-5 font-medium rounded-sm border inline-flex items-center transition-colors cursor-pointer",
                      idx === selectedIdx
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
                    )}
                  >
                    ID {fr.franchiseId}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5" style={{ marginLeft: "calc(0.875rem + 0.375rem)" }}>
                {t("internal.cadastros.sponsor")}: {sel.sponsorName} (ID {sel.sponsorId})
              </p>
            </div>

            {/* ── Grid 2 + Grid 3 side by side ── */}
            <div className="flex flex-col sm:flex-row gap-x-14 gap-y-2">
              {/* Grid 2: Registration details */}
              <div className="space-y-1.5 min-w-0">
                <p className="text-sm text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
                  {t("internal.cadastros.registrationDate")}: {sel.createdAt.split("-").reverse().join("/")}
                </p>
                <p className="text-sm text-foreground flex items-center gap-1.5">
                  <Gem className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
                  {t("payment.franchise.label")}: {planLabels[sel.planCode] || sel.planCode}
                </p>
                {qualConfig && (
                  <p className="text-sm flex items-center gap-1.5">
                    <span className="text-foreground/70">{qualConfig.icon}</span>
                    <span className="text-foreground">{t(qualificationLabelKeys[sel.qualification])}</span>
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
                  <Cake className="h-3.5 w-3.5 shrink-0 text-foreground/70" />{f.birthDate} · {t(`step1.gender.${f.gender}`)}
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

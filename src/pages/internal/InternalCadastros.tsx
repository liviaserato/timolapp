import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Search, X, Phone, Mail, MapPin,
  MapPinHouse, Landmark, Pencil, Lock,
  FileText, Cake, Gem, ArrowUpDown, Calendar,
  MessageCircle, Bell, RotateCcw, UserRound, Globe, Coins, User,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";
import { qualificationConfig } from "@/components/app/rede/mock-data";
import { AddressManager, type Address } from "@/components/app/cadastro/AddressManager";
import { FinancialManager, type FinancialAccount } from "@/components/app/cadastro/FinancialManager";
import { CredentialsDialog } from "@/components/internal/CredentialsDialog";



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
  /* Touchpoint tracking for pending registrations */
  recoveryEmailSentAt?: string | null;
  whatsappSentAt?: string | null;
  sponsorNotifiedAt?: string | null;
  attendantName?: string | null;
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
    { franchiseId: "100231", sponsorName: "Maria Silva", sponsorId: "99001", createdAt: "2026-03-02", planCode: "gold", planLabel: "Ouro", qualification: "esmeralda", franchiseStatus: "active", activationStatus: "activated", paidAt: "2026-03-05", recoveryEmailSentAt: null, whatsappSentAt: null, sponsorNotifiedAt: null, attendantName: "Camila Souza" },
  ]},
  { id: "2", fullName: "Carlos Eduardo Mendes", document: "987.654.321-00", birthDate: "22/08/1985", gender: "male", email: "carlos.mendes@email.com", phone: "+55 21 98888-1111", username: "carlos.mendes", city: "Rio de Janeiro", state: "RJ", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "100232", sponsorName: "Lívia Serato", sponsorId: "100231", createdAt: "2026-03-10", planCode: "platinum", planLabel: "Platina", qualification: "rubi", franchiseStatus: "active", activationStatus: "activated", paidAt: "2026-03-12", attendantName: "Camila Souza" },
  ]},
  { id: "3", fullName: "Ana Paula Costa", document: "456.789.123-00", birthDate: "10/12/1992", gender: "female", email: "ana.costa@email.com", phone: "+55 31 97777-2222", username: "ana.costa", city: "Belo Horizonte", state: "MG", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "100233", sponsorName: "Carlos Mendes", sponsorId: "100232", createdAt: "2026-03-15", planCode: "bronze", planLabel: "Bronze", qualification: "consultor", franchiseStatus: "active", activationStatus: "pending", paidAt: null, recoveryEmailSentAt: "2026-03-16T09:00:00Z", whatsappSentAt: "2026-03-17T11:00:00Z", sponsorNotifiedAt: null },
  ]},
  { id: "4", fullName: "Roberto Almeida Filho", document: "321.654.987-00", birthDate: "05/06/1978", gender: "male", email: "roberto.almeida@email.com", phone: "+55 41 96666-3333", username: "roberto.almeida", city: "Curitiba", state: "PR", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "100234", sponsorName: "Ana Costa", sponsorId: "100233", createdAt: "2026-03-08", planCode: "silver", planLabel: "Prata", qualification: "distribuidor", franchiseStatus: "suspended", activationStatus: "inactive", paidAt: "2026-03-20", attendantName: "Renata Dias" },
  ]},
  { id: "5", fullName: "Fernanda Oliveira Santos", document: "654.321.987-00", birthDate: "18/09/1988", gender: "female", email: "fernanda.santos@email.com", phone: "+55 51 95555-4444", username: "fernanda.santos", city: "Porto Alegre", state: "RS", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "100235", sponsorName: "Roberto Almeida", sponsorId: "100234", createdAt: "2026-03-01", planCode: "gold", planLabel: "Ouro", qualification: "lider", franchiseStatus: "active", activationStatus: "activated", paidAt: "2026-03-03", attendantName: "Camila Souza" },
  ]},
  { id: "6", fullName: "Pedro Henrique Lima", document: "789.123.456-00", birthDate: "30/01/1995", gender: "male", email: "pedro.lima@email.com", phone: "+55 61 94444-5555", username: "pedro.lima", city: "São Paulo", state: "SP", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "100236", sponsorName: "Fernanda Santos", sponsorId: "100235", createdAt: "2026-02-15", planCode: "bronze", planLabel: "Bronze", qualification: "consultor", franchiseStatus: "cancelled", activationStatus: "inactive", paidAt: null },
  ]},
  { id: "7", fullName: "Maria Silva", document: "111.222.333-00", birthDate: "12/07/1980", gender: "female", email: "maria.silva@email.com", phone: "+55 11 93333-6666", username: "maria.silva", city: "São Paulo", state: "SP", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "100237", sponsorName: "Timol", sponsorId: "00001", createdAt: "2026-02-01", planCode: "platinum", planLabel: "Platina", qualification: "diamante", franchiseStatus: "active", activationStatus: "activated", paidAt: "2026-02-02", attendantName: "Renata Dias" },
    { franchiseId: "100299", sponsorName: "Carlos Mendes", sponsorId: "100232", createdAt: "2026-03-10", planCode: "gold", planLabel: "Ouro", qualification: "rubi", franchiseStatus: "active", activationStatus: "activated", paidAt: "2026-03-11", attendantName: "Camila Souza" },
  ]},
  { id: "8", fullName: "Juan García López", document: "A12345678", birthDate: "03/11/1991", gender: "male", email: "juan.garcia@email.com", phone: "+34 612 345 678", username: "juan.garcia", city: "Madrid", state: "MD", country: "España", countryFlag: "🇪🇸", franchises: [
    { franchiseId: "100238", sponsorName: "Maria Silva", sponsorId: "99001", createdAt: "2026-03-18", planCode: "gold", planLabel: "Ouro", qualification: "esmeralda", franchiseStatus: "active", activationStatus: "activated", paidAt: "2026-03-19", recoveryEmailSentAt: null, whatsappSentAt: null, sponsorNotifiedAt: null, attendantName: "Camila Souza" },
  ]},
  /* Pending registrations with touchpoint data */
  { id: "9", fullName: "Juliana Ferreira Costa", document: "321.654.987-00", birthDate: "14/06/1993", gender: "female", email: "juliana.ferreira@email.com", phone: "+55 11 98765-4321", username: "juliana.ferreira", city: "São Paulo", state: "SP", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "200501", sponsorName: "Lívia Serato", sponsorId: "100231", createdAt: "2026-03-20", planCode: "gold", planLabel: "Ouro", qualification: "consultor", franchiseStatus: "active", activationStatus: "pending", paidAt: null, recoveryEmailSentAt: "2026-03-21T10:00:00Z", whatsappSentAt: null, sponsorNotifiedAt: null },
  ]},
  { id: "10", fullName: "Ricardo Alves Santos", document: "654.321.987-00", birthDate: "08/02/1987", gender: "male", email: "ricardo.alves@email.com", phone: "+55 21 97654-3210", username: "ricardo.alves", city: "Rio de Janeiro", state: "RJ", country: "Brasil", countryFlag: "🇧🇷", franchises: [
    { franchiseId: "200502", sponsorName: "Carlos Mendes", sponsorId: "100232", createdAt: "2026-03-18", planCode: "platinum", planLabel: "Platina", qualification: "consultor", franchiseStatus: "active", activationStatus: "pending", paidAt: null, recoveryEmailSentAt: "2026-03-19T08:00:00Z", whatsappSentAt: "2026-03-20T16:00:00Z", sponsorNotifiedAt: null },
  ]},
  { id: "11", fullName: "Pedro Augusto Lima", document: "B98765432", birthDate: "25/04/1991", gender: "male", email: "pedro.augusto@email.com", phone: "+34 612 987 654", username: "pedro.augusto", city: "Madrid", state: "MD", country: "España", countryFlag: "🇪🇸", franchises: [
    { franchiseId: "200504", sponsorName: "Juan García López", sponsorId: "100238", createdAt: "2026-03-22", planCode: "silver", planLabel: "Prata", qualification: "consultor", franchiseStatus: "active", activationStatus: "pending", paidAt: null, recoveryEmailSentAt: null, whatsappSentAt: null, sponsorNotifiedAt: null },
  ]},
];


/* ── Search helper ── */
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[.\-\/\s\+\(\)]/g, "");
const isNumericSearch = (q: string) => /\d/.test(q) && !/[a-zA-ZÀ-ÿ]/.test(q);

function matchesSearch(f: Franchisee, q: string, fields: string[]): boolean {
  const nq = norm(q);
  const numeric = isNumericSearch(q);
  const activeFields = fields.length > 0 ? fields : (numeric ? ["id", "document", "phone"] : ["name", "city", "email"]);

  return activeFields.some(field => {
    switch (field) {
      case "id": return f.franchises.some(fr => norm(fr.franchiseId).includes(nq));
      case "document": return norm(f.document).includes(nq);
      case "phone": return norm(f.phone).includes(nq);
      case "name": return norm(f.fullName).includes(nq);
      case "city": return norm(f.city).includes(nq);
      case "email": return norm(f.email).includes(nq);
      default: return false;
    }
  });
}

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




/* ── Registration status helpers (before component for filter use) ── */
type RegistrationStatus = "concluido" | "cancelado" | "pendente";

function getRegistrationStatus(f: Franchisee, fr?: FranchiseEntry): RegistrationStatus {
  const entry = fr || pf(f);
  if (entry.franchiseStatus === "cancelled") return "cancelado";
  if (entry.paidAt) return "concluido";
  return "pendente";
}

/** Franchise is only considered "active" if registration is completed AND franchiseStatus is active */
function isEffectivelyActive(f: Franchisee, fr?: FranchiseEntry): boolean {
  const entry = fr || pf(f);
  const regStatus = getRegistrationStatus(f, entry);
  if (regStatus !== "concluido") return false;
  return entry.franchiseStatus === "active";
}


/* ── Component ── */
/* qualification priority for sorting */
const qualPriority: Record<string, number> = { consultor: 0, distribuidor: 1, lider: 2, rubi: 3, esmeralda: 4, diamante: 5 };

export default function InternalCadastros() {
  const { t, language } = useLanguage();
  const dateLocale = language === "pt" ? "pt-BR" : language === "es" ? "es-ES" : "en-US";
  const searchCardRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  
  const [sortBy, setSortBy] = useState<string>("");
  const [showActive, setShowActive] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string>("all");
  const [qualification, setQualification] = useState<string>("all");
  const [planType, setPlanType] = useState<string>("all");
  const [attendant, setAttendant] = useState<string>("all");
  const [searchFields, setSearchFields] = useState<string[]>([]);

  const franchiseStatusFilter: string = (showActive && !showInactive) ? "active" : (!showActive && showInactive) ? "inactive" : "all";
  const hasSearchFilters = (showActive || showInactive) || registrationStatus !== "all" || qualification !== "all" || planType !== "all" || attendant !== "all" || search.trim() !== "";
  const hasFilters = hasSearchFilters;

  const activateCheckboxes = () => {
    if (!showActive && !showInactive) { setShowActive(true); setShowInactive(true); }
  };

  const scrollToSearch = () => {
    searchCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getFilteredExcluding = (exclude: string) => {
     let list = mockFranchisees as Franchisee[];
    if (exclude !== "franchiseStatus" && franchiseStatusFilter !== "all") {
      if (franchiseStatusFilter === "active") list = list.filter(f => isEffectivelyActive(f));
      else list = list.filter(f => !isEffectivelyActive(f));
    }
    if (exclude !== "registrationStatus" && registrationStatus !== "all") list = list.filter(f => getRegistrationStatus(f) === registrationStatus);
    if (exclude !== "attendant" && attendant !== "all") list = list.filter(f => pf(f).attendantName === attendant);
    if (exclude !== "qualification" && qualification !== "all") list = list.filter(f => pf(f).qualification === qualification);
    if (exclude !== "planType" && planType !== "all") list = list.filter(f => pf(f).planCode === planType);
    if (search.trim()) {
      list = list.filter(f => matchesSearch(f, search, searchFields));
    }
    return list;
  };

  const availableAttendants = useMemo(() => {
    const names = getFilteredExcluding("attendant").map(f => pf(f).attendantName).filter(Boolean) as string[];
    return [...new Set(names)].sort();
  }, [search, searchFields, showActive, showInactive, registrationStatus, attendant, qualification, planType]);
  const availableQualifications = useMemo(() => new Set(getFilteredExcluding("qualification").map(f => pf(f).qualification)), [search, searchFields, showActive, showInactive, registrationStatus, attendant, qualification, planType]);
  const availablePlans = useMemo(() => new Set(getFilteredExcluding("planType").map(f => pf(f).planCode)), [search, searchFields, showActive, showInactive, registrationStatus, attendant, qualification, planType]);

  const hasActiveFilters = search.trim() !== "" || showActive || showInactive || registrationStatus !== "all" || attendant !== "all" || qualification !== "all" || planType !== "all";

  const filtered = useMemo(() => {
    if (!hasActiveFilters) return [];
    let list = mockFranchisees as Franchisee[];
    if (franchiseStatusFilter === "active") list = list.filter(f => isEffectivelyActive(f));
    else if (franchiseStatusFilter === "inactive") list = list.filter(f => !isEffectivelyActive(f));
    if (registrationStatus !== "all") list = list.filter(f => getRegistrationStatus(f) === registrationStatus);
    if (attendant !== "all") list = list.filter(f => pf(f).attendantName === attendant);
    if (qualification !== "all") list = list.filter(f => pf(f).qualification === qualification);
    if (planType !== "all") list = list.filter(f => pf(f).planCode === planType);
    if (search.trim()) {
      list = list.filter(f => matchesSearch(f, search, searchFields));
    }
    if (sortBy === "recent" || sortBy === "") {
      list = [...list].sort((a, b) => pf(b).createdAt.localeCompare(pf(a).createdAt));
    } else if (sortBy === "qualification") {
      list = [...list].sort((a, b) => (qualPriority[pf(b).qualification] || 0) - (qualPriority[pf(a).qualification] || 0));
    } else if (sortBy === "active_first") {
      list = [...list].sort((a, b) => {
        const aActive = isEffectivelyActive(a) ? 0 : 1;
        const bActive = isEffectivelyActive(b) ? 0 : 1;
        return aActive - bActive;
      });
    }
    return list;
  }, [search, searchFields, showActive, showInactive, registrationStatus, attendant, qualification, planType, sortBy, hasActiveFilters]);

  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedResults = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset page when filters change
  useMemo(() => { setCurrentPage(1); }, [search, searchFields, showActive, showInactive, registrationStatus, attendant, qualification, planType, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setSortBy("");
    setShowActive(false);
    setShowInactive(false);
    setRegistrationStatus("all");
    setAttendant("all");
    setQualification("all");
    setPlanType("all");
    setSearchFields([]);
  };


  return (
    <div>
      <header className="mb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">{t("internal.cadastros.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("internal.cadastros.subtitle")}</p>
        </div>
      </header>

      <div ref={searchCardRef}>
        <DashboardCard icon={Search} title={t("internal.cadastros.searchFranchisee")}>
          <div className="mt-2 space-y-3">
            {/* Row 1: Search + Sort */}
            <div className="flex flex-wrap items-start gap-2">
              <div className="flex-1 min-w-[200px] space-y-1.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("internal.cadastros.searchPlaceholder")}
                    value={search}
                    onChange={e => { setSearch(e.target.value); setSearchFields([]); activateCheckboxes(); scrollToSearch(); }}
                    onKeyDown={e => { if (e.key === "Escape") { e.preventDefault(); (e.target as HTMLInputElement).select(); } }}
                    className="pl-9 pr-9 h-9 text-xs"
                  />
                  {search && (
                    <button onClick={() => { setSearch(""); setSearchFields([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {search.trim() && (
                  <ToggleGroup
                    type="multiple"
                    value={searchFields}
                    onValueChange={setSearchFields}
                    className="justify-start gap-1 flex-wrap"
                  >
                    {isNumericSearch(search) ? (
                      <>
                        <ToggleGroupItem value="id" variant="outline" size="sm" className="h-6 text-[11px] px-2.5 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{t("internal.cadastros.toggleId")}</ToggleGroupItem>
                        <ToggleGroupItem value="document" variant="outline" size="sm" className="h-6 text-[11px] px-2.5 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{t("internal.cadastros.toggleDocument")}</ToggleGroupItem>
                        <ToggleGroupItem value="phone" variant="outline" size="sm" className="h-6 text-[11px] px-2.5 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{t("internal.cadastros.togglePhone")}</ToggleGroupItem>
                      </>
                    ) : (
                      <>
                        <ToggleGroupItem value="name" variant="outline" size="sm" className="h-6 text-[11px] px-2.5 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{t("internal.cadastros.toggleName")}</ToggleGroupItem>
                        <ToggleGroupItem value="city" variant="outline" size="sm" className="h-6 text-[11px] px-2.5 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{t("internal.cadastros.toggleCity")}</ToggleGroupItem>
                        <ToggleGroupItem value="email" variant="outline" size="sm" className="h-6 text-[11px] px-2.5 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{t("internal.cadastros.toggleEmail")}</ToggleGroupItem>
                      </>
                    )}
                  </ToggleGroup>
                )}
              </div>
              {/* Sort */}
              <Select value={sortBy} onValueChange={v => { setSortBy(v); activateCheckboxes(); }}>
                <SelectTrigger className="h-9 text-xs w-full sm:w-[180px]">
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <SelectValue placeholder={t("internal.cadastros.classify")} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t("internal.cadastros.sortRecent")}</SelectItem>
                  <SelectItem value="active_first">{t("internal.cadastros.sortActiveFirst")}</SelectItem>
                  <SelectItem value="qualification">{t("internal.cadastros.sortQualification")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* Franchise status checkboxes */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">{t("internal.cadastros.franchiseStatusLegend")}</span>
                <div className="flex items-center gap-3 h-9 px-2 rounded-md border border-input bg-background">
                  <label className="flex items-center gap-1.5 cursor-pointer flex-1 min-w-0">
                    <Checkbox checked={showActive} onCheckedChange={(v: boolean) => setShowActive(v)} className="h-3.5 w-3.5" />
                    <span className="text-xs truncate">{t("internal.cadastros.statusActive")}</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer flex-1 min-w-0">
                    <Checkbox checked={showInactive} onCheckedChange={(v: boolean) => setShowInactive(v)} className="h-3.5 w-3.5" />
                    <span className="text-xs truncate">{t("internal.cadastros.statusInactive")}</span>
                  </label>
                </div>
              </div>
              {/* Registration status */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">{t("internal.cadastros.registrationStatusFilter")}</span>
                <Select value={registrationStatus} onValueChange={v => { setRegistrationStatus(v); activateCheckboxes(); }}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("internal.cadastros.allStatuses")}</SelectItem>
                    <SelectItem value="pendente">{t("internal.cadastros.regPending")}</SelectItem>
                    <SelectItem value="concluido">{t("internal.cadastros.regCompleted")}</SelectItem>
                    <SelectItem value="cancelado">{t("internal.cadastros.regCancelled")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Attendant */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">{t("internal.cadastros.attendantFilter")}</span>
                <Select value={attendant} onValueChange={v => { setAttendant(v); activateCheckboxes(); }}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("internal.cadastros.allStatuses")}</SelectItem>
                    {availableAttendants.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Qualification */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">{t("internal.cadastros.qualificationFilter")}</span>
                <Select value={qualification} onValueChange={v => { setQualification(v); activateCheckboxes(); }}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("internal.cadastros.allStatuses")}</SelectItem>
                    {(["consultor", "distribuidor", "lider", "rubi", "esmeralda", "diamante"] as const).map(q => (
                      <SelectItem key={q} value={q} disabled={!availableQualifications.has(q)}>
                        {t(qualificationLabelKeys[q])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Plan type */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">{t("internal.cadastros.franchiseType")}</span>
                <Select value={planType} onValueChange={v => { setPlanType(v); activateCheckboxes(); }}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("internal.cadastros.allStatuses")}</SelectItem>
                    {(["bronze", "silver", "gold", "platinum"] as const).map(p => (
                      <SelectItem key={p} value={p} disabled={!availablePlans.has(p)}>
                        {t(`franchise.${p}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters + clear */}
            {hasFilters && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{filtered.length} {t("internal.cadastros.resultsFound")}</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={clearFilters}>
                  <X className="h-3 w-3" />
                  {t("internal.cadastros.clearFilters")}
                </Button>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* ── Results ── */}
      <div className="mt-4 space-y-3">
        {!hasActiveFilters ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Use a busca ou os filtros acima para encontrar franqueados
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum franqueado encontrado com os filtros selecionados
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "resultado encontrado" : "resultados encontrados"}
              </p>
            </div>
            {paginatedResults.map(f => (
              <FranchiseeCard key={f.id} franchisee={f} />
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(p => p - 1); searchCardRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                  className="h-8 text-xs"
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => { setCurrentPage(page); searchCardRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                      className={cn(
                        "h-8 w-8 rounded-md text-xs font-medium transition-colors",
                        page === currentPage
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent text-muted-foreground"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(p => p + 1); searchCardRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                  className="h-8 text-xs"
                >
                  Próximo
                </Button>
              </div>
            )}
            <RegistrationStatusLegend />
          </>
        )}
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
  const sortedFranchises = useMemo(() => [...f.franchises].sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [f.franchises]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const sel = sortedFranchises[selectedIdx] || sortedFranchises[0];

  // Dialog states
  const [addressOpen, setAddressOpen] = useState(false);
  const [financialOpen, setFinancialOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);

  // Inline editing
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: f.fullName, email: f.email, phone: f.phone,
    document: f.document, birthDate: f.birthDate, gender: f.gender,
    city: f.city, state: f.state,
  });

  const startEditing = () => {
    setEditData({ fullName: f.fullName, email: f.email, phone: f.phone, document: f.document, birthDate: f.birthDate, gender: f.gender, city: f.city, state: f.state });
    setEditing(true);
  };
  const cancelEditing = useCallback(() => setEditing(false), []);

  useEffect(() => {
    if (!editing) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") cancelEditing(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editing, cancelEditing]);
  const saveEditing = () => {
    // In production: API call to save
    toast.success("Dados atualizados com sucesso");
    setEditing(false);
  };
  const ed = (field: keyof typeof editData, value: string) => setEditData(prev => ({ ...prev, [field]: value }));

  // Mock data per franchisee (in production, fetched from API)
  const [addresses, setAddresses] = useState<Address[]>([
    { id: "1", label: "Principal", country: f.country, countryIso2: f.country === "Brasil" ? "BR" : "ES", zipCode: "", street: `Endereço de ${f.fullName.split(" ")[0]}`, number: "100", complement: "", neighborhood: "", city: f.city, state: f.state, isDefault: true },
  ]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([
    { id: "1", type: "pix", label: "PIX Principal", pixKey: f.document, pixKeyType: "CPF", isDefault: true, status: "verified" },
  ]);

  const regStatus = getRegistrationStatus(f, sel);
  const isCancelled = regStatus === "cancelado";
  const isCompleted = regStatus === "concluido";
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

  /* Franchise status dot tooltip */
  const expirationDate = sel.paidAt
    ? new Date(new Date(sel.paidAt).getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")
    : null;
  const statusDotLabel = isActive
    ? `Sua franquia está ativa até ${expirationDate ?? "—"}`
    : t("internal.cadastros.franchiseInactive");

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
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {regStatus === "concluido" ? (
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <span
                            className="h-3.5 w-3.5 shrink-0 flex items-center justify-center cursor-help"
                            aria-label={statusDotLabel}
                          >
                            <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-[220px]">
                          {statusDotLabel}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {editing ? (
                      <Input className="h-7 text-base font-bold px-1.5 mr-1 flex-1 min-w-0" value={editData.fullName} onChange={e => ed("fullName", e.target.value)} />
                    ) : (
                      <span className="text-base font-bold text-foreground mr-1">{f.fullName}</span>
                    )}
                    <div className="ml-auto flex items-center gap-1 flex-wrap justify-end">
                      {/* Single ID: always inline */}
                      {sortedFranchises.length <= 1 && sortedFranchises.map((fr, idx) => (
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
                      {/* Multiple IDs: inline on desktop only */}
                      {sortedFranchises.length > 1 && sortedFranchises.map((fr, idx) => (
                        <button
                          key={fr.franchiseId}
                          type="button"
                          onClick={() => setSelectedIdx(idx)}
                          className={cn(
                            "text-xs px-1.5 py-0 h-5 font-medium rounded-sm border hidden sm:inline-flex items-center transition-colors cursor-pointer",
                            idx === selectedIdx
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
                          )}
                        >
                          ID {fr.franchiseId}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Multiple IDs on mobile: separate row */}
                  {sortedFranchises.length > 1 && (
                    <div className="flex sm:hidden flex-wrap gap-1 mt-0.5" style={{ marginLeft: "calc(0.875rem + 0.375rem)" }}>
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
                  )}

                  {isCompleted && (
                    <div className="mt-0.5" style={{ marginLeft: "calc(0.875rem + 0.375rem)" }}>
                      <p className="text-xs text-muted-foreground shrink-0">
                        Atendente: <span className="font-medium text-foreground">{sel.attendantName ?? "—"}</span>
                      </p>
                    </div>
                  )}
                </div>
                {/* Touchpoint icons: show for pendente and cancelado, hide for concluido */}
                {!isCompleted && (
                  <TouchpointIcons franchise={sel} />
                )}
              </div>
            </div>

            {/* ── Grid 2 (Dados Pessoais) + Grid 3 (Franquia) side by side ── */}
            <div className="flex flex-col sm:flex-row gap-x-14 gap-y-2">
              {/* Dados Pessoais */}
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm text-foreground truncate" aria-label={`Documento: ${f.document}`}>
                  <FileText className="h-3.5 w-3.5 shrink-0 text-foreground/70" aria-hidden="true" />
                  {editing ? (
                    <Input className="h-6 text-xs flex-1 px-1.5" value={editData.document} onChange={e => ed("document", e.target.value)} />
                  ) : docLabel}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-foreground" aria-label={`Data de nascimento: ${f.birthDate}`}>
                  <Cake className="h-3.5 w-3.5 shrink-0 text-foreground/70" aria-hidden="true" />
                  {editing ? (
                    <span className="flex items-center gap-1">
                      <Input className="h-6 text-xs w-24 px-1.5" value={editData.birthDate} onChange={e => ed("birthDate", e.target.value)} placeholder="DD/MM/AAAA" />
                      <Select value={editData.gender} onValueChange={v => ed("gender", v)}>
                        <SelectTrigger className="h-6 text-xs w-24 px-1.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">{t("step1.gender.female")}</SelectItem>
                          <SelectItem value="male">{t("step1.gender.male")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </span>
                  ) : (
                    <span>{f.birthDate}</span>
                  )}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-foreground" aria-label={`Gênero: ${t(`step1.gender.${f.gender}`)}`}>
                  <User className="h-3.5 w-3.5 shrink-0 text-foreground/70" aria-hidden="true" />
                  {editing ? null : <span>{t(`step1.gender.${f.gender}`)}</span>}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-foreground" aria-label={`E-mail: ${f.email}`}>
                  <Mail className="h-3.5 w-3.5 shrink-0 text-foreground/70" aria-hidden="true" />
                  {editing ? (
                    <Input className="h-6 text-xs flex-1 px-1.5" value={editData.email} onChange={e => ed("email", e.target.value)} />
                  ) : <span className="truncate">{f.email}</span>}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-foreground" aria-label={`Telefone: ${f.phone}`}>
                  <Phone className="h-3.5 w-3.5 shrink-0 text-foreground/70" aria-hidden="true" />
                  {editing ? (
                    <Input className="h-6 text-xs flex-1 px-1.5" value={editData.phone} onChange={e => ed("phone", e.target.value)} />
                  ) : <span className="truncate">{f.phone}</span>}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-foreground" aria-label={`País de residência: ${f.country}`}>
                  <Globe className="h-3.5 w-3.5 shrink-0 text-foreground/70" aria-hidden="true" />
                  {editing ? (
                    <span className="flex items-center gap-1">
                      <Input className="h-6 text-xs w-24 px-1.5" value={editData.city} onChange={e => ed("city", e.target.value)} placeholder="Cidade" />
                      <Input className="h-6 text-xs w-12 px-1.5" value={editData.state} onChange={e => ed("state", e.target.value)} placeholder="UF" />
                      <span>{f.countryFlag}</span>
                    </span>
                  ) : (
                    <span className="truncate">{f.countryFlag} {f.country} · {f.city}, {f.state}</span>
                  )}
                </p>
              </div>

              {/* Dados da Franquia */}
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="text-sm text-foreground flex items-center gap-1.5">
                  <Gem className="h-3.5 w-3.5 shrink-0 text-foreground/70" aria-hidden="true" />
                  {t("payment.franchise.label")}: {planLabels[sel.planCode] || sel.planCode}
                </p>
                {qualConfig && (
                  <p className="text-sm flex items-center gap-1.5">
                    <span className="text-foreground/70" aria-hidden="true">{qualConfig.icon}</span>
                    <span className="text-foreground">{t("internal.cadastros.qualLabel") !== "internal.cadastros.qualLabel" ? t("internal.cadastros.qualLabel") : "Qualificação"}: {t(qualificationLabelKeys[sel.qualification])}</span>
                  </p>
                )}
                <p className="text-sm text-foreground flex items-center gap-1.5 truncate">
                  <UserRound className="h-3.5 w-3.5 shrink-0 text-foreground/70" aria-hidden="true" />
                  {t("internal.cadastros.sponsor")}: {sel.sponsorName} (ID {sel.sponsorId})
                </p>
                <p className="text-sm text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-foreground/70" aria-hidden="true" />
                  {t("internal.cadastros.registrationDate")}: {sel.createdAt.split("-").reverse().join("/")}
                </p>
                <p className="text-sm text-foreground flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 shrink-0 text-foreground/70" aria-hidden="true" />
                  Moeda: {f.country === "Brasil" ? "BRL (R$)" : f.country === "España" ? "EUR (€)" : "USD ($)"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Grid 4: Actions ── */}
          {isCancelled ? (
            <div className="flex flex-col items-center justify-center lg:w-[170px] shrink-0 mt-3 lg:mt-0 px-3 gap-3">
              <p className="text-xs text-muted-foreground italic text-center">{t("internal.cadastros.franchiseCancelledMsg")}</p>
              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1.5 text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-3 w-3" />
                {t("internal.cadastros.reactivateRegistration")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col lg:w-[170px] shrink-0 mt-3 lg:mt-0 self-stretch">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5 justify-start w-full" onClick={() => setAddressOpen(true)}>
                  <MapPinHouse className="h-3 w-3" />
                  {t("internal.cadastros.btnAddresses")}
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5 justify-start w-full" onClick={() => setFinancialOpen(true)}>
                  <Landmark className="h-3 w-3" />
                  {t("internal.cadastros.btnFinancial")}
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5 justify-start w-full" onClick={() => setCredentialsOpen(true)}>
                  <Lock className="h-3 w-3" />
                  {t("internal.cadastros.btnCredentials")}
                </Button>
                <Button variant={editing ? "default" : "outline"} size="sm" className="text-xs h-7 gap-1.5 justify-start w-full" onClick={editing ? cancelEditing : startEditing}>
                  <Pencil className="h-3 w-3" />
                  {editing ? "Cancelar edição" : t("internal.cadastros.btnEdit")}
                </Button>
              </div>
              {editing && (
                <div className="flex items-center justify-end gap-2 mt-auto pt-3">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={cancelEditing}>Cancelar</Button>
                  <Button size="sm" className="h-7 text-xs gap-1.5" onClick={saveEditing}>Salvar</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddressManager
        dialogOnly
        open={addressOpen}
        onOpenChange={setAddressOpen}
        addresses={addresses}
        onChange={setAddresses}
        currentCountryIso2={f.country === "Brasil" ? "BR" : "ES"}
        franchiseCurrency={f.country === "Brasil" ? "BRL" : "EUR"}
      />
      <FinancialManager
        dialogOnly
        open={financialOpen}
        onOpenChange={setFinancialOpen}
        accounts={accounts}
        onChange={setAccounts}
      />
      <CredentialsDialog
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        username={f.username}
        email={f.email}
        fullName={f.fullName}
      />
    </div>
  );
}

/* ── Touchpoint Alert Logic ── */
type AlertLevel = "green" | "yellow" | "red";

function getDaysSince(dateStr: string) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

function getEmailAlert(fr: FranchiseEntry): { level: AlertLevel; tip: string } | null {
  if (fr.recoveryEmailSentAt) return null;
  const days = getDaysSince(fr.createdAt);
  if (days >= 2) return { level: "red", tip: "E-mail de recuperação deveria ter sido enviado" };
  if (days >= 1) return { level: "yellow", tip: "E-mail de recuperação ainda não enviado" };
  return null;
}

function getWhatsappAlert(fr: FranchiseEntry): { level: AlertLevel; tip: string } | null {
  if (fr.whatsappSentAt) return null;
  const days = getDaysSince(fr.createdAt);
  if (days >= 4) return { level: "red", tip: "WhatsApp deveria ter sido enviado há dias" };
  if (days >= 3) return { level: "yellow", tip: "WhatsApp já deveria ter sido enviado" };
  if (days >= 2) return { level: "green", tip: "Hoje é dia de enviar WhatsApp" };
  return null;
}

function getSponsorAlert(fr: FranchiseEntry): { level: AlertLevel; tip: string } | null {
  if (!fr.whatsappSentAt || fr.sponsorNotifiedAt) return null;
  const days = getDaysSince(fr.createdAt);
  if (days >= 10) return { level: "red", tip: "Notificação ao patrocinador gravemente atrasada" };
  if (days >= 8) return { level: "yellow", tip: "Notificação ao patrocinador atrasada" };
  if (days >= 7) return { level: "green", tip: "Hoje é um bom dia para notificar o patrocinador" };
  return null;
}

const alertIconColor: Record<AlertLevel, string> = {
  green: "text-emerald-500",
  yellow: "text-amber-500",
  red: "text-red-500",
};

function formatTouchpointDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function TouchpointIcons({ franchise: fr }: { franchise: FranchiseEntry }) {
  const emailAlert = getEmailAlert(fr);
  const waAlert = getWhatsappAlert(fr);
  const spAlert = getSponsorAlert(fr);

  const emailDone = !!fr.recoveryEmailSentAt;
  const waDone = !!fr.whatsappSentAt;
  const spDone = !!fr.sponsorNotifiedAt;

  return (
    <div className="flex items-center gap-3 shrink-0">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help">
            <Mail className={cn("h-5 w-5", emailDone ? "text-emerald-500" : emailAlert ? alertIconColor[emailAlert.level] : "text-muted-foreground/40")} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[200px]">
          {emailDone ? `Email enviado em ${formatTouchpointDate(fr.recoveryEmailSentAt)}` : emailAlert?.tip || "Email não enviado"}
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help">
            <MessageCircle className={cn("h-5 w-5", waDone ? "text-emerald-500" : waAlert ? alertIconColor[waAlert.level] : "text-muted-foreground/40")} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[200px]">
          {waDone ? `WhatsApp enviado em ${formatTouchpointDate(fr.whatsappSentAt)}` : waAlert?.tip || "WhatsApp não enviado"}
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help">
            <Bell className={cn("h-5 w-5", spDone ? "text-emerald-500" : spAlert ? alertIconColor[spAlert.level] : "text-muted-foreground/40")} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[200px]">
          {spDone ? `Patrocinador notificado em ${formatTouchpointDate(fr.sponsorNotifiedAt)}` : spAlert?.tip || "Patrocinador não notificado"}
        </TooltipContent>
      </Tooltip>
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

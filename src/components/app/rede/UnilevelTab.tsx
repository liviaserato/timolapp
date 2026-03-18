import { useState, useMemo, useEffect } from "react";
import {
  Users, UserCheck, Target, TrendingUp, Layers, Search, X, ArrowUpDown,
  PlayCircle, Lightbulb, List, GitBranch, RotateCcw, Calendar,
  ChevronDown, ChevronRight, ChevronLeft, Award, Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { qualificationConfig, NetworkMember } from "./mock-data";
import { QualificationLegend } from "./QualificationLegend";
import { MemberDetailDialog } from "./MemberDetailDialog";
import { UnilevelOrgChart } from "./UnilevelOrgChart";
import {
  mockUnilevelTree, flattenUnilevelTree, qualificationLevelLimits,
  FlatUnilevelMember, UnilevelNode,
} from "./unilevel-mock-data";
import { useIsMobile } from "@/hooks/use-mobile";

/* ── Sort ── */
type SortMode = "default" | "points" | "date_newest" | "date_oldest" | "status" | "qualification";
type ListMode = "by_level" | "by_direct";

const qualificationRank: Record<string, number> = {
  consultor: 0, distribuidor: 1, lider: 2, rubi: 3, esmeralda: 4, diamante: 5,
};

function sortMembers(members: FlatUnilevelMember[], mode: SortMode): FlatUnilevelMember[] {
  const sorted = [...members];
  switch (mode) {
    case "points":
      return sorted.sort((a, b) => b.volume - a.volume);
    case "date_newest":
      return sorted.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
    case "date_oldest":
      return sorted.sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
    case "qualification":
      return sorted.sort((a, b) => (qualificationRank[b.qualification] ?? 0) - (qualificationRank[a.qualification] ?? 0));
    case "status":
    default:
      return sorted.sort((a, b) => {
        // Active first
        if (a.active !== b.active) return a.active ? -1 : 1;
        // Then highest points
        if (b.volume !== a.volume) return b.volume - a.volume;
        // Then highest qualification
        return (qualificationRank[b.qualification] ?? 0) - (qualificationRank[a.qualification] ?? 0);
      });
  }
}

/* ── Filter mode ── */
type FilterMode = "month" | "period";

/* ── Month helpers ── */
function getMonthLabel(d: Date) {
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase());
}

/* ── Main component ── */

interface Props {
  searchQuery: string;
}

export function UnilevelTab({ searchQuery }: Props) {
  const isMobile = useIsMobile();
  const [selectedMember, setSelectedMember] = useState<NetworkMember | null>(null);
  const [bonusModalOpen, setBonusModalOpen] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [sortMode, setSortMode] = useState<SortMode | "">("");
  const [filterMode, setFilterMode] = useState<FilterMode>("month");
  const [monthRef, setMonthRef] = useState(() => new Date(2026, 2, 1));
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "list">("list");

  // Default to list on mobile, tree on desktop (only on mount)
  useEffect(() => {
    if (isMobile) setViewMode("list");
    else setViewMode("tree");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Current user's qualification determines max visible level
  const userQualification = mockUnilevelTree.qualification;
  const maxLevel = qualificationLevelLimits[userQualification] ?? 3;

  // Flatten all members up to maxLevel
  const allMembers = useMemo(
    () => flattenUnilevelTree(mockUnilevelTree, 0, maxLevel),
    [maxLevel]
  );

  // Filter + sort
  const filteredMembers = useMemo(() => {
    let result = allMembers;
    const q = (searchId || searchQuery || "").toLowerCase().trim();
    if (q) {
      result = result.filter(
        (m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
      );
    }
    return sortMembers(result, (sortMode || "default") as SortMode);
  }, [allMembers, searchId, searchQuery, sortMode]);

  // List mode: by_level or by_direct
  const [listMode, setListMode] = useState<ListMode>("by_level");

  // Selected level for list view
  const [selectedLevel, setSelectedLevel] = useState(1);

  // Selected direct member for "by_direct" mode
  const [selectedDirectId, setSelectedDirectId] = useState<string>("");

  // Direct members list for the dropdown
  const directMembers = useMemo(() => {
    return allMembers.filter((m) => m.isDirect);
  }, [allMembers]);

  // Set default selected direct when switching to by_direct mode
  useEffect(() => {
    if (listMode === "by_direct" && !selectedDirectId && directMembers.length > 0) {
      setSelectedDirectId(directMembers[0].id);
    }
  }, [listMode, selectedDirectId, directMembers]);

  // Flatten the subtree of a specific direct member
  const directSubtreeMembers = useMemo(() => {
    if (listMode !== "by_direct" || !selectedDirectId) return [];
    // Find the direct node in the tree
    const directNode = mockUnilevelTree.children?.find((c) => c.id === selectedDirectId);
    if (!directNode) return [];
    // Include the direct member itself as level 1, then flatten children
    const result: FlatUnilevelMember[] = [{
      ...directNode,
      level: 1,
      isDirect: true,
    } as FlatUnilevelMember];
    // Flatten descendants starting from level 2
    function flattenNode(node: UnilevelNode, lvl: number) {
      if (!node.children) return;
      for (const child of node.children) {
        if (lvl + 1 > maxLevel) continue;
        result.push({
          ...child,
          level: lvl + 1,
          isDirect: false,
        } as FlatUnilevelMember);
        flattenNode(child, lvl + 1);
      }
    }
    flattenNode(directNode, 1);
    // Apply search filter
    const q = (searchId || searchQuery || "").toLowerCase().trim();
    let filtered = result;
    if (q) {
      filtered = result.filter(
        (m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
      );
    }
    return sortMembers(filtered, (sortMode || "default") as SortMode);
  }, [listMode, selectedDirectId, maxLevel, searchId, searchQuery, sortMode]);

  // Group by level for "by_direct" mode
  const directSubtreeByLevel = useMemo(() => {
    const grouped: Record<number, FlatUnilevelMember[]> = {};
    for (const m of directSubtreeMembers) {
      const lvl = m.level ?? 1;
      if (!grouped[lvl]) grouped[lvl] = [];
      grouped[lvl].push(m);
    }
    return grouped;
  }, [directSubtreeMembers]);

  const directSubtreeLevels = useMemo(() => {
    return Object.keys(directSubtreeByLevel).map(Number).sort((a, b) => a - b);
  }, [directSubtreeByLevel]);

  // Members for the selected level
  const selectedLevelMembers = useMemo(() => {
    return filteredMembers.filter((m) => (m.level ?? 1) === selectedLevel);
  }, [filteredMembers, selectedLevel]);

  // Available levels
  const availableLevels = useMemo(() => {
    const levels = new Set<number>();
    filteredMembers.forEach((m) => levels.add(m.level ?? 1));
    return Array.from(levels).sort((a, b) => a - b);
  }, [filteredMembers]);

  // Summary stats
  const directList = allMembers.filter((m) => m.isDirect);
  const directCount = directList.length;
  const directActive = directList.filter((m) => m.active).length;
  const directInactive = directCount - directActive;

  const indirectList = allMembers.filter((m) => !m.isDirect);
  const indirectCount = indirectList.length;
  const indirectActive = indirectList.filter((m) => m.active).length;
  const indirectInactive = indirectCount - indirectActive;

  const totalPoints = allMembers.reduce((sum, m) => sum + m.volume, 0);

  const today = new Date();
  const isCurrentMonth = monthRef.getFullYear() === today.getFullYear() && monthRef.getMonth() === today.getMonth();

  function prevMonth() {
    setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function nextMonth() {
    if (!isCurrentMonth) {
      setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    }
  }

  const q = qualificationConfig[userQualification] ?? qualificationConfig.consultor;

  // ESC key resets
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        e.preventDefault();
        setSearchId("");
        setSortMode("");
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setSearchId("");
      e.currentTarget.blur();
    }
  }

  return (
    <div className="space-y-4">
      {/* ═══ Summary cards ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Qualificação */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="rounded-lg bg-primary/10 p-1.5 shrink-0">
                <Award className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-base sm:text-xl font-bold truncate">{q.label}</p>
            <p className="text-[11px] text-muted-foreground">{maxLevel}º nível</p>
          </CardContent>
        </Card>

        {/* Pontos no período */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="rounded-lg bg-primary/10 p-1.5 shrink-0">
                <Target className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-base sm:text-xl font-bold truncate">
              {totalPoints.toLocaleString("pt-BR")} pontos
            </p>
            <p className="text-[11px] text-muted-foreground">no período</p>
          </CardContent>
        </Card>

        {/* Diretos */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="rounded-lg bg-primary/10 p-1.5 shrink-0">
                <UserCheck className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-base sm:text-xl font-bold truncate">{directCount} diretos</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] text-success">{directActive} ativos</span>
              <span className="text-[11px] text-destructive">{directInactive} inativos</span>
            </div>
          </CardContent>
        </Card>

        {/* Indiretos */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="rounded-lg bg-primary/10 p-1.5 shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-base sm:text-xl font-bold truncate">{indirectCount} indiretos</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] text-success">{indirectActive} ativos</span>
              <span className="text-[11px] text-destructive">{indirectInactive} inativos</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ Filters ═══ */}
      {/* Desktop: all in one row, wrapping search+sort+toggle to second row when tight */}
      <div className="hidden md:block">
        <div className="flex flex-wrap items-center gap-3">
          {/* Period mode + date control */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex rounded-md border border-input overflow-hidden h-8">
              <button
                onClick={() => setFilterMode("month")}
                className={cn(
                  "px-3 text-xs transition-colors",
                  filterMode === "month"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent"
                )}
              >
                Mês
              </button>
              <button
                onClick={() => setFilterMode("period")}
                className={cn(
                  "px-3 text-xs transition-colors",
                  filterMode === "period"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent"
                )}
              >
                Período
              </button>
            </div>

            {filterMode === "month" ? (
              <div className="flex items-center gap-0 shrink-0 h-8">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium w-[120px] text-center whitespace-nowrap">
                  {getMonthLabel(monthRef)}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth} disabled={isCurrentMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Input
                  type="date"
                  className="h-8 text-xs w-[130px]"
                  value={periodStart}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
                <span className="text-xs text-muted-foreground">a</span>
                <Input
                  type="date"
                  className="h-8 text-xs w-[130px]"
                  value={periodEnd}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID ou nome"
              className="h-8 pl-8 pr-8 text-xs"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchId && (
              <button type="button" onClick={() => setSearchId("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort + View toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <Select value={sortMode || undefined} onValueChange={(v) => setSortMode(v as SortMode)}>
              <SelectTrigger className="h-8 text-[11px] w-[140px]">
                <ArrowUpDown className="h-3 w-3 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Classificar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default" className="text-xs">Ativos primeiro</SelectItem>
                <SelectItem value="points" className="text-xs">Maior pontuação</SelectItem>
                <SelectItem value="qualification" className="text-xs">Maior qualificação</SelectItem>
                <SelectItem value="date_newest" className="text-xs">Mais recentes</SelectItem>
                <SelectItem value="date_oldest" className="text-xs">Mais antigos</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex rounded-md border border-input overflow-hidden h-8">
              <button
                onClick={() => setViewMode("tree")}
                className={cn(
                  "px-2 transition-colors",
                  viewMode === "tree"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent"
                )}
                title="Árvore"
              >
                <GitBranch className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-2 transition-colors",
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent"
                )}
                title="Lista"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden space-y-2">
        {/* Row 1: Mês|Período toggle + Sort + View toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-md border border-input overflow-hidden h-8">
            <button
              onClick={() => setFilterMode("month")}
              className={cn(
                "px-3 text-xs transition-colors",
                filterMode === "month"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              Mês
            </button>
            <button
              onClick={() => setFilterMode("period")}
              className={cn(
                "px-3 text-xs transition-colors",
                filterMode === "period"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              Período
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortMode || undefined} onValueChange={(v) => setSortMode(v as SortMode)}>
              <SelectTrigger className="h-8 text-[11px] w-[130px]">
                <ArrowUpDown className="h-3 w-3 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Classificar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default" className="text-xs">Ativos primeiro</SelectItem>
                <SelectItem value="points" className="text-xs">Maior pontuação</SelectItem>
                <SelectItem value="qualification" className="text-xs">Maior qualificação</SelectItem>
                <SelectItem value="date_newest" className="text-xs">Mais recentes</SelectItem>
                <SelectItem value="date_oldest" className="text-xs">Mais antigos</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex rounded-md border border-input overflow-hidden h-8">
              <button
                onClick={() => setViewMode("tree")}
                className={cn(
                  "px-2 transition-colors",
                  viewMode === "tree"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent"
                )}
                title="Árvore"
              >
                <GitBranch className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-2 transition-colors",
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent"
                )}
                title="Lista"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Date control */}
        <div>
          {filterMode === "month" ? (
            <div className="flex items-center justify-center gap-0 h-8">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium w-[120px] text-center whitespace-nowrap">
                {getMonthLabel(monthRef)}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth} disabled={isCurrentMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Input
                type="date"
                className="h-8 text-xs flex-1"
                value={periodStart}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
              <span className="text-xs text-muted-foreground">a</span>
              <Input
                type="date"
                className="h-8 text-xs flex-1"
                value={periodEnd}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Row 3: Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID ou nome"
            className="h-8 pl-8 pr-8 text-xs"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchId && (
            <button type="button" onClick={() => setSearchId("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ═══ Main content ═══ */}
      {viewMode === "tree" ? (
        <Card>
          <CardContent className="p-3 sm:p-4 pb-5 sm:pb-6">
            <h2 className="text-base font-bold text-foreground text-center mb-4" style={{ paddingLeft: 80 }}>Rede Unilevel</h2>
            <UnilevelOrgChart
              root={mockUnilevelTree}
              maxLevel={maxLevel}
              searchQuery={searchId || searchQuery}
              sortMode={sortMode || "default"}
              filterEndDate={
                filterMode === "month"
                  ? new Date(monthRef.getFullYear(), monthRef.getMonth() + 1, 0).toISOString()
                  : periodEnd || undefined
              }
            />
          </CardContent>
        </Card>
      ) : null}

      {/* ═══ Level Table (list view only) ═══ */}
      {viewMode === "list" && (
      <Card>
        {/* Header with mode toggle + selectors */}
        <div className="p-3 bg-primary text-primary-foreground rounded-t-lg space-y-2">
          {/* Row 1: Mode toggle + Stats */}
          <div className="flex items-center justify-between">
            {/* Mode toggle: Por Nível / Por Direto */}
            <div className="flex rounded-md overflow-hidden h-8">
              <button
                onClick={() => setListMode("by_level")}
                className={cn(
                  "px-2.5 text-[11px] font-medium transition-colors whitespace-nowrap",
                  listMode === "by_level"
                    ? "bg-white/30 text-primary-foreground"
                    : "bg-white/10 text-primary-foreground/60 hover:bg-white/15"
                )}
              >
                Por Nível
              </button>
              <button
                onClick={() => setListMode("by_direct")}
                className={cn(
                  "px-2.5 text-[11px] font-medium transition-colors whitespace-nowrap",
                  listMode === "by_direct"
                    ? "bg-white/30 text-primary-foreground"
                    : "bg-white/10 text-primary-foreground/60 hover:bg-white/15"
                )}
              >
                Por Direto
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2">
              {listMode === "by_level" ? (
                <>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5 bg-white/20 text-primary-foreground border-0 font-semibold">
                    {selectedLevelMembers.reduce((s, m) => s + m.volume, 0).toLocaleString("pt-BR")} pts
                  </Badge>
                  <span className="text-xs text-primary-foreground/80 font-medium">
                    {selectedLevelMembers.length} {selectedLevelMembers.length === 1 ? "pessoa" : "pessoas"}
                  </span>
                </>
              ) : (
                <>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5 bg-white/20 text-primary-foreground border-0 font-semibold">
                      {directSubtreeMembers.reduce((s, m) => s + m.volume, 0).toLocaleString("pt-BR")} pts
                    </Badge>
                    <span className="text-xs text-primary-foreground/80 font-medium">
                      {directSubtreeMembers.length} {directSubtreeMembers.length === 1 ? "pessoa" : "pessoas"}
                    </span>
                  </>
                )}
              </div>
            </div>

          {/* Row 2: Contextual selector */}
          {listMode === "by_level" ? (
            <Select value={String(selectedLevel)} onValueChange={(v) => setSelectedLevel(Number(v))}>
              <SelectTrigger className="h-8 w-full text-sm font-semibold bg-white/20 border-0 text-primary-foreground">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                {availableLevels.map((lvl) => {
                  const locked = lvl > maxLevel;
                  return (
                    <SelectItem
                      key={lvl}
                      value={String(lvl)}
                      className={cn("text-sm font-semibold", locked && "text-muted-foreground")}
                      disabled={locked}
                    >
                      <span className="flex items-center gap-1.5">
                        Nível {lvl}
                        {locked && <Lock className="h-3 w-3" />}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          ) : (
            <Select value={selectedDirectId} onValueChange={(v) => setSelectedDirectId(v)}>
              <SelectTrigger className="h-8 w-full text-sm font-semibold bg-white/20 border-0 text-primary-foreground">
                <SelectValue placeholder="Selecionar direto" />
              </SelectTrigger>
              <SelectContent>
                {directMembers.map((dm) => (
                  <SelectItem key={dm.id} value={dm.id} className="text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className={cn("h-1.5 w-1.5 rounded-full inline-block", dm.active ? "bg-success" : "bg-destructive")} />
                      {dm.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <CardContent className="px-0 pb-2">
          {/* ── By Level mode ── */}
          {listMode === "by_level" && (
            <>
              {selectedLevelMembers.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">Nenhum membro encontrado neste nível.</p>
              ) : (
              <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[24px] px-2.5" />
                    <TableHead className="text-[10px] px-2.5 w-[80px] text-center">ID</TableHead>
                    <TableHead className={cn("text-[10px] px-2.5 text-center", isMobile ? "w-[28px]" : "w-[100px]")}>Qual.</TableHead>
                    <TableHead className="text-[10px] px-2.5 w-auto">Nome</TableHead>
                    <TableHead className="text-[10px] px-2.5 w-[52px] text-right">Pontos</TableHead>
                    {!isMobile && (
                      <>
                        <TableHead className="text-[10px] px-2.5 w-[100px]">Origem</TableHead>
                        <TableHead className="text-[10px] px-2.5 w-[52px] text-center">Nível</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedLevelMembers.map((m) => {
                    const q = qualificationConfig[m.qualification] ?? qualificationConfig.consultor;
                    const lineLabel = selectedLevel === 1
                      ? "Diretos"
                      : m.directAncestorName
                        ? `↳ ${m.directAncestorName}`
                        : "—";
                    return (
                      <TableRow key={m.id} className="hover:bg-accent/40">
                        <TableCell className="px-2.5 py-1.5">
                          <div className={cn("h-2 w-2 rounded-full mx-auto", m.active ? "bg-success" : "bg-destructive")} />
                        </TableCell>
                        <TableCell className={cn("px-2.5 py-1.5 text-[11px] tabular-nums truncate text-center", m.isDirect && "font-bold")}>
                          {m.id}
                        </TableCell>
                        <TableCell className="px-2.5 py-1.5 text-center">
                          <span style={{ color: q.color }} className="text-xs" title={q.label}>
                            {q.icon}{!isMobile && <span className="ml-1 text-[10px]">{q.label}</span>}
                          </span>
                        </TableCell>
                        <TableCell className={cn("px-2.5 py-1.5 text-[11px] truncate", m.isDirect && "font-bold")}>
                          {m.name}
                        </TableCell>
                        <TableCell className="px-2.5 py-1.5 text-[11px] tabular-nums font-medium text-right">
                          {m.volume.toLocaleString("pt-BR")}
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell className="px-2.5 py-1.5 text-[10px] text-muted-foreground truncate" title={lineLabel}>
                              {lineLabel}
                            </TableCell>
                            <TableCell className="px-2.5 py-1.5 text-[10px] text-muted-foreground text-center">
                              {m.level ?? 1}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
              )}
            </>
          )}

          {/* ── By Direct mode ── */}
          {listMode === "by_direct" && (
            <>
              {directSubtreeMembers.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">Nenhum membro encontrado para este direto.</p>
              ) : (
              <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
                {directSubtreeLevels.map((lvl) => {
                  const members = directSubtreeByLevel[lvl] || [];
                  const levelPoints = members.reduce((s, m) => s + m.volume, 0);
                  
                  return (
                    <div key={lvl}>
                      {/* Level header */}
                      <div
                        className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b"
                      >
                        <span className="text-[11px] font-semibold text-foreground">
                          Nível {lvl}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-semibold">
                            {levelPoints.toLocaleString("pt-BR")} pts
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {members.length} {members.length === 1 ? "pessoa" : "pessoas"}
                          </span>
                        </div>
                      </div>
                      {/* Members in this level */}
                      <Table className="table-fixed w-full">
                        <TableBody>
                          {members.map((m) => {
                            const q = qualificationConfig[m.qualification] ?? qualificationConfig.consultor;
                            return (
                              <TableRow key={m.id} className="hover:bg-accent/40">
                                <TableCell className="px-2.5 py-1.5 w-[24px]">
                                  <div className={cn("h-2 w-2 rounded-full mx-auto", m.active ? "bg-success" : "bg-destructive")} />
                                </TableCell>
                                <TableCell className="px-2.5 py-1.5 text-[11px] tabular-nums text-center w-[80px]">
                                  {m.id}
                                </TableCell>
                                <TableCell className="px-2.5 py-1.5 text-center">
                                  <span style={{ color: q.color }} className="text-xs" title={q.label}>
                                    {q.icon}{!isMobile && <span className="ml-1 text-[10px]">{q.label}</span>}
                                  </span>
                                </TableCell>
                                <TableCell className="px-2.5 py-1.5 text-[11px] truncate w-auto">
                                  {m.name}
                                </TableCell>
                                <TableCell className="px-2.5 py-1.5 text-[11px] tabular-nums font-medium text-right w-[52px]">
                                  {m.volume.toLocaleString("pt-BR")}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })}
              </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      )}

      {/* Qualification legend (list view only) */}
      {viewMode === "list" && <QualificationLegend />}

      {/* ═══ Bonus section ═══ */}
      <BonusSection onOpen={() => setBonusModalOpen(true)} />
      <BonusDialog open={bonusModalOpen} onOpenChange={setBonusModalOpen} />

      {/* Member detail */}
      <MemberDetailDialog
        member={selectedMember}
        open={!!selectedMember}
        onOpenChange={(o) => !o && setSelectedMember(null)}
      />
    </div>
  );
}

/* ── Sub-components ── */

function BonusSection({ onOpen }: { onOpen: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 shrink-0">
          <PlayCircle className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Entenda seus bônus</p>
          <p className="text-xs text-muted-foreground">Saiba como funciona a pontuação Unilevel e como maximizar seus resultados.</p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={onOpen}>
          Saiba mais
        </Button>
      </CardContent>
    </Card>
  );
}

function BonusDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary" />
            Bônus Unilevel
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>O bônus Unilevel é calculado com base na <strong className="text-foreground">pontuação gerada por cada nível</strong> da sua rede, de acordo com a sua qualificação.</p>
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <p className="font-medium text-foreground">Como funciona:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Cada nível gera uma porcentagem de bônus sobre o volume produzido.</li>
              <li>Sua qualificação determina até qual nível você recebe pontuação.</li>
              <li>Quanto maior a qualificação, mais níveis e maior profundidade de ganhos.</li>
              <li>O plano Diamante estende a pontuação até o 10º nível.</li>
            </ol>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="font-medium text-foreground text-xs">💡 Dica</p>
            <p className="text-xs mt-1">
              Incentive seus diretos a se qualificarem.
              {"\n"}Quanto mais qualificada sua equipe, maior o volume gerado em cada nível.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useMemo, useEffect } from "react";
import {
  Users, UserCheck, Target, TrendingUp, Layers, Search, X, ArrowUpDown,
  PlayCircle, Lightbulb, List, GitBranch, RotateCcw, Calendar,
  ChevronDown, ChevronRight, ChevronLeft, Award,
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
  levelPointsTable, extraBonus, diamanteLevelTable, diamanteLabels, diamanteExtraBonus,
  FlatUnilevelMember,
} from "./unilevel-mock-data";
import { useIsMobile } from "@/hooks/use-mobile";

/* ── Sort ── */
type SortMode = "default" | "points" | "date_newest" | "date_oldest" | "status";

function sortMembers(members: FlatUnilevelMember[], mode: SortMode): FlatUnilevelMember[] {
  const sorted = [...members];
  switch (mode) {
    case "points":
      return sorted.sort((a, b) => b.volume - a.volume);
    case "date_newest":
      return sorted.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
    case "date_oldest":
      return sorted.sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
    case "status":
    default:
      return sorted.sort((a, b) => {
        if (a.active === b.active) return b.volume - a.volume;
        return a.active ? -1 : 1;
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
  const [viewMode, setViewMode] = useState<"tree" | "list">(isMobile ? "list" : "tree");

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

  // Group by level
  const levelGroups = useMemo(() => {
    const map = new Map<number, FlatUnilevelMember[]>();
    filteredMembers.forEach((m) => {
      const lvl = m.level ?? 1;
      if (!map.has(lvl)) map.set(lvl, []);
      map.get(lvl)!.push(m);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
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
        {/* Diretos */}
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <UserCheck className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground truncate">Diretos</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-sm font-bold">{directCount}</p>
                <span className="text-[10px] text-success">{directActive} ativos</span>
                <span className="text-[10px] text-destructive">{directInactive} inat.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pontos no período */}
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground truncate">Pontos no Período</p>
              <p className="text-sm font-bold truncate">{totalPoints.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total indiretos */}
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground truncate">Total Indiretos</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-sm font-bold">{indirectCount}</p>
                <span className="text-[10px] text-success">{indirectActive} ativos</span>
                <span className="text-[10px] text-destructive">{indirectInactive} inat.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Qualificação */}
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <Award className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground truncate">Qualificação</p>
              <p className="text-sm font-bold truncate" style={{ color: q.color }}>{q.label}</p>
              <p className="text-[10px] text-muted-foreground">{maxLevel}º nível</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ Filters ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-3 items-end">
        {/* Period filter */}
        <div className="flex items-center gap-2">
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
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-8 text-xs w-[160px]">
                <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((mo) => (
                  <SelectItem key={mo.value} value={mo.value} className="text-xs">
                    {mo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        {/* Sort + View toggle */}
        <div className="flex items-center gap-2">
          <Select value={sortMode || undefined} onValueChange={(v) => setSortMode(v as SortMode)}>
            <SelectTrigger className="h-8 text-[11px] w-[140px]">
              <ArrowUpDown className="h-3 w-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Classificar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default" className="text-xs">Ativos primeiro</SelectItem>
              <SelectItem value="points" className="text-xs">Maior pontuação</SelectItem>
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
              title="Organograma"
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

      {/* ═══ Main content ═══ */}
      {viewMode === "tree" ? (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <h2 className="text-base font-bold text-foreground text-center mb-4">Rede Unilevel</h2>
            <UnilevelOrgChart
              root={mockUnilevelTree}
              maxLevel={maxLevel}
              onSelectMember={setSelectedMember}
            />
          </CardContent>
        </Card>
      ) : null}

      {/* ═══ Level Table ═══ */}
      <div className="space-y-3">
        {levelGroups.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Nenhum membro encontrado.
            </CardContent>
          </Card>
        )}

        {levelGroups.map(([lvl, members]) => (
          <LevelTable
            key={lvl}
            level={lvl}
            members={members}
            onSelect={setSelectedMember}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* Qualification legend */}
      <QualificationLegend />

      {/* ═══ Level info card ═══ */}
      <LevelInfoCard userQualification={userQualification} maxLevel={maxLevel} />

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

function LevelTable({
  level,
  members,
  onSelect,
  isMobile,
}: {
  level: number;
  members: FlatUnilevelMember[];
  onSelect: (m: NetworkMember) => void;
  isMobile: boolean;
}) {
  const [collapsed, setCollapsed] = useState(level > 2);

  return (
    <Card>
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-semibold">Nível {level}</span>
          <Badge variant="secondary" className="text-[10px]">{members.length}</Badge>
          {level === 1 && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary">
              Diretos
            </Badge>
          )}
        </div>
      </button>
      {!collapsed && (
        <CardContent className="px-0 pb-2">
          <div className="max-h-[352px] overflow-y-auto overflow-x-hidden">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[24px] px-1" />
                  <TableHead className="text-[10px] px-1 w-[52px]">ID</TableHead>
                  <TableHead className="text-[10px] px-1">Nome</TableHead>
                  {!isMobile && (
                    <TableHead className="text-[10px] px-1 w-[60px]">Tipo</TableHead>
                  )}
                  <TableHead className="text-[10px] px-1 text-center w-[28px]">Qual.</TableHead>
                  <TableHead className="text-[10px] px-1 text-right w-[52px]">Pontos</TableHead>
                  {!isMobile && (
                    <TableHead className="text-[10px] px-1 text-right w-[76px]">Cadastro</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => {
                  const q = qualificationConfig[m.qualification] ?? qualificationConfig.consultor;
                  return (
                    <TableRow
                      key={m.id}
                      className="cursor-pointer hover:bg-accent/40"
                      onClick={() => onSelect(m)}
                    >
                      <TableCell className="px-1 py-1.5">
                        <div className={cn("h-2 w-2 rounded-full mx-auto", m.active ? "bg-success" : "bg-destructive")} />
                      </TableCell>
                      <TableCell className={cn("px-1 py-1.5 text-[11px] tabular-nums truncate", m.isDirect && "font-bold")}>
                        {m.id}
                      </TableCell>
                      <TableCell className={cn("px-1 py-1.5 text-[11px] truncate", m.isDirect && "font-bold")}>
                        {m.name}
                      </TableCell>
                      {!isMobile && (
                        <TableCell className="px-1 py-1.5 text-[10px] text-muted-foreground">
                          {m.isDirect ? "Direto" : "Rede"}
                        </TableCell>
                      )}
                      <TableCell className="px-1 py-1.5 text-center">
                        <span style={{ color: q.color }} className="text-xs" title={q.label}>{q.icon}</span>
                      </TableCell>
                      <TableCell className="px-1 py-1.5 text-[11px] text-right tabular-nums font-medium">
                        {m.volume.toLocaleString("pt-BR")}
                      </TableCell>
                      {!isMobile && (
                        <TableCell className="px-1 py-1.5 text-[10px] text-right text-muted-foreground tabular-nums">
                          {new Date(m.joinDate).toLocaleDateString("pt-BR")}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function LevelInfoCard({ userQualification, maxLevel }: { userQualification: string; maxLevel: number }) {
  const q = qualificationConfig[userQualification] ?? qualificationConfig.consultor;
  const qualColumns = ["consultor", "distribuidor", "lider", "rubi", "esmeralda", "diamante"] as const;
  const qualLabels: Record<string, string> = {
    consultor: "Consultor", distribuidor: "Distribuidor", lider: "Líder",
    rubi: "Rubi", esmeralda: "Esmeralda", diamante: "Diamante",
  };

  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Pontuação por Níveis</span>
        </div>
        <p className="text-sm leading-snug text-muted-foreground mb-3">
          Sua qualificação atual é <strong className="text-foreground" style={{ color: q.color }}>{q.label}</strong>, permitindo visualizar e pontuar até o <strong className="text-foreground">nível {maxLevel}</strong>.
          {" "}Conforme você avança de qualificação, mais níveis da rede ficam disponíveis.
        </p>

        {/* Main table */}
        <div className="rounded-lg bg-muted/50 p-3 overflow-x-auto mb-3">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] px-2 py-1 h-6 font-bold">Nível</TableHead>
                {qualColumns.map((col) => (
                  <TableHead key={col} className="text-[10px] px-2 py-1 h-6 text-center font-bold">{qualLabels[col]}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {levelPointsTable.map((row) => (
                <TableRow key={row.level}>
                  <TableCell className="px-2 py-1 text-xs font-medium text-center">{row.level}º</TableCell>
                  {qualColumns.map((col) => (
                    <TableCell key={col} className={cn("px-2 py-1 text-xs text-center", row[col] ? "font-semibold" : "text-muted-foreground/30")}>
                      {row[col] || ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {/* Extra row */}
              <TableRow className="border-t-2 bg-primary/5">
                <TableCell className="px-2 py-1.5 text-xs font-bold text-center">Extra</TableCell>
                {qualColumns.map((col) => (
                  <TableCell key={col} className={cn("px-2 py-1.5 text-xs text-center font-bold", extraBonus[col] !== "-" ? "text-primary" : "text-muted-foreground")}>
                    {extraBonus[col]}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Plano Diamante */}
        <div className="rounded-lg bg-foreground/[0.03] border border-foreground/10 p-3 overflow-x-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">◈</span>
            <span className="text-xs font-bold text-foreground">Plano Diamante</span>
            <span className="text-[10px] text-muted-foreground">Receba sempre o dobro dos seus ganhos</span>
          </div>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] px-2 py-1 h-6 font-bold">Nível</TableHead>
                {diamanteLabels.map((d) => (
                  <TableHead key={d.key} className="text-[10px] px-2 py-1 h-6 text-center font-bold">{d.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {diamanteLevelTable.map((row) => (
                <TableRow key={row.level}>
                  <TableCell className="px-2 py-1 text-xs font-medium text-center">{row.level}º</TableCell>
                  {diamanteLabels.map((d) => (
                    <TableCell key={d.key} className={cn("px-2 py-1 text-xs text-center", row[d.key] ? "font-semibold" : "text-muted-foreground/30")}>
                      {row[d.key] || ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {/* Extra row */}
              <TableRow className="border-t-2 bg-primary/5">
                <TableCell className="px-2 py-1.5 text-xs font-bold text-center">Extra</TableCell>
                {diamanteLabels.map((d) => (
                  <TableCell key={d.key} className="px-2 py-1.5 text-xs text-center font-bold text-primary">
                    {diamanteExtraBonus}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

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


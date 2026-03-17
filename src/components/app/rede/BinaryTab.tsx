import { useState, useMemo, useRef } from "react";
import { ArrowDownLeft, ArrowDownRight, Lightbulb, Search, ChevronLeft, ChevronRight, X, ArrowUp, PlayCircle, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BinaryTreeNode } from "./BinaryTreeNode";
import { MemberDetailDialog } from "./MemberDetailDialog";
import { mockBinaryTree, mockBinarySummary, NetworkMember, qualificationConfig } from "./mock-data";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

/* ── Helpers ── */

function flattenSide(node: NetworkMember | null | undefined): NetworkMember[] {
  if (!node) return [];
  return [node, ...flattenSide(node.left), ...flattenSide(node.right)];
}

function findNodeById(node: NetworkMember | null | undefined, id: string): NetworkMember | null {
  if (!node) return null;
  if (node.id === id) return node;
  return findNodeById(node.left, id) || findNodeById(node.right, id);
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function getMonthRange(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  return {
    from: new Date(y, m, 1).toISOString().slice(0, 10),
    to: new Date(y, m + 1, 0).toISOString().slice(0, 10),
  };
}

/* ── Main component ── */

export function BinaryTab() {
  const isMobile = useIsMobile();
  const [rootId, setRootId] = useState(mockBinaryTree.id);
  const [navHistory, setNavHistory] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<NetworkMember | null>(null);
  const [bonusModalOpen, setBonusModalOpen] = useState(false);

  // Filters
  const [filterMode, setFilterMode] = useState<"month" | "custom">("month");
  const [monthRef, setMonthRef] = useState(new Date());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchId, setSearchId] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const isCurrentMonth = monthRef.getFullYear() === today.getFullYear() && monthRef.getMonth() === today.getMonth();

  // Current root node
  const currentRoot = findNodeById(mockBinaryTree, rootId) ?? mockBinaryTree;

  // Flatten legs for table
  const leftMembers = useMemo(() => flattenSide(currentRoot.left), [currentRoot]);
  const rightMembers = useMemo(() => flattenSide(currentRoot.right), [currentRoot]);

  // Filter members by search & date range
  const filterMembers = (members: NetworkMember[]) => {
    let result = members;
    if (searchId.trim()) {
      const q = searchId.toLowerCase();
      result = result.filter(m => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
    }
    // Date filtering would apply to volume period — for mock we just pass through
    return result.sort((a, b) => b.volume - a.volume);
  };

  const filteredLeft = useMemo(() => filterMembers(leftMembers), [leftMembers, searchId]);
  const filteredRight = useMemo(() => filterMembers(rightMembers), [rightMembers, searchId]);

  const leftVolume = leftMembers.reduce((sum, m) => sum + m.volume, 0);
  const rightVolume = rightMembers.reduce((sum, m) => sum + m.volume, 0);
  const weakerSide = leftVolume <= rightVolume ? "esquerda" : "direita";
  const diff = Math.abs(leftVolume - rightVolume);

  // Navigation
  function navigateTo(member: NetworkMember) {
    if (member.left || member.right) {
      setNavHistory(prev => [...prev, rootId]);
      setRootId(member.id);
    } else {
      setSelectedMember(member);
    }
  }

  function navigateBack() {
    if (navHistory.length > 0) {
      const prev = navHistory[navHistory.length - 1];
      setNavHistory(h => h.slice(0, -1));
      setRootId(prev);
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.currentTarget.select();
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Executive Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <ArrowDownLeft className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Perna Esquerda</span>
            </div>
            <p className="text-xl font-bold">{leftVolume.toLocaleString("pt-BR")} <span className="text-xs font-normal text-muted-foreground">pts</span></p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{leftMembers.length} {leftMembers.length === 1 ? "pessoa" : "pessoas"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-lg bg-success/10 p-1.5">
                <ArrowDownRight className="h-4 w-4 text-success" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Perna Direita</span>
            </div>
            <p className="text-xl font-bold">{rightVolume.toLocaleString("pt-BR")} <span className="text-xs font-normal text-muted-foreground">pts</span></p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{rightMembers.length} {rightMembers.length === 1 ? "pessoa" : "pessoas"}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Diagnóstico</span>
            </div>
            <p className="text-sm font-medium leading-snug">
              A perna <strong>{weakerSide}</strong> está com {diff.toLocaleString("pt-BR")} pts a menos.
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Foque o desenvolvimento nesse lado para equilibrar o volume.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-md border border-input overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => setFilterMode("month")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors min-w-[52px] text-center",
                filterMode === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              Mês
            </button>
            <button
              type="button"
              onClick={() => { setFilterMode("custom"); setDateTo(todayStr); }}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors min-w-[52px] text-center",
                filterMode === "custom" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              Período
            </button>
          </div>

          {/* Search mobile */}
          <div className="relative flex-1 min-w-0 sm:hidden">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar ID ou nome"
              className="h-8 pl-7 pr-7 text-xs"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchId && (
              <button type="button" onClick={() => setSearchId("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {filterMode === "month" ? (
            <div className="flex items-center gap-0 shrink-0 h-8">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonthRef(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium min-w-[120px] text-center capitalize">
                {getMonthLabel(monthRef)}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => !isCurrentMonth && setMonthRef(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} disabled={isCurrentMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 items-center shrink-0">
              <Input type="date" className="h-8 w-[148px] text-xs" max={todayStr} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <span className="text-xs text-muted-foreground">até</span>
              <Input type="date" className="h-8 w-[148px] text-xs" max={todayStr} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          )}

          {/* Search desktop */}
          <div className="relative hidden sm:block ml-auto w-48 shrink-0">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Buscar ID ou nome"
              className="h-8 pl-7 pr-7 text-xs"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchId && (
              <button type="button" onClick={() => { setSearchId(""); searchRef.current?.focus(); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Tree + Tables layout ── */}
      <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-[1fr_1fr]")}>
        {/* Tree (desktop) or mobile cards */}
        {!isMobile ? (
          <Card className="col-span-2">
            <CardContent className="p-4">
              {/* Back button */}
              {navHistory.length > 0 && (
                <Button variant="ghost" size="sm" onClick={navigateBack} className="mb-3 gap-1 text-xs h-7 px-2">
                  <ArrowUp className="h-3 w-3" /> Voltar ao nível anterior
                </Button>
              )}
              <ScrollArea className="w-full">
                <div className="flex flex-col items-center min-w-[500px] py-4">
                  {/* Root (level 0) */}
                  <BinaryTreeNode node={currentRoot} onSelect={navigateTo} isRoot hasChildren={!!(currentRoot.left || currentRoot.right)} />

                  {(currentRoot.left || currentRoot.right) && (
                    <>
                      {/* Y connector: root → children */}
                      <div className="flex flex-col items-center w-full">
                        <div className="w-px h-6 bg-border" />
                        <div className="relative" style={{ width: 320 }}>
                          <div className="absolute top-0 left-[25%] right-[25%] h-px bg-border" />
                          <div className="absolute top-0 left-[25%] w-px h-6 bg-border" />
                          <div className="absolute top-0 right-[25%] w-px h-6 bg-border" />
                        </div>
                      </div>

                      {/* Children (level 1) */}
                      <div className="flex gap-12 mt-6">
                        <div className="flex flex-col items-center">
                          <BinaryTreeNode node={currentRoot.left ?? null} side="left" onSelect={navigateTo} hasChildren={!!(currentRoot.left?.left || currentRoot.left?.right)} />
                          {/* Grandchildren of left */}
                          {currentRoot.left && (currentRoot.left.left || currentRoot.left.right) && (
                            <>
                              <div className="flex flex-col items-center w-full">
                                <div className="w-px h-5 bg-border" />
                                <div className="relative" style={{ width: 160 }}>
                                  <div className="absolute top-0 left-[25%] right-[25%] h-px bg-border" />
                                  <div className="absolute top-0 left-[25%] w-px h-5 bg-border" />
                                  <div className="absolute top-0 right-[25%] w-px h-5 bg-border" />
                                </div>
                              </div>
                              <div className="flex gap-4 mt-5">
                                <BinaryTreeNode node={currentRoot.left.left ?? null} side="left" onSelect={navigateTo} hasChildren={!!(currentRoot.left.left?.left || currentRoot.left.left?.right)} />
                                <BinaryTreeNode node={currentRoot.left.right ?? null} side="right" onSelect={navigateTo} hasChildren={!!(currentRoot.left.right?.left || currentRoot.left.right?.right)} />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex flex-col items-center">
                          <BinaryTreeNode node={currentRoot.right ?? null} side="right" onSelect={navigateTo} hasChildren={!!(currentRoot.right?.left || currentRoot.right?.right)} />
                          {/* Grandchildren of right */}
                          {currentRoot.right && (currentRoot.right.left || currentRoot.right.right) && (
                            <>
                              <div className="flex flex-col items-center w-full">
                                <div className="w-px h-5 bg-border" />
                                <div className="relative" style={{ width: 160 }}>
                                  <div className="absolute top-0 left-[25%] right-[25%] h-px bg-border" />
                                  <div className="absolute top-0 left-[25%] w-px h-5 bg-border" />
                                  <div className="absolute top-0 right-[25%] w-px h-5 bg-border" />
                                </div>
                              </div>
                              <div className="flex gap-4 mt-5">
                                <BinaryTreeNode node={currentRoot.right.left ?? null} side="left" onSelect={navigateTo} hasChildren={!!(currentRoot.right.left?.left || currentRoot.right.left?.right)} />
                                <BinaryTreeNode node={currentRoot.right.right ?? null} side="right" onSelect={navigateTo} hasChildren={!!(currentRoot.right.right?.left || currentRoot.right.right?.right)} />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          /* Mobile: expandable cards instead of tree */
          <div className="space-y-2 col-span-1">
            {navHistory.length > 0 && (
              <Button variant="ghost" size="sm" onClick={navigateBack} className="gap-1 text-xs h-7 px-2 mb-1">
                <ArrowUp className="h-3 w-3" /> Voltar
              </Button>
            )}
            <MobileNodeCard node={currentRoot} label="Você" onNavigate={navigateTo} isRoot />
            {currentRoot.left && (
              <MobileNodeCard node={currentRoot.left} label="Esquerda" onNavigate={navigateTo} />
            )}
            {currentRoot.right && (
              <MobileNodeCard node={currentRoot.right} label="Direita" onNavigate={navigateTo} />
            )}
            {!currentRoot.left && !currentRoot.right && (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum membro neste nível.</p>
            )}
          </div>
        )}

        {/* Leg tables */}
        <LegTable title="Perna Esquerda" members={filteredLeft} onSelect={setSelectedMember} />
        <LegTable title="Perna Direita" members={filteredRight} onSelect={setSelectedMember} />
      </div>

      {/* ── Understand your bonuses ── */}
      <Card className="border-dashed">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 shrink-0">
            <PlayCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Entenda seus bônus</p>
            <p className="text-xs text-muted-foreground">Aprenda como funciona o bônus Binário e como maximizar seus ganhos.</p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => setBonusModalOpen(true)}>
            Saiba mais
          </Button>
        </CardContent>
      </Card>

      {/* Bonus explainer dialog */}
      <Dialog open={bonusModalOpen} onOpenChange={setBonusModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-primary" />
              Bônus Binário
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              O bônus binário é calculado com base no <strong className="text-foreground">volume da perna menor</strong> (mais fraca) da sua rede.
            </p>
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <p className="font-medium text-foreground">Como funciona:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>O sistema compara o volume total das pernas esquerda e direita.</li>
                <li>O bônus é calculado como uma porcentagem do volume da perna menor.</li>
                <li>Após o cálculo, os pontos utilizados são descontados de ambas as pernas.</li>
                <li>O excedente da perna maior é acumulado para o próximo período.</li>
              </ol>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="font-medium text-foreground text-xs">💡 Dica</p>
              <p className="text-xs mt-1">
                Para maximizar seus ganhos, mantenha as duas pernas equilibradas.
                Foque o desenvolvimento na perna mais fraca.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MemberDetailDialog member={selectedMember} open={!!selectedMember} onOpenChange={(o) => !o && setSelectedMember(null)} />
    </div>
  );
}

/* ── Leg table sub-component ── */

function LegTable({
  title,
  members,
  onSelect,
}: {
  title: string;
  members: NetworkMember[];
  onSelect: (m: NetworkMember) => void;
}) {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {title}
          <Badge variant="secondary" className="text-[10px] font-normal">{members.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-2">
        {members.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">Nenhum membro encontrado</p>
        ) : (
          <div className="max-h-[320px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[28px] px-2"></TableHead>
                  <TableHead className="text-xs px-2">ID</TableHead>
                  <TableHead className="text-xs px-2">Nome</TableHead>
                  {!isMobile && <TableHead className="text-xs px-2">Tipo</TableHead>}
                  <TableHead className="text-xs px-2 text-right">Pontos</TableHead>
                  <TableHead className="text-xs px-2 text-center w-[40px]">Qual.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => {
                  const q = qualificationConfig[m.qualification] ?? qualificationConfig.consultor;
                  const isDirect = m.type === "direct";
                  return (
                    <TableRow
                      key={m.id}
                      className="cursor-pointer hover:bg-accent/40"
                      onClick={() => onSelect(m)}
                    >
                      {/* Status dot */}
                      <TableCell className="px-2 py-1.5">
                        <div className={cn("h-2.5 w-2.5 rounded-full mx-auto", m.active ? "bg-success" : "bg-destructive")} />
                      </TableCell>
                      {/* ID */}
                      <TableCell className="px-2 py-1.5 text-xs font-medium">{m.id}</TableCell>
                      {/* Name */}
                      <TableCell className="px-2 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs truncate max-w-[100px]">{m.name}</span>
                          {isMobile && isDirect && (
                            <Star className="h-3 w-3 text-primary shrink-0" />
                          )}
                        </div>
                        {isMobile && (
                          <span className="text-[10px] text-muted-foreground">{isDirect ? "Direto" : "Rede"}</span>
                        )}
                      </TableCell>
                      {/* Type (desktop) */}
                      {!isMobile && (
                        <TableCell className="px-2 py-1.5">
                          <span className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded",
                            isDirect ? "bg-primary/10 text-primary" : "text-muted-foreground"
                          )}>
                            {isDirect ? "Direto" : "Rede"}
                          </span>
                        </TableCell>
                      )}
                      {/* Points */}
                      <TableCell className="px-2 py-1.5 text-xs text-right font-medium tabular-nums">
                        {m.volume.toLocaleString("pt-BR")}
                      </TableCell>
                      {/* Qualification */}
                      <TableCell className="px-2 py-1.5 text-center">
                        <span style={{ color: q.color }} className="text-sm" title={q.label}>{q.icon}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Mobile node card ── */

function MobileNodeCard({
  node,
  label,
  onNavigate,
  isRoot,
}: {
  node: NetworkMember;
  label: string;
  onNavigate: (m: NetworkMember) => void;
  isRoot?: boolean;
}) {
  const q = qualificationConfig[node.qualification] ?? qualificationConfig.consultor;
  const hasChildren = !!(node.left || node.right);

  return (
    <button
      onClick={() => onNavigate(node)}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent/40",
        node.active ? "border-l-4 border-l-success" : "border-l-4 border-l-destructive"
      )}
    >
      <div
        className="flex items-center justify-center h-10 w-10 rounded-full shrink-0 text-sm font-bold"
        style={{ backgroundColor: `${q.color}15`, color: q.color }}
      >
        {node.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold truncate">{node.name}</span>
          <span className="text-[10px] font-medium" style={{ color: q.color }}>{q.icon}</span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          ID {node.id} · {label}
        </span>
      </div>
      {hasChildren && (
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
    </button>
  );
}

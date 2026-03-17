import { useState, useMemo, useRef } from "react";
import { ArrowDownLeft, ArrowDownRight, Lightbulb, Search, ChevronRight, X, RotateCcw, PlayCircle, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BinaryTreeNode } from "./BinaryTreeNode";
import { mockBinaryTree, NetworkMember, qualificationConfig } from "./mock-data";
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

type SortMode = "default" | "points" | "date" | "status";

function sortMembers(members: NetworkMember[], mode: SortMode): NetworkMember[] {
  const sorted = [...members];
  switch (mode) {
    case "points":
      return sorted.sort((a, b) => b.volume - a.volume);
    case "date":
      return sorted.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
    case "status":
      return sorted.sort((a, b) => {
        if (a.active === b.active) return b.volume - a.volume;
        return a.active ? -1 : 1;
      });
    default:
      return sorted.sort((a, b) => {
        if (a.active === b.active) return b.volume - a.volume;
        return a.active ? -1 : 1;
      });
  }
}

/* ── Main component ── */

export function BinaryTab() {
  const isMobile = useIsMobile();
  const [rootId, setRootId] = useState(mockBinaryTree.id);
  const [navHistory, setNavHistory] = useState<string[]>([]);
  const [bonusModalOpen, setBonusModalOpen] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [sortMode, setSortMode] = useState<SortMode | "">("");
  const searchRef = useRef<HTMLInputElement>(null);

  const currentRoot = findNodeById(mockBinaryTree, rootId) ?? mockBinaryTree;
  const myDocument = mockBinaryTree.document;

  const leftMembers = useMemo(() => flattenSide(currentRoot.left), [currentRoot]);
  const rightMembers = useMemo(() => flattenSide(currentRoot.right), [currentRoot]);

  const filterMembers = (members: NetworkMember[]) => {
    let result = members;
    if (searchId.trim()) {
      const q = searchId.toLowerCase();
      result = result.filter(m => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
    }
    return sortMembers(result, sortMode || "default");
  };

  const filteredLeft = useMemo(() => filterMembers(leftMembers), [leftMembers, searchId, sortMode]);
  const filteredRight = useMemo(() => filterMembers(rightMembers), [rightMembers, searchId, sortMode]);

  const leftVolume = leftMembers.reduce((sum, m) => sum + m.volume, 0);
  const rightVolume = rightMembers.reduce((sum, m) => sum + m.volume, 0);
  const leftActive = leftMembers.filter(m => m.active).length;
  const rightActive = rightMembers.filter(m => m.active).length;
  const weakerSide = leftVolume <= rightVolume ? "esquerda" : "direita";
  const diff = Math.abs(leftVolume - rightVolume);

  function navigateTo(member: NetworkMember) {
    if (member.left || member.right) {
      setNavHistory(prev => [...prev, rootId]);
      setRootId(member.id);
    }
  }

  function navigateToId(id: string) {
    const node = findNodeById(mockBinaryTree, id);
    if (node && (node.left || node.right)) {
      setNavHistory(prev => [...prev, rootId]);
      setRootId(id);
    }
  }

  function navigateBack() {
    if (navHistory.length > 0) {
      const prev = navHistory[navHistory.length - 1];
      setNavHistory(h => h.slice(0, -1));
      setRootId(prev);
    }
  }

  function resetToRoot() {
    setNavHistory([]);
    setRootId(mockBinaryTree.id);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.currentTarget.select();
    }
  }

  /* ── Mobile layout ── */
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Navigation */}
        {rootId !== mockBinaryTree.id && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={navigateBack} className="gap-1 text-xs h-7 px-2">← Voltar</Button>
            <Button variant="ghost" size="sm" onClick={resetToRoot} className="gap-1 text-xs h-7 px-2">
              <RotateCcw className="h-3 w-3" /> Início
            </Button>
          </div>
        )}

        {/* Mobile tree cards */}
        <div className="space-y-2">
          <MobileNodeCard node={currentRoot} label="Você" onNavigate={navigateTo} isRoot />
          {currentRoot.left && <MobileNodeCard node={currentRoot.left} label="Esquerda" onNavigate={navigateTo} />}
          {currentRoot.right && <MobileNodeCard node={currentRoot.right} label="Direita" onNavigate={navigateTo} />}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-2">
          <SummaryCard side="left" volume={leftVolume} total={leftMembers.length} active={leftActive} inactive={leftMembers.length - leftActive} />
          <SummaryCard side="right" volume={rightVolume} total={rightMembers.length} active={rightActive} inactive={rightMembers.length - rightActive} />
        </div>

        {/* Diagnostics */}
        <DiagnosticCard weakerSide={weakerSide} diff={diff} />

        {/* Search */}
        <SearchInput value={searchId} onChange={setSearchId} onKeyDown={handleSearchKeyDown} />

        {/* Sort */}
        <SortSelector value={sortMode} onChange={setSortMode} />

        {/* Tables */}
        <LegTable title="Perna Esquerda" members={filteredLeft} onNavigate={navigateToId} />
        <LegTable title="Perna Direita" members={filteredRight} onNavigate={navigateToId} />

        {/* Bonus */}
        <BonusSection onOpen={() => setBonusModalOpen(true)} />
        <BonusDialog open={bonusModalOpen} onOpenChange={setBonusModalOpen} />
      </div>
    );
  }

  /* ── Desktop layout: 2 columns ── */
  return (
    <div className="space-y-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: "35% 1fr" }}>

        {/* ═══ LEFT COLUMN: Tree ═══ */}
        <div className="space-y-3">
          {/* Tree drawing */}
           <Card className="min-h-[470px] flex flex-col">
            <CardContent className="px-1 py-3 flex-1 flex flex-col">
              <h2 className="text-base font-bold text-foreground text-center mb-6">Rede Binária</h2>
              <div className="flex flex-col items-center py-2 flex-1">
                {/* Root */}
                <BinaryTreeNode node={currentRoot} onSelect={navigateTo} isRoot isMe={currentRoot.id === mockBinaryTree.id} isMineAlt={currentRoot.document === myDocument && currentRoot.id !== mockBinaryTree.id} hasChildren={!!(currentRoot.left || currentRoot.right)} />

                {/* Level 1 connectors — always rendered */}
                <svg width="200" height="28" className="shrink-0">
                  <line x1="100" y1="0" x2="50" y2="28" stroke="hsl(var(--border))" strokeWidth="1.5" />
                  <line x1="100" y1="0" x2="150" y2="28" stroke="hsl(var(--border))" strokeWidth="1.5" />
                </svg>

                {/* Children — fixed-width columns so positions stay stable */}
                <div className="flex">
                  {/* Left child column */}
                  <div className="flex flex-col items-center w-[120px]">
                    <BinaryTreeNode node={currentRoot.left ?? null} side="left" onSelect={navigateTo} isMineAlt={currentRoot.left?.document === myDocument} hasChildren={!!(currentRoot.left?.left || currentRoot.left?.right)} />
                    {/* Level 2 connectors — always rendered */}
                    <svg width="100" height="24" className="shrink-0">
                      <line x1="50" y1="0" x2="24" y2="24" stroke="hsl(var(--border))" strokeWidth="1" />
                      <line x1="50" y1="0" x2="76" y2="24" stroke="hsl(var(--border))" strokeWidth="1" />
                    </svg>
                    <div className="flex gap-2">
                      <BinaryTreeNode node={currentRoot.left?.left ?? null} side="left" onSelect={navigateTo} isMineAlt={currentRoot.left?.left?.document === myDocument} hasChildren={!!(currentRoot.left?.left?.left || currentRoot.left?.left?.right)} />
                      <BinaryTreeNode node={currentRoot.left?.right ?? null} side="right" onSelect={navigateTo} isMineAlt={currentRoot.left?.right?.document === myDocument} hasChildren={!!(currentRoot.left?.right?.left || currentRoot.left?.right?.right)} />
                    </div>
                  </div>

                  {/* Right child column */}
                  <div className="flex flex-col items-center w-[120px]">
                    <BinaryTreeNode node={currentRoot.right ?? null} side="right" onSelect={navigateTo} isMineAlt={currentRoot.right?.document === myDocument} hasChildren={!!(currentRoot.right?.left || currentRoot.right?.right)} />
                    {/* Level 2 connectors — always rendered */}
                    <svg width="100" height="24" className="shrink-0">
                      <line x1="50" y1="0" x2="24" y2="24" stroke="hsl(var(--border))" strokeWidth="1" />
                      <line x1="50" y1="0" x2="76" y2="24" stroke="hsl(var(--border))" strokeWidth="1" />
                    </svg>
                    <div className="flex gap-2">
                      <BinaryTreeNode node={currentRoot.right?.left ?? null} side="left" onSelect={navigateTo} isMineAlt={currentRoot.right?.left?.document === myDocument} hasChildren={!!(currentRoot.right?.left?.left || currentRoot.right?.left?.right)} />
                      <BinaryTreeNode node={currentRoot.right?.right ?? null} side="right" onSelect={navigateTo} isMineAlt={currentRoot.right?.right?.document === myDocument} hasChildren={!!(currentRoot.right?.right?.left || currentRoot.right?.right?.right)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation buttons at bottom */}
              {navHistory.length > 0 && (
                <>
                  <div className="border-t border-border/40 mt-auto" />
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={navigateBack} className="gap-1 text-xs h-7 px-2">
                      ← Voltar nível
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 px-2" onClick={resetToRoot}>
                      <RotateCcw className="h-3 w-3" /> Início
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Diagnostic - left column */}
          <DiagnosticCard weakerSide={weakerSide} diff={diff} />
        </div>

        {/* ═══ RIGHT COLUMN: Analytics ═══ */}
        <div className="space-y-3">
          {/* Current root info */}
          <Card>
            <CardContent className="p-4 text-center">
              <h2 className="text-lg font-bold" style={{ color: "#003885" }}>{currentRoot.name}</h2>
              <p className="text-xs text-muted-foreground">ID {currentRoot.id}</p>
            </CardContent>
          </Card>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard side="left" volume={leftVolume} total={leftMembers.length} active={leftActive} inactive={leftMembers.length - leftActive} />
            <SummaryCard side="right" volume={rightVolume} total={rightMembers.length} active={rightActive} inactive={rightMembers.length - rightActive} />
          </div>

          {/* Search + Sort — equal width */}
          <div className="grid grid-cols-2 gap-3">
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
            <SortSelector value={sortMode} onChange={setSortMode} />
          </div>

          {/* Tables side by side */}
          <div className="grid grid-cols-2 gap-3">
            <LegTable title="Perna Esquerda" members={filteredLeft} onNavigate={navigateToId} />
            <LegTable title="Perna Direita" members={filteredRight} onNavigate={navigateToId} />
          </div>
        </div>
      </div>

      {/* ═══ Bottom: Bonus section ═══ */}
      <BonusSection onOpen={() => setBonusModalOpen(true)} />
      <BonusDialog open={bonusModalOpen} onOpenChange={setBonusModalOpen} />
    </div>
  );
}

/* ── Sub-components ── */

function SummaryCard({ side, volume, total, active, inactive }: { side: "left" | "right"; volume: number; total: number; active: number; inactive: number }) {
  const isLeft = side === "left";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn("rounded-lg p-1.5", isLeft ? "bg-primary/10" : "bg-success/10")}>
            {isLeft ? <ArrowDownLeft className="h-4 w-4 text-primary" /> : <ArrowDownRight className="h-4 w-4 text-success" />}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Perna {isLeft ? "Esquerda" : "Direita"}
          </span>
        </div>
        <p className="text-xl font-bold">{volume.toLocaleString("pt-BR")} <span className="text-xs font-normal text-muted-foreground">pts</span></p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[11px] text-muted-foreground">{total} pessoas</span>
          <span className="text-[11px] text-success">{active} ativos</span>
          <span className="text-[11px] text-destructive">{inactive} inativos</span>
        </div>
      </CardContent>
    </Card>
  );
}

function DiagnosticCard({ weakerSide, diff }: { weakerSide: string; diff: number }) {
  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Lightbulb className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Diagnóstico</span>
        </div>
        <p className="text-sm leading-snug">
          A perna <strong>{weakerSide}</strong> está com {diff.toLocaleString("pt-BR")} pts a menos.
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">
          Foque o desenvolvimento nesse lado para equilibrar o volume.
        </p>
      </CardContent>
    </Card>
  );
}

function SearchInput({ value, onChange, onKeyDown, inputRef }: { value: string; onChange: (v: string) => void; onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void; inputRef?: React.RefObject<HTMLInputElement> }) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder="Buscar por ID ou nome"
        className="h-8 pl-8 pr-8 text-xs"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {value && (
        <button type="button" onClick={() => onChange("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function SortSelector({ value, onChange }: { value: SortMode | ""; onChange: (v: SortMode) => void }) {
  return (
    <Select value={value || undefined} onValueChange={(v) => onChange(v as SortMode)}>
      <SelectTrigger className="h-8 text-[11px] w-full">
        <ArrowUpDown className="h-3 w-3 mr-1 text-muted-foreground" />
        <SelectValue placeholder="Classificar" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="points" className="text-xs">Maior pontuação</SelectItem>
        <SelectItem value="status" className="text-xs">Ativos primeiro</SelectItem>
        <SelectItem value="date" className="text-xs">Data de cadastro</SelectItem>
      </SelectContent>
    </Select>
  );
}

function LegTable({ title, members, onNavigate }: { title: string; members: NetworkMember[]; onNavigate: (id: string) => void }) {
  return (
    <Card>
      <CardHeader className="pb-2 px-4 pt-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {title}
          <Badge variant="secondary" className="text-[10px] font-normal">{members.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-2">
        {members.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">Nenhum membro encontrado</p>
        ) : (
          <div className="max-h-[352px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[24px] px-2"></TableHead>
                  <TableHead className="text-[10px] px-2">ID</TableHead>
                  <TableHead className="text-[10px] px-2">Nome</TableHead>
                  <TableHead className="text-[10px] px-2 text-center w-[32px]">Qual.</TableHead>
                  <TableHead className="text-[10px] px-2 text-right">Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => {
                  const q = qualificationConfig[m.qualification] ?? qualificationConfig.consultor;
                  const isDirect = m.type === "direct";
                  const hasChildren = !!(m.left || m.right);
                  return (
                    <TableRow key={m.id} className="cursor-pointer hover:bg-accent/40" onClick={() => onNavigate(m.id)}>
                      <TableCell className="px-2 py-1.5">
                        <div className={cn("h-2 w-2 rounded-full mx-auto", m.active ? "bg-success" : "bg-destructive")} />
                      </TableCell>
                      <TableCell className={cn("px-2 py-1.5 text-[11px] tabular-nums", isDirect ? "font-bold" : "font-normal")}>
                        {m.id}
                      </TableCell>
                      <TableCell className={cn("px-2 py-1.5 text-[11px] truncate max-w-[100px]", isDirect ? "font-bold" : "font-normal")}>
                        {m.name}
                      </TableCell>
                      <TableCell className="px-2 py-1.5 text-center">
                        <span style={{ color: q.color }} className="text-xs" title={q.label}>{q.icon}</span>
                      </TableCell>
                      <TableCell className="px-2 py-1.5 text-[11px] text-right tabular-nums font-medium">
                        {m.volume.toLocaleString("pt-BR")}
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

function BonusSection({ onOpen }: { onOpen: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 shrink-0">
          <PlayCircle className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Entenda seus bônus</p>
          <p className="text-xs text-muted-foreground">Aprenda como funciona o bônus Binário e como maximizar seus ganhos.</p>
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
            Bônus Binário
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>O bônus binário é calculado com base no <strong className="text-foreground">volume da perna menor</strong> (mais fraca) da sua rede.</p>
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
            <p className="text-xs mt-1">Para maximizar seus ganhos, mantenha as duas pernas equilibradas. Foque o desenvolvimento na perna mais fraca.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MobileNodeCard({ node, label, onNavigate, isRoot }: { node: NetworkMember; label: string; onNavigate: (m: NetworkMember) => void; isRoot?: boolean }) {
  const q = qualificationConfig[node.qualification] ?? qualificationConfig.consultor;
  const hasChildren = !!(node.left || node.right);

  return (
    <button
      onClick={() => onNavigate(node)}
      className="w-full flex items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent/40"
    >
      <div className="flex items-center justify-center h-10 w-10 rounded-full shrink-0 text-sm font-bold bg-muted text-foreground">
        {node.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold truncate block">{node.name}</span>
        <span className="text-[11px] text-muted-foreground">
          ID {node.id} · {q.label} · {label}
        </span>
      </div>
      {hasChildren && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
    </button>
  );
}

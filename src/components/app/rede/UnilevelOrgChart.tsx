import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Users, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { qualificationConfig, NetworkMember } from "./mock-data";
import { UnilevelNode } from "./unilevel-mock-data";
import { Badge } from "@/components/ui/badge";

/* ── Constants ── */
const TOTAL_LEVELS = 10;
const ROW_HEIGHT = 120;
const NODE_W = 90;
const LEVEL_LABEL_W = 52;
const SCROLL_AMOUNT = 300;

/* ── Sort modes (must match UnilevelTab) ── */
type SortMode = "default" | "points" | "date_newest" | "date_oldest" | "status";

function sortNodes(nodes: UnilevelNode[], mode: SortMode): UnilevelNode[] {
  const sorted = [...nodes];
  switch (mode) {
    case "points":
      return sorted.sort((a, b) => b.volume - a.volume);
    case "date_newest":
      return sorted.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
    case "date_oldest":
      return sorted.sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
    case "status":
    case "default":
    default:
      return sorted.sort((a, b) => {
        if (a.active === b.active) return b.volume - a.volume;
        return a.active ? -1 : 1;
      });
  }
}

/* ── Helpers ── */

function findPathToId(node: UnilevelNode, targetId: string): string[] | null {
  if (node.id.toLowerCase() === targetId.toLowerCase()) return [node.id];
  if (!node.children) return null;
  for (const child of node.children) {
    const path = findPathToId(child, targetId);
    if (path) return [node.id, ...path];
  }
  return null;
}

function findPathByName(node: UnilevelNode, query: string): string[] | null {
  if (node.name.toLowerCase().includes(query)) return [node.id];
  if (!node.children) return null;
  for (const child of node.children) {
    const path = findPathByName(child, query);
    if (path) return [node.id, ...path];
  }
  return null;
}

function countByLevel(node: UnilevelNode, currentLevel: number = 0): Map<number, number> {
  const map = new Map<number, number>();
  if (!node.children) return map;
  for (const child of node.children) {
    const lvl = currentLevel + 1;
    map.set(lvl, (map.get(lvl) || 0) + 1);
    const childMap = countByLevel(child, lvl);
    childMap.forEach((count, l) => {
      map.set(l, (map.get(l) || 0) + count);
    });
  }
  return map;
}

function countDirectChildren(node: UnilevelNode): number {
  return node.children?.length ?? 0;
}

function collectNodesAtLevel(
  node: UnilevelNode,
  currentLevel: number,
  targetLevel: number,
  expandedIds: Set<string>
): UnilevelNode[] {
  if (currentLevel + 1 === targetLevel) {
    if (expandedIds.has(node.id) && node.children) {
      return node.children;
    }
    return [];
  }
  if (!expandedIds.has(node.id) || !node.children) return [];
  const result: UnilevelNode[] = [];
  for (const child of node.children) {
    result.push(...collectNodesAtLevel(child, currentLevel + 1, targetLevel, expandedIds));
  }
  return result;
}

/* ── Props ── */
interface Props {
  root: UnilevelNode;
  maxLevel: number;
  onSelectMember: (member: NetworkMember) => void;
  searchQuery?: string;
  sortMode?: string;
}

export function UnilevelOrgChart({ root, maxLevel, onSelectMember, searchQuery, sortMode = "default" }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set([root.id]));
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const levelCounts = useMemo(() => countByLevel(root), [root]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectNode = useCallback((node: UnilevelNode) => {
    setSelectedId(prev => prev === node.id ? null : node.id);
    onSelectMember(node);
  }, [onSelectMember]);

  // Auto-expand path when searchQuery changes
  useEffect(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) {
      setHighlightedId(null);
      return;
    }
    let path = findPathToId(root, q);
    if (!path) path = findPathByName(root, q);
    if (path && path.length > 1) {
      setExpandedIds(prev => {
        const next = new Set(prev);
        path!.forEach(id => next.add(id));
        return next;
      });
      setHighlightedId(path[path.length - 1]);
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }, 100);
    } else if (path && path.length === 1) {
      setHighlightedId(path[0]);
    } else {
      setHighlightedId(null);
    }
  }, [searchQuery, root]);

  return (
    <div className="w-full">
      <div className="flex">
        {/* Level labels column */}
        <div className="shrink-0" style={{ width: LEVEL_LABEL_W }}>
          {/* Root row label */}
          <div className="flex flex-col items-center justify-center text-[10px] text-muted-foreground" style={{ height: ROW_HEIGHT }}>
            <span className="font-semibold text-foreground text-[10px]">Você</span>
          </div>
          {/* Levels 1-10 */}
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => {
            const lvl = i + 1;
            const count = levelCounts.get(lvl) || 0;
            const isActive = lvl <= maxLevel;
            return (
              <div
                key={lvl}
                className={cn(
                  "flex flex-col items-center justify-center text-[10px] border-t border-border/30",
                  isActive ? "text-muted-foreground" : "text-muted-foreground/30"
                )}
                style={{ height: ROW_HEIGHT }}
              >
                <span className={cn("font-semibold text-[10px]", isActive ? "text-foreground" : "text-muted-foreground/40")}>
                  N{lvl}
                </span>
                {lvl === 1 && (
                  <span className="text-[8px] text-muted-foreground leading-none">DIRETOS</span>
                )}
                <span className="text-[9px]">
                  {count > 0 ? (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 mt-0.5">
                      {count} {count === 1 ? "pessoa" : "pessoas"}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground/30">—</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tree content */}
        <div className="flex-1 overflow-hidden">
          <div className="min-w-[300px] relative">
            {/* Root row */}
            <div className="flex justify-center" style={{ height: ROW_HEIGHT }}>
              <NodeCard
                node={root}
                isRoot
                isExpanded={expandedIds.has(root.id)}
                onToggle={() => toggleExpand(root.id)}
                onSelect={() => handleSelectNode(root)}
                hasChildren={!!(root.children && root.children.length > 0)}
                isHighlighted={highlightedId === root.id}
                isSelected={selectedId === root.id}
                highlightRef={highlightedId === root.id ? highlightRef : undefined}
              />
            </div>

            {/* Level rows */}
            {Array.from({ length: TOTAL_LEVELS }, (_, i) => {
              const lvl = i + 1;
              const isActive = lvl <= maxLevel;
              return (
                <div key={lvl} className="border-t border-border/30" style={{ minHeight: ROW_HEIGHT }}>
                  {isActive ? (
                    <LevelRow
                      root={root}
                      targetLevel={lvl}
                      currentLevel={0}
                      expandedIds={expandedIds}
                      onToggle={toggleExpand}
                      onSelect={handleSelectNode}
                      highlightedId={highlightedId}
                      selectedId={selectedId}
                      highlightRef={highlightRef}
                      maxLevel={maxLevel}
                      sortMode={sortMode as SortMode}
                    />
                  ) : (
                    <div className="flex items-center justify-center text-[10px] text-muted-foreground/30" style={{ height: ROW_HEIGHT }}>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Qualifique-se para desbloquear
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── LevelRow with horizontal chevron scroll ── */

function LevelRow({
  root, targetLevel, currentLevel, expandedIds, onToggle, onSelect,
  highlightedId, selectedId, highlightRef, maxLevel, sortMode,
}: {
  root: UnilevelNode;
  targetLevel: number;
  currentLevel: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (n: UnilevelNode) => void;
  highlightedId: string | null;
  selectedId: string | null;
  highlightRef: React.RefObject<HTMLDivElement>;
  maxLevel: number;
  sortMode: SortMode;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const nodes = useMemo(() => {
    const collected = collectNodesAtLevel(root, currentLevel, targetLevel, expandedIds);
    return sortNodes(collected, sortMode);
  }, [root, currentLevel, targetLevel, expandedIds, sortMode]);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
  }, [checkScroll, nodes]);

  const scrollBy = (dir: number) => {
    scrollContainerRef.current?.scrollBy({ left: dir * SCROLL_AMOUNT, behavior: "smooth" });
  };

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center text-[10px] text-muted-foreground/40" style={{ height: ROW_HEIGHT }}>
        —
      </div>
    );
  }

  return (
    <div className="relative flex items-center" style={{ minHeight: ROW_HEIGHT }}>
      {/* Left chevron */}
      {canScrollLeft && (
        <button
          onClick={() => scrollBy(-1)}
          className="absolute left-0 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
      )}

      {/* Scrollable container — no wrapping */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide mx-1"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex items-start gap-1 py-2 px-4 w-max">
          {nodes.map((node) => {
            const hasChildren = !!(node.children && node.children.length > 0);
            const canExpand = hasChildren && targetLevel < maxLevel;
            return (
              <NodeCard
                key={node.id}
                node={node}
                isExpanded={expandedIds.has(node.id)}
                onToggle={() => onToggle(node.id)}
                onSelect={() => onSelect(node)}
                hasChildren={canExpand}
                isHighlighted={highlightedId === node.id}
                isSelected={selectedId === node.id}
                highlightRef={highlightedId === node.id ? highlightRef : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Right chevron */}
      {canScrollRight && (
        <button
          onClick={() => scrollBy(1)}
          className="absolute right-0 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-accent transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      )}
    </div>
  );
}

/* ── NodeCard ── */

function NodeCard({
  node, isRoot, isExpanded, onToggle, onSelect, hasChildren,
  isHighlighted, isSelected, highlightRef,
}: {
  node: UnilevelNode;
  isRoot?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  hasChildren: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
  highlightRef?: React.RefObject<HTMLDivElement>;
}) {
  const q = qualificationConfig[node.qualification] ?? qualificationConfig.consultor;
  const firstName = node.name.split(" ")[0];
  const directCount = countDirectChildren(node);

  return (
    <div className="flex flex-col items-center" style={{ width: NODE_W }}>
      {/* Card */}
      <div
        ref={highlightRef as any}
        onClick={onSelect}
        className={cn(
          "w-full rounded-lg border bg-card p-1.5 cursor-pointer transition-all hover:shadow-md",
          isSelected && "border-primary ring-2 ring-primary/30",
          isHighlighted && !isSelected && "border-primary/60 bg-primary/5",
          !isSelected && !isHighlighted && "border-border",
        )}
      >
        {/* ID — highlighted */}
        <p className={cn(
          "text-[11px] font-bold text-center leading-tight",
          isRoot ? "text-primary" : "text-foreground"
        )}>
          {isRoot ? `ID ${node.id} (Eu)` : `ID ${node.id}`}
        </p>

        {/* Name */}
        <p className="text-[10px] text-muted-foreground text-center leading-tight truncate mt-0.5">
          {firstName}
        </p>

        {/* Qualification */}
        <p className="text-[9px] text-muted-foreground text-center leading-none mt-0.5">
          {q.label}
        </p>

        {/* Direct count */}
        <p className="text-[9px] text-muted-foreground text-center mt-0.5">
          {directCount} {directCount === 1 ? "direto" : "diretos"}
        </p>
      </div>

      {/* Expand/collapse square button */}
      {hasChildren && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={cn(
            "mt-1 flex items-center justify-center rounded border transition-colors",
            "h-5 w-5",
            isExpanded
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
          )}
          title={isExpanded ? "Recolher" : "Expandir rede"}
        >
          {isExpanded ? (
            <Minus className="h-3 w-3" />
          ) : (
            <Plus className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  );
}

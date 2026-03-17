import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { qualificationConfig, NetworkMember } from "./mock-data";
import { UnilevelNode } from "./unilevel-mock-data";
import { Badge } from "@/components/ui/badge";

/* ── Constants ── */
const TOTAL_LEVELS = 10;
const NODE_H = 88;        // height of each node box
const ROW_GAP = 24;        // vertical gap between rows
const ROW_HEIGHT = NODE_H + ROW_GAP;
const NODE_W = 110;        // width of each node column
const LEVEL_LABEL_W = 80;  // width of the left level labels column
const CONNECTOR_COLOR = "hsl(var(--border))";

/* ── Helpers ── */

/** Find the path of IDs from root to a target ID */
function findPathToId(node: UnilevelNode, targetId: string): string[] | null {
  if (node.id.toLowerCase() === targetId.toLowerCase()) return [node.id];
  if (!node.children) return null;
  for (const child of node.children) {
    const path = findPathToId(child, targetId);
    if (path) return [node.id, ...path];
  }
  return null;
}

/** Find path by name match */
function findPathByName(node: UnilevelNode, query: string): string[] | null {
  if (node.name.toLowerCase().includes(query)) return [node.id];
  if (!node.children) return null;
  for (const child of node.children) {
    const path = findPathByName(child, query);
    if (path) return [node.id, ...path];
  }
  return null;
}

/** Count members at each level */
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

/* ── Props ── */
interface Props {
  root: UnilevelNode;
  maxLevel: number;
  onSelectMember: (member: NetworkMember) => void;
  searchQuery?: string;
}

export function UnilevelOrgChart({ root, maxLevel, onSelectMember, searchQuery }: Props) {
  // Track which nodes are expanded by ID
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set([root.id]));
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const levelCounts = useMemo(() => countByLevel(root), [root]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Auto-expand path when searchQuery changes
  useEffect(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) {
      setHighlightedId(null);
      return;
    }

    // Try by ID first, then by name
    let path = findPathToId(root, q);
    if (!path) path = findPathByName(root, q);

    if (path && path.length > 1) {
      setExpandedIds(prev => {
        const next = new Set(prev);
        // Expand all nodes along the path (except the last which is the target)
        path!.forEach(id => next.add(id));
        return next;
      });
      setHighlightedId(path[path.length - 1]);

      // Scroll to the highlighted node after render
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
          <div
            className="flex flex-col items-center justify-center text-[10px] text-muted-foreground"
            style={{ height: ROW_HEIGHT }}
          >
            <span className="font-semibold text-foreground text-[11px]">Raiz</span>
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
                <span className={cn("font-semibold", isActive ? "text-foreground" : "text-muted-foreground/40")}>
                  Nível {lvl}
                </span>
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

        {/* Tree content - scrollable */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="min-w-[300px] relative">
            {/* Root row */}
            <div className="flex justify-center" style={{ height: ROW_HEIGHT }}>
              <TreeNode
                node={root}
                isRoot
                isExpanded={expandedIds.has(root.id)}
                onToggle={() => toggleExpand(root.id)}
                onSelect={onSelectMember}
                hasChildren={!!(root.children && root.children.length > 0)}
                isHighlighted={highlightedId === root.id}
                highlightRef={highlightedId === root.id ? highlightRef : undefined}
              />
            </div>

            {/* Level rows */}
            {Array.from({ length: TOTAL_LEVELS }, (_, i) => {
              const lvl = i + 1;
              const isActive = lvl <= maxLevel;
              return (
                <div
                  key={lvl}
                  className="border-t border-border/30"
                  style={{ minHeight: ROW_HEIGHT }}
                >
                  {isActive ? (
                    <LevelRow
                      root={root}
                      targetLevel={lvl}
                      currentLevel={0}
                      expandedIds={expandedIds}
                      onToggle={toggleExpand}
                      onSelect={onSelectMember}
                      highlightedId={highlightedId}
                      highlightRef={highlightRef}
                      maxLevel={maxLevel}
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

/* ── LevelRow: collects visible nodes at a given level ── */

function LevelRow({
  root,
  targetLevel,
  currentLevel,
  expandedIds,
  onToggle,
  onSelect,
  highlightedId,
  highlightRef,
  maxLevel,
}: {
  root: UnilevelNode;
  targetLevel: number;
  currentLevel: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (m: NetworkMember) => void;
  highlightedId: string | null;
  highlightRef: React.RefObject<HTMLDivElement>;
  maxLevel: number;
}) {
  const nodes = useMemo(() => {
    return collectNodesAtLevel(root, currentLevel, targetLevel, expandedIds);
  }, [root, currentLevel, targetLevel, expandedIds]);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center text-[10px] text-muted-foreground/40" style={{ height: ROW_HEIGHT }}>
        —
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-start justify-center gap-1 py-2" style={{ minHeight: ROW_HEIGHT }}>
      {nodes.map((node) => {
        const hasChildren = !!(node.children && node.children.length > 0);
        const canExpand = hasChildren && targetLevel < maxLevel;
        return (
          <TreeNode
            key={node.id}
            node={node}
            isExpanded={expandedIds.has(node.id)}
            onToggle={() => onToggle(node.id)}
            onSelect={onSelect}
            hasChildren={canExpand}
            isHighlighted={highlightedId === node.id}
            highlightRef={highlightedId === node.id ? highlightRef : undefined}
            isDirect={targetLevel === 1}
          />
        );
      })}
    </div>
  );
}

/** Collect nodes that should be visible at a given target level, respecting expand state */
function collectNodesAtLevel(
  node: UnilevelNode,
  currentLevel: number,
  targetLevel: number,
  expandedIds: Set<string>
): UnilevelNode[] {
  if (currentLevel + 1 === targetLevel) {
    // This node's children are at the target level
    if (expandedIds.has(node.id) && node.children) {
      return node.children;
    }
    return [];
  }

  // Go deeper only through expanded nodes
  if (!expandedIds.has(node.id) || !node.children) return [];

  const result: UnilevelNode[] = [];
  for (const child of node.children) {
    result.push(...collectNodesAtLevel(child, currentLevel + 1, targetLevel, expandedIds));
  }
  return result;
}

/* ── TreeNode: circle avatar + info ── */

function TreeNode({
  node,
  isRoot,
  isExpanded,
  onToggle,
  onSelect,
  hasChildren,
  isHighlighted,
  highlightRef,
  isDirect,
}: {
  node: UnilevelNode;
  isRoot?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (m: NetworkMember) => void;
  hasChildren: boolean;
  isHighlighted: boolean;
  highlightRef?: React.RefObject<HTMLDivElement>;
  isDirect?: boolean;
}) {
  const q = qualificationConfig[node.qualification] ?? qualificationConfig.consultor;
  const initial = node.name.charAt(0).toUpperCase();
  const firstName = node.name.split(" ")[0];

  return (
    <div
      ref={highlightRef as any}
      className={cn(
        "flex flex-col items-center px-1 py-1 rounded-lg transition-all",
        isHighlighted && "bg-primary/10 ring-2 ring-primary/40",
      )}
      style={{ width: NODE_W }}
    >
      {/* Circle avatar */}
      <button
        onClick={() => onSelect(node)}
        className="flex flex-col items-center gap-0.5 transition-all cursor-pointer group"
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-full font-bold transition-shadow group-hover:shadow-md",
            isRoot
              ? "h-11 w-11 text-sm bg-primary text-primary-foreground"
              : isDirect
                ? "h-9 w-9 text-xs bg-primary/15 text-primary"
                : "h-9 w-9 text-xs bg-muted text-foreground"
          )}
        >
          {initial}
        </div>

        {/* Name */}
        <span className="text-[11px] font-semibold text-foreground mt-0.5 max-w-[100px] truncate leading-tight">
          {firstName}{isRoot ? " (Eu)" : ""}
        </span>

        {/* ID */}
        <span className="text-[10px] text-muted-foreground leading-none">
          ID {node.id}
        </span>

        {/* Qualification */}
        <span className="text-[10px] text-muted-foreground leading-none">
          {q.label}
        </span>
      </button>

      {/* Expand/collapse button */}
      {hasChildren && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={cn(
            "mt-0.5 flex items-center justify-center rounded-full transition-colors",
            "h-5 w-5 hover:bg-accent",
            isExpanded ? "text-primary" : "text-muted-foreground"
          )}
          title={isExpanded ? "Recolher" : "Expandir rede"}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      )}

      {/* Active indicator */}
      <div className={cn(
        "h-1.5 w-1.5 rounded-full mt-0.5",
        node.active ? "bg-success" : "bg-destructive"
      )} />
    </div>
  );
}

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Users, Plus, Minus, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { qualificationConfig } from "./mock-data";
import { UnilevelNode } from "./unilevel-mock-data";
import { Badge } from "@/components/ui/badge";

/* ── Constants ── */
const TOTAL_LEVELS = 10;
const ROW_H = 120;
const NODE_W = 90;
const CARD_GAP = 8;
const LEVEL_LABEL_W = 46;

/* Vertical geometry inside each row */
const CARD_PAD_Y = 14;
const CARD_BODY_H = 68;
const EXPAND_BTN_H = 24; // mt-1 (4) + h-5 (20)

/* Connector styling — same as binary tree */
const CONN_COLOR = "hsl(var(--border))";
const CONN_W = 1.5;

/* ── Sort ── */
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

/* ── Tree helpers ── */

function findSiblingIds(root: UnilevelNode, targetId: string): string[] | null {
  if (!root.children) return null;
  for (const child of root.children) {
    if (child.id === targetId) return root.children.map(c => c.id);
    const found = findSiblingIds(child, targetId);
    if (found) return found;
  }
  return null;
}

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
    childMap.forEach((count, l) => map.set(l, (map.get(l) || 0) + count));
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
    if (expandedIds.has(node.id) && node.children) return node.children;
    return [];
  }
  if (!expandedIds.has(node.id) || !node.children) return [];
  const result: UnilevelNode[] = [];
  for (const child of node.children) {
    result.push(...collectNodesAtLevel(child, currentLevel + 1, targetLevel, expandedIds));
  }
  return result;
}

/* ── Level info for rendering ── */
interface LevelInfo {
  nodes: UnilevelNode[];
  anchorIdx: number; // index of expanded node (centering anchor), or -1
  translateX: number;
}

/* ── Props ── */
interface Props {
  root: UnilevelNode;
  maxLevel: number;
  searchQuery?: string;
  sortMode?: string;
}

export function UnilevelOrgChart({ root, maxLevel, searchQuery, sortMode = "default" }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set([root.id]));
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  /* ── Drag-to-pan state ── */
  const [dragOffset, setDragOffset] = useState(0);
  const dragState = useRef<{ active: boolean; startX: number; startOffset: number; moved: boolean }>({
    active: false, startX: 0, startOffset: 0, moved: false,
  });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only primary button (mouse) or touch
    if (e.button !== 0) return;
    dragState.current = { active: true, startX: e.clientX, startOffset: dragOffset, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    (e.currentTarget as HTMLElement).style.cursor = "grabbing";
  }, [dragOffset]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.active) return;
    const dx = e.clientX - dragState.current.startX;
    if (Math.abs(dx) > 3) dragState.current.moved = true;
    setDragOffset(dragState.current.startOffset + dx);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.active) return;
    dragState.current.active = false;
    (e.currentTarget as HTMLElement).style.cursor = "grab";
  }, []);

  // Reset drag offset when expanding/collapsing
  useEffect(() => { setDragOffset(0); }, [expandedIds]);

  const levelCounts = useMemo(() => countByLevel(root), [root]);

  const toggleExpand = useCallback((id: string) => {
    if (id === root.id) return;
    // Ignore if user was dragging
    if (dragState.current.moved) return;
    const siblingIds = findSiblingIds(root, id);
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (siblingIds) siblingIds.forEach(sid => next.delete(sid));
        next.add(id);
      }
      return next;
    });
  }, [root]);

  // Search: auto-expand path
  useEffect(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) { setHighlightedId(null); return; }
    let path = findPathToId(root, q);
    if (!path) path = findPathByName(root, q);
    if (path && path.length > 1) {
      setExpandedIds(prev => { const next = new Set(prev); path!.forEach(id => next.add(id)); return next; });
      setHighlightedId(path[path.length - 1]);
      setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" }), 100);
    } else if (path?.length === 1) {
      setHighlightedId(path[0]);
    } else {
      setHighlightedId(null);
    }
  }, [searchQuery, root]);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Compute level data (nodes, anchor, translateX) ── */
  const levelData = useMemo(() => {
    if (containerWidth === 0) return [];
    const cx = containerWidth / 2;
    const data: LevelInfo[] = [];

    // Level 0 = root (always centered)
    data.push({ nodes: [root], anchorIdx: 0, translateX: cx - NODE_W / 2 });

    for (let lvl = 1; lvl <= TOTAL_LEVELS; lvl++) {
      const nodes = sortNodes(collectNodesAtLevel(root, 0, lvl, expandedIds), sortMode as SortMode);
      const anchorIdx = nodes.findIndex(n => expandedIds.has(n.id));
      let tx: number;
      if (nodes.length === 0) {
        tx = 0;
      } else if (anchorIdx >= 0) {
        tx = cx - (anchorIdx * (NODE_W + CARD_GAP) + NODE_W / 2);
      } else {
        const contentW = nodes.length * NODE_W + Math.max(0, nodes.length - 1) * CARD_GAP;
        tx = cx - contentW / 2;
      }
      data.push({ nodes, anchorIdx, translateX: tx });
    }
    return data;
  }, [root, expandedIds, containerWidth, sortMode]);

  /* ── Compute SVG connectors ── */
  const connectors = useMemo(() => {
    if (levelData.length === 0) return [];
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

    for (let lvl = 1; lvl <= TOTAL_LEVELS; lvl++) {
      const childInfo = levelData[lvl];
      if (!childInfo || childInfo.nodes.length === 0) continue;

      const parentInfo = levelData[lvl - 1];
      // Find expanded parent index in the parent level
      let pIdx: number;
      if (lvl === 1) {
        pIdx = 0; // root
      } else {
        pIdx = parentInfo.nodes.findIndex(n => expandedIds.has(n.id));
        if (pIdx < 0) continue;
      }

      // Parent center X
      const parentCX = parentInfo.translateX + pIdx * (NODE_W + CARD_GAP) + NODE_W / 2;

      // Parent exit Y (below card body + expand button; root has no button)
      const parentRowY = (lvl - 1) * ROW_H;
      const parentExitY = parentRowY + CARD_PAD_Y + CARD_BODY_H + (lvl === 1 ? 0 : EXPAND_BTN_H);

      // Child entry Y (top of card)
      const childRowY = lvl * ROW_H;
      const childEntryY = childRowY + CARD_PAD_Y;

      // Midpoint for horizontal connector
      const midY = (parentExitY + childEntryY) / 2;

      // Parent vertical down to midY
      lines.push({ x1: parentCX, y1: parentExitY, x2: parentCX, y2: midY });

      if (childInfo.nodes.length === 1) {
        // Single child → continuous vertical (no horizontal bar)
        const childCX = childInfo.translateX + NODE_W / 2;
        // If parent and child aren't aligned, add horizontal segment
        if (Math.abs(parentCX - childCX) > 1) {
          lines.push({ x1: parentCX, y1: midY, x2: childCX, y2: midY });
        }
        lines.push({ x1: childCX, y1: midY, x2: childCX, y2: childEntryY });
      } else {
        // Multiple children → horizontal bar + vertical stubs
        const firstCX = childInfo.translateX + NODE_W / 2;
        const lastCX = childInfo.translateX + (childInfo.nodes.length - 1) * (NODE_W + CARD_GAP) + NODE_W / 2;

        // Extend horizontal bar to include parent connection point if needed
        const hLeft = Math.min(firstCX, parentCX);
        const hRight = Math.max(lastCX, parentCX);
        lines.push({ x1: hLeft, y1: midY, x2: hRight, y2: midY });

        // Vertical stub from each child up to horizontal bar
        for (let i = 0; i < childInfo.nodes.length; i++) {
          const cx = childInfo.translateX + i * (NODE_W + CARD_GAP) + NODE_W / 2;
          lines.push({ x1: cx, y1: midY, x2: cx, y2: childEntryY });
        }
      }
    }
    return lines;
  }, [levelData, expandedIds]);

  const totalH = (TOTAL_LEVELS + 1) * ROW_H;

  return (
    <div className="w-full">
      <div className="flex">
        {/* ── Level labels column ── */}
        <div className="shrink-0 px-0.5" style={{ width: LEVEL_LABEL_W }}>
          <div className="flex flex-col items-center justify-center text-[10px] text-muted-foreground" style={{ height: ROW_H }}>
            <span className="font-semibold text-foreground text-[10px]">Você</span>
          </div>
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
                style={{ height: ROW_H }}
              >
                <span className={cn("font-semibold text-[9px] leading-tight", isActive ? "text-foreground" : "text-muted-foreground/40")}>
                  Nível {lvl}
                </span>
                {lvl === 1 && <span className="text-[8px] text-muted-foreground leading-none">DIRETOS</span>}
                {count > 0 && (
                  <Badge variant="secondary" className={cn("text-[9px] px-1.5 py-0 h-4 mt-0.5", !isActive && "opacity-50")}>
                    {!isActive && <Lock className="h-2.5 w-2.5 mr-0.5" />}
                    {count}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Tree content area ── */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden relative select-none"
          style={{ height: totalH, cursor: "grab", touchAction: "pan-y" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {containerWidth > 0 && levelData.length > 0 && (
            <>
              {/* SVG connector overlay */}
              <svg
                className="absolute inset-0 pointer-events-none z-[1]"
                width={containerWidth}
                height={totalH}
              >
                {connectors.map((c, i) => (
                  <line
                    key={i}
                    x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                    stroke={CONN_COLOR}
                    strokeWidth={CONN_W}
                  />
                ))}
              </svg>

              {/* Root row (level 0) */}
              <div className="absolute left-0 right-0 z-[2]" style={{ top: 0, height: ROW_H }}>
                <div
                  className="transition-transform duration-300 ease-out"
                  style={{ paddingTop: CARD_PAD_Y, transform: `translateX(${levelData[0].translateX}px)` }}
                >
                  <div className="flex" style={{ gap: CARD_GAP }}>
                    <NodeCard
                      node={root}
                      isRoot
                      isExpanded
                      onToggle={() => {}}
                      hasChildren={!!(root.children?.length)}
                      isHighlighted={highlightedId === root.id}
                      highlightRef={highlightedId === root.id ? highlightRef : undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Level rows 1–10 */}
              {Array.from({ length: TOTAL_LEVELS }, (_, i) => {
                const lvl = i + 1;
                const isActive = lvl <= maxLevel;
                const info = levelData[lvl];
                const hasNodes = info.nodes.length > 0;
                const hasAnyData = (levelCounts.get(lvl) || 0) > 0;

                return (
                  <div
                    key={lvl}
                    className="absolute left-0 right-0 border-t border-border/30 z-[2]"
                    style={{ top: lvl * ROW_H, height: ROW_H }}
                  >
                    {hasNodes ? (
                      <div
                        className="transition-transform duration-300 ease-out"
                        style={{ paddingTop: CARD_PAD_Y, transform: `translateX(${info.translateX}px)` }}
                      >
                        <div className="flex" style={{ gap: CARD_GAP }}>
                          {info.nodes.map(node => {
                            const hasChildren = !!(node.children?.length);
                            const canExpand = hasChildren && lvl < TOTAL_LEVELS;
                            return !isActive ? (
                              <LockedNodeCard
                                key={node.id}
                                node={node}
                                hasChildren={canExpand}
                                isExpanded={expandedIds.has(node.id)}
                                onToggle={() => toggleExpand(node.id)}
                              />
                            ) : (
                              <NodeCard
                                key={node.id}
                                node={node}
                                isExpanded={expandedIds.has(node.id)}
                                onToggle={() => toggleExpand(node.id)}
                                hasChildren={canExpand}
                                isHighlighted={highlightedId === node.id}
                                highlightRef={highlightedId === node.id ? highlightRef : undefined}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ) : !isActive && !hasAnyData ? (
                      <div className="flex items-center justify-center text-[10px] text-muted-foreground/30 h-full">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Qualifique-se para desbloquear
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── NodeCard ── */

function NodeCard({
  node, isRoot, isExpanded, onToggle, hasChildren,
  isHighlighted, highlightRef,
}: {
  node: UnilevelNode;
  isRoot?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  hasChildren: boolean;
  isHighlighted: boolean;
  highlightRef?: React.RefObject<HTMLDivElement>;
}) {
  const q = qualificationConfig[node.qualification] ?? qualificationConfig.consultor;
  const firstName = node.name.split(" ")[0];
  const directCount = countDirectChildren(node);

  return (
    <div className="flex flex-col items-center shrink-0" style={{ width: NODE_W }}>
      <div
        ref={highlightRef as any}
        onClick={!isRoot && hasChildren ? onToggle : undefined}
        className={cn(
          "w-full rounded-lg p-1.5 transition-all",
          isRoot
            ? "bg-primary text-primary-foreground border-none"
            : [
                "border bg-card",
                hasChildren && "cursor-pointer hover:shadow-md",
                isExpanded && hasChildren && "border-primary ring-2 ring-primary/30",
                isHighlighted && !isExpanded && "border-primary/60 bg-primary/5",
                !isExpanded && !isHighlighted && "border-border",
              ],
        )}
      >
        <p className={cn("text-[11px] font-bold text-center leading-tight", isRoot ? "text-primary-foreground" : "text-foreground")}>
          {node.id}
        </p>
        <p className={cn("text-[10px] text-center leading-tight truncate mt-0.5", isRoot ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {firstName}
        </p>
        <p className={cn("text-[9px] text-center leading-none mt-0.5", isRoot ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {q.label}
        </p>
        <p className={cn("text-[9px] text-center mt-0.5", isRoot ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {directCount} {directCount === 1 ? "direto" : "diretos"}
        </p>
      </div>

      {!isRoot && hasChildren && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={cn(
            "mt-1 flex items-center justify-center rounded border transition-colors h-5 w-5",
            isExpanded
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
          )}
          title={isExpanded ? "Recolher" : "Expandir rede"}
        >
          {isExpanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </button>
      )}
    </div>
  );
}

/* ── LockedNodeCard ── */

function LockedNodeCard({ node, hasChildren = false, isExpanded = false, onToggle }: {
  node: UnilevelNode;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  const q = qualificationConfig[node.qualification] ?? qualificationConfig.consultor;
  const firstName = node.name.split(" ")[0];
  const directCount = countDirectChildren(node);

  return (
    <div className="flex flex-col items-center shrink-0" style={{ width: NODE_W }}>
      <div
        onClick={hasChildren ? onToggle : undefined}
        className={cn(
          "w-full rounded-lg border border-border/40 bg-muted/30 p-1.5 opacity-50 select-none relative",
          hasChildren && "cursor-pointer hover:opacity-70",
          isExpanded && hasChildren && "ring-2 ring-muted-foreground/20"
        )}
      >
        <p className="text-[11px] font-bold text-center leading-tight text-muted-foreground/60">{node.id}</p>
        <p className="text-[10px] text-muted-foreground/40 text-center leading-tight truncate mt-0.5">{firstName}</p>
        <p className="text-[9px] text-muted-foreground/40 text-center leading-none mt-0.5">{q.label}</p>
        <p className="text-[9px] text-muted-foreground/40 text-center mt-0.5">
          {directCount} {directCount === 1 ? "direto" : "diretos"}
        </p>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-full bg-background/80 border border-border p-1">
            <Lock className="h-3 w-3 text-muted-foreground/60" />
          </div>
        </div>
      </div>
      {hasChildren && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
          className={cn(
            "mt-1 flex items-center justify-center rounded border transition-colors h-5 w-5 opacity-50",
            isExpanded
              ? "bg-muted-foreground/30 text-background border-muted-foreground/30"
              : "bg-background text-muted-foreground/40 border-border/40 hover:opacity-70"
          )}
        >
          {isExpanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </button>
      )}
    </div>
  );
}

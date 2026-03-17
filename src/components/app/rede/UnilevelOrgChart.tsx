import { useState, useCallback } from "react";
import { ChevronDown, ChevronRight, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { qualificationConfig, NetworkMember } from "./mock-data";
import { UnilevelNode } from "./unilevel-mock-data";

interface Props {
  root: UnilevelNode;
  maxLevel: number;
  onSelectMember: (member: NetworkMember) => void;
}

export function UnilevelOrgChart({ root, maxLevel, onSelectMember }: Props) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[260px]">
        <OrgNode node={root} level={0} maxLevel={maxLevel} onSelect={onSelectMember} isRoot />
      </div>
    </div>
  );
}

function OrgNode({
  node,
  level,
  maxLevel,
  onSelect,
  isRoot,
  isDirect,
}: {
  node: UnilevelNode;
  level: number;
  maxLevel: number;
  onSelect: (member: NetworkMember) => void;
  isRoot?: boolean;
  isDirect?: boolean;
}) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = !!(node.children && node.children.length > 0);
  const canExpand = hasChildren && level < maxLevel;
  const q = qualificationConfig[node.qualification] ?? qualificationConfig.consultor;
  const firstName = node.name.split(" ")[0];

  const toggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((p) => !p);
  }, []);

  return (
    <div className={cn("ml-0", level > 0 && "ml-4 sm:ml-6")}>
      {/* Node row */}
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors cursor-pointer hover:bg-accent/40 group",
          isDirect && "bg-primary/[0.03]"
        )}
        onClick={() => onSelect(node)}
      >
        {/* Expand toggle */}
        {canExpand ? (
          <button
            onClick={toggle}
            className="shrink-0 p-0.5 rounded hover:bg-accent"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-[18px] shrink-0" />
        )}

        {/* Avatar */}
        <div
          className={cn(
            "flex items-center justify-center rounded-full font-bold shrink-0",
            isRoot
              ? "h-9 w-9 text-xs bg-primary text-primary-foreground"
              : isDirect
                ? "h-8 w-8 text-[11px] bg-primary/15 text-primary"
                : "h-8 w-8 text-[11px] bg-muted text-foreground"
          )}
        >
          {node.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold truncate">
              {firstName}{isRoot ? " (Eu)" : ""}
            </span>
            <span style={{ color: q.color }} className="text-[11px] shrink-0" title={q.label}>
              {q.icon}
            </span>
            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", node.active ? "bg-success" : "bg-destructive")} />
          </div>
          <span className="text-[10px] text-muted-foreground leading-none">
            ID {node.id} · {node.volume.toLocaleString("pt-BR")} pts
          </span>
        </div>

        {isDirect && (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 shrink-0 border-primary/30 text-primary">
            Direto
          </Badge>
        )}
      </div>

      {/* Children */}
      {canExpand && expanded && (
        <div className="border-l border-border/50 ml-[9px] sm:ml-[9px]">
          {node.children!.map((child) => (
            <OrgNode
              key={child.id}
              node={child}
              level={level + 1}
              maxLevel={maxLevel}
              onSelect={onSelect}
              isDirect={level === 0}
            />
          ))}
          {node.children!.length === 0 && (
            <div className="flex items-center gap-2 py-1.5 px-2 ml-4 text-muted-foreground/40">
              <UserPlus className="h-3 w-3" />
              <span className="text-[10px]">Sem indicados</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

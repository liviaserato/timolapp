import { useState } from "react";
import { ChevronDown, ChevronRight, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NetworkMember, qualificationConfig } from "./mock-data";

interface Props {
  node: NetworkMember | null;
  side?: "left" | "right";
  onSelect: (member: NetworkMember) => void;
  depth?: number;
}

export function BinaryTreeNode({ node, side, onSelect, depth = 0 }: Props) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (!node) {
    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <UserPlus className="h-3.5 w-3.5" />
          <span>Vazio ({side === "left" ? "Esq." : "Dir."})</span>
        </div>
      </div>
    );
  }

  const q = qualificationConfig[node.qualification] ?? qualificationConfig.consultor;
  const hasChildren = node.left || node.right;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Node card */}
      <button
        onClick={() => onSelect(node)}
        className={cn(
          "flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left shadow-sm transition-colors hover:bg-accent/50 cursor-pointer",
          !node.active && "opacity-60"
        )}
      >
        <span style={{ color: q.color }} className="text-sm font-bold">{q.icon}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold truncate max-w-[100px]">{node.name}</span>
            <Badge variant={node.active ? "default" : "secondary"} className={cn("text-[9px] px-1 py-0 h-4", node.active && "bg-success text-success-foreground")}>
              {node.active ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground">ID {node.id} · {node.volume.toLocaleString("pt-BR")} pts</span>
        </div>
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="ml-1 rounded p-0.5 hover:bg-muted"
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
        )}
      </button>

      {/* Children */}
      {hasChildren && expanded && (
        <>
          {/* Connector line */}
          <div className="w-px h-4 bg-border" />
          <div className="flex gap-4 md:gap-8 relative">
            {/* Horizontal connector */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-border" />
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-border" />
              <BinaryTreeNode node={node.left ?? null} side="left" onSelect={onSelect} depth={depth + 1} />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-border" />
              <BinaryTreeNode node={node.right ?? null} side="right" onSelect={onSelect} depth={depth + 1} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

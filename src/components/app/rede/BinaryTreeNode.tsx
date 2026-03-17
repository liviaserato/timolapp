import { UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { NetworkMember, qualificationConfig } from "./mock-data";

interface Props {
  node: NetworkMember | null;
  side?: "left" | "right";
  onSelect: (member: NetworkMember) => void;
  isRoot?: boolean;
  hasChildren?: boolean;
}

export function BinaryTreeNode({ node, side, onSelect, isRoot, hasChildren }: Props) {
  if (!node) {
    return (
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed border-muted-foreground/20 bg-muted/20 h-16 w-16 text-muted-foreground/40">
          <UserPlus className="h-4 w-4" />
        </div>
        <span className="text-[10px] text-muted-foreground/50 mt-1">
          {side === "left" ? "Esquerda" : side === "right" ? "Direita" : "Vazio"}
        </span>
      </div>
    );
  }

  const q = qualificationConfig[node.qualification] ?? qualificationConfig.consultor;
  const initial = node.name.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => onSelect(node)}
        className={cn(
          "relative flex flex-col items-center gap-0.5 transition-all cursor-pointer group"
        )}
      >
        {/* Avatar circle */}
        <div
          className={cn(
            "flex items-center justify-center rounded-full text-sm font-bold transition-shadow group-hover:shadow-md",
            isRoot ? "h-16 w-16 text-base" : "h-14 w-14",
            node.active ? "ring-2 ring-success" : "ring-2 ring-destructive"
          )}
          style={{ backgroundColor: `${q.color}15`, color: q.color }}
        >
          {initial}
        </div>

        {/* Status dot */}
        <div
          className={cn(
            "absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-card",
            node.active ? "bg-success" : "bg-destructive"
          )}
        />

        {/* Name */}
        <span className="text-[11px] font-semibold text-foreground mt-1 max-w-[80px] truncate">
          {node.name.split(" ")[0]}
        </span>

        {/* ID */}
        <span className="text-[9px] text-muted-foreground leading-none">
          ID {node.id}
        </span>

        {/* Qualification icon */}
        <span className="text-[10px] font-medium leading-none" style={{ color: q.color }}>
          {q.icon}
        </span>
      </button>

      {/* Expand hint if node has children */}
      {hasChildren && (
        <span className="text-[9px] text-primary/60 mt-0.5">▼</span>
      )}
    </div>
  );
}

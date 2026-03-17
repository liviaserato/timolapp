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
        <div className="flex items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/20 bg-muted/10 h-12 w-12 text-muted-foreground/30">
          <UserPlus className="h-4 w-4" />
        </div>
        <span className="text-[10px] text-muted-foreground/40 mt-1">
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
        className="flex flex-col items-center gap-0.5 transition-all cursor-pointer group"
      >
        {/* Avatar */}
        <div
          className={cn(
            "flex items-center justify-center rounded-full font-bold bg-muted text-foreground transition-shadow group-hover:shadow-md",
            isRoot ? "h-14 w-14 text-base" : "h-11 w-11 text-sm"
          )}
        >
          {initial}
        </div>

        {/* Name */}
        <span className="text-[11px] font-semibold text-foreground mt-1 max-w-[90px] truncate">
          {node.name.split(" ")[0]}
        </span>

        {/* ID */}
        <span className="text-[9px] text-muted-foreground leading-none">
          ID {node.id}
        </span>

        {/* Qualification as text */}
        <span className="text-[9px] text-muted-foreground leading-none">
          {q.label}
        </span>
      </button>

      {hasChildren && (
        <span className="text-[9px] text-primary/50 mt-0.5">▼</span>
      )}
    </div>
  );
}

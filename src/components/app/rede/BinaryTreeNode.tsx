import { UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { NetworkMember, qualificationConfig } from "./mock-data";

interface Props {
  node: NetworkMember | null;
  side?: "left" | "right";
  onSelect: (member: NetworkMember) => void;
  isRoot?: boolean;
  hasChildren?: boolean;
  /** Is this the logged-in user's own node (current root at top level) */
  isMe?: boolean;
  /** Does this node belong to the same person (same document) */
  isMineAlt?: boolean;
}

export function BinaryTreeNode({ node, side, onSelect, isRoot, hasChildren, isMe, isMineAlt }: Props) {
  if (!node) {
    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/20 bg-muted/10 h-9 w-9 text-muted-foreground/30">
          <UserPlus className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] text-muted-foreground/40 mt-1">
          {side === "left" ? "Esquerda" : side === "right" ? "Direita" : "Vazio"}
        </span>
      </div>
    );
  }

  const q = qualificationConfig[node.qualification] ?? qualificationConfig.consultor;
  const initial = node.name.charAt(0).toUpperCase();
  const firstName = node.name.split(" ")[0];

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => onSelect(node)}
        className="flex flex-col items-center gap-0.5 transition-all cursor-pointer group"
        title={isMineAlt ? "Este ID pertence a você" : undefined}
        aria-label={isMineAlt ? `${node.name} — Este ID pertence a você` : undefined}
      >
        {/* Avatar */}
        <div
          className={cn(
            "flex items-center justify-center rounded-full font-bold transition-shadow group-hover:shadow-md",
            isMe
              ? "bg-primary text-primary-foreground shadow-[inset_0_0_0_3px_hsl(var(--primary)/0.3)]"
              : isMineAlt
                ? "bg-primary/15 text-primary shadow-[inset_0_0_0_2px_hsl(var(--primary)/0.4)]"
                : "bg-muted text-foreground",
            isRoot ? "h-11 w-11 text-sm" : "h-9 w-9 text-xs"
          )}
        >
          {initial}
        </div>

        {/* Name */}
        <span className="text-xs font-semibold text-foreground mt-1 max-w-[100px] truncate">
          {firstName}{isMe ? " (Eu)" : ""}
        </span>

        {/* ID */}
        <span className="text-[10px] text-muted-foreground leading-none">
          ID {node.id}
        </span>

        {/* Qualification as text */}
        <span className="text-[10px] text-muted-foreground leading-none">
          {q.label}
        </span>
      </button>

      {hasChildren && (
        <span className="text-[9px] text-primary/50 mt-0.5">▼</span>
      )}
    </div>
  );
}

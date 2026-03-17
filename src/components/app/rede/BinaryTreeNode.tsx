import { User, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { NetworkMember, qualificationConfig } from "./mock-data";

interface Props {
  node: NetworkMember | null;
  side?: "left" | "right";
  onSelect: (member: NetworkMember) => void;
}

export function BinaryTreeNode({ node, side, onSelect }: Props) {
  if (!node) {
    return (
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 px-4 py-3 text-muted-foreground/50">
          <UserPlus className="h-6 w-6" />
          <span className="text-[10px] font-medium">
            {side === "left" ? "Esquerda" : "Direita"}
          </span>
        </div>
      </div>
    );
  }

  const q = qualificationConfig[node.qualification] ?? qualificationConfig.consultor;
  const initials = node.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col items-center">
      {/* Node card */}
      <button
        onClick={() => onSelect(node)}
        className={cn(
          "flex flex-col items-center gap-1.5 rounded-xl border-2 bg-card px-4 py-3 shadow-sm transition-all hover:shadow-md cursor-pointer min-w-[100px]",
          node.active
            ? "border-success"
            : "border-destructive"
        )}
      >
        {/* Avatar circle */}
        <div
          className="flex items-center justify-center h-10 w-10 rounded-full"
          style={{ backgroundColor: `${q.color}20`, color: q.color }}
        >
          <User className="h-5 w-5" />
        </div>

        {/* Name & ID */}
        <span className="text-xs font-semibold truncate max-w-[90px] text-foreground">
          {node.name.split(" ")[0]}
        </span>
        <span className="text-[10px] text-muted-foreground leading-none">
          ID {node.id}
        </span>

        {/* Qualification badge */}
        <span
          className="text-[10px] font-medium leading-none"
          style={{ color: q.color }}
        >
          {q.icon} {q.label}
        </span>

        {/* Volume */}
        <span className="text-[10px] text-muted-foreground leading-none">
          {node.volume.toLocaleString("pt-BR")} pts
        </span>
      </button>
    </div>
  );
}

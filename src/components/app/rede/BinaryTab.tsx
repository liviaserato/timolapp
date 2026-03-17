import { useState } from "react";
import { ArrowDownLeft, ArrowDownRight, Target, DollarSign, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BinaryTreeNode } from "./BinaryTreeNode";
import { MemberDetailDialog } from "./MemberDetailDialog";
import { mockBinaryTree, mockBinarySummary, NetworkMember, qualificationConfig } from "./mock-data";
import { getCurrencyConfig, formatCurrency } from "@/components/app/financeiro/currency-helpers";
import { cn } from "@/lib/utils";

/* Flatten one side of the binary tree into a list */
function flattenSide(node: NetworkMember | null | undefined): NetworkMember[] {
  if (!node) return [];
  return [node, ...flattenSide(node.left), ...flattenSide(node.right)];
}

export function BinaryTab() {
  const [selectedMember, setSelectedMember] = useState<NetworkMember | null>(null);
  const curr = getCurrencyConfig("BR", "BRL");

  const leftMembers = flattenSide(mockBinaryTree.left);
  const rightMembers = flattenSide(mockBinaryTree.right);

  const summaryItems = [
    { label: "Perna Esquerda", value: `${mockBinarySummary.leftVolume.toLocaleString("pt-BR")} pts`, icon: ArrowDownLeft, color: "text-blue-500" },
    { label: "Perna Direita", value: `${mockBinarySummary.rightVolume.toLocaleString("pt-BR")} pts`, icon: ArrowDownRight, color: "text-emerald-500" },
    { label: "Pontos Acumulados", value: `${mockBinarySummary.accumulatedPoints.toLocaleString("pt-BR")}`, icon: Target, color: "text-amber-500" },
    { label: "Bônus Estimado", value: formatCurrency(mockBinarySummary.estimatedBonus, curr), icon: DollarSign, color: "text-primary" },
  ];

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryItems.map((item) => (
          <Card key={item.label} className="overflow-hidden">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`rounded-lg bg-muted p-2 ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">{item.label}</p>
                <p className="text-sm font-bold truncate">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual binary tree — root + two children with Y connector */}
      <Card>
        <CardContent className="p-6">
          <ScrollArea className="w-full">
            <div className="flex flex-col items-center min-w-[400px] py-2">
              {/* Root node */}
              <BinaryTreeNode node={mockBinaryTree} onSelect={setSelectedMember} />

              {/* Y connector */}
              <div className="flex flex-col items-center w-full">
                {/* Vertical stem */}
                <div className="w-0.5 h-6 bg-border" />
                {/* Horizontal bar + two drops */}
                <div className="relative flex justify-center" style={{ width: 280 }}>
                  {/* Horizontal line */}
                  <div className="absolute top-0 left-[25%] right-[25%] h-0.5 bg-border" />
                  {/* Left drop */}
                  <div className="absolute top-0 left-[25%] w-0.5 h-6 bg-border" />
                  {/* Right drop */}
                  <div className="absolute top-0 right-[25%] w-0.5 h-6 bg-border" />
                </div>
              </div>

              {/* Two children */}
              <div className="flex gap-6 md:gap-12 mt-6">
                <BinaryTreeNode node={mockBinaryTree.left ?? null} side="left" onSelect={setSelectedMember} />
                <BinaryTreeNode node={mockBinaryTree.right ?? null} side="right" onSelect={setSelectedMember} />
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Leg member lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LegList
          title="Perna Esquerda"
          members={leftMembers}
          onSelect={setSelectedMember}
        />
        <LegList
          title="Perna Direita"
          members={rightMembers}
          onSelect={setSelectedMember}
        />
      </div>

      <MemberDetailDialog member={selectedMember} open={!!selectedMember} onOpenChange={(o) => !o && setSelectedMember(null)} />
    </div>
  );
}

/* ---- Leg list sub-component ---- */

function LegList({
  title,
  members,
  onSelect,
}: {
  title: string;
  members: NetworkMember[];
  onSelect: (m: NetworkMember) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {members.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center">Nenhum membro neste lado</p>
        ) : (
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
            {members.map((m) => {
              const q = qualificationConfig[m.qualification] ?? qualificationConfig.consultor;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelect(m)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg border-l-[3px] bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-accent/60 cursor-pointer",
                    m.active ? "border-l-success" : "border-l-destructive"
                  )}
                >
                  <div
                    className="flex items-center justify-center h-7 w-7 rounded-full shrink-0"
                    style={{ backgroundColor: `${q.color}20`, color: q.color }}
                  >
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold truncate">{m.name}</span>
                      <span className="text-[10px] font-medium" style={{ color: q.color }}>{q.icon}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      ID {m.id} · {m.volume.toLocaleString("pt-BR")} pts
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

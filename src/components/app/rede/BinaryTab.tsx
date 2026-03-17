import { useState } from "react";
import { ArrowDownLeft, ArrowDownRight, Target, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BinaryTreeNode } from "./BinaryTreeNode";
import { MemberDetailDialog } from "./MemberDetailDialog";
import { mockBinaryTree, mockBinarySummary, NetworkMember } from "./mock-data";
import { getCurrencyConfig, formatCurrency } from "@/components/app/financeiro/currency-helpers";

export function BinaryTab() {
  const [selectedMember, setSelectedMember] = useState<NetworkMember | null>(null);
  const curr = getCurrencyConfig("BR", "BRL");

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

      {/* Binary tree */}
      <Card>
        <CardContent className="p-4">
          <ScrollArea className="w-full">
            <div className="flex justify-center min-w-[500px] py-4">
              <BinaryTreeNode node={mockBinaryTree} onSelect={setSelectedMember} />
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      <MemberDetailDialog member={selectedMember} open={!!selectedMember} onOpenChange={(o) => !o && setSelectedMember(null)} />
    </div>
  );
}

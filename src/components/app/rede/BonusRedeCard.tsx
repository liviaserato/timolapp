import { useMemo } from "react";
import { TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { qualificationConfig } from "./mock-data";
import { UnilevelNode } from "./unilevel-mock-data";

/* ── Qualification tiers with targets and VME (40%) ── */
interface BonusTier {
  key: string;
  label: string;
  target: number;
  vmePerDirect: number;
}

const bonusTiers: BonusTier[] = [
  { key: "esmeralda", label: "Esmeralda", target: 3500, vmePerDirect: 1400 },
  { key: "rubi",      label: "Rubi",      target: 2000, vmePerDirect: 800 },
  { key: "lider",     label: "Líder",     target: 1000, vmePerDirect: 400 },
  { key: "distribuidor", label: "Distribuidor", target: 500, vmePerDirect: 200 },
  { key: "consultor", label: "Consultor", target: 200, vmePerDirect: 80 },
];

/* Tiers ordered from highest to lowest; the user can only achieve up to their own qualification */
const tierOrder = ["diamante_black", "diamante_5", "diamante_4", "diamante_3", "diamante_2", "diamante_1", "diamante", "esmeralda", "rubi", "lider", "distribuidor", "consultor"];

function getTierIndex(q: string) {
  return tierOrder.indexOf(q);
}

interface BonusRedeResult {
  achievedTier: BonusTier | null;
  cappedTotal: number;
  directsAtVme: number;
  totalDirects: number;
}

function calculateBonusRede(tree: UnilevelNode): BonusRedeResult {
  const userQual = tree.qualification;
  const userTierIdx = getTierIndex(userQual);
  const directs = tree.children ?? [];

  // Filter tiers: only those at or below user's qualification
  const eligibleTiers = bonusTiers.filter((t) => getTierIndex(t.key) >= userTierIdx);

  for (const tier of eligibleTiers) {
    const cappedPoints = directs.map((d) => Math.min(d.volume, tier.vmePerDirect));
    const total = cappedPoints.reduce((s, v) => s + v, 0);
    const directsAtVme = cappedPoints.filter((v, i) => v >= tier.vmePerDirect && directs[i].active).length;

    if (total >= tier.target) {
      return {
        achievedTier: tier,
        cappedTotal: total,
        directsAtVme,
        totalDirects: directs.length,
      };
    }
  }

  // No tier achieved
  const lowestTier = eligibleTiers[eligibleTiers.length - 1] ?? bonusTiers[bonusTiers.length - 1];
  const cappedPoints = directs.map((d) => Math.min(d.volume, lowestTier.vmePerDirect));
  const total = cappedPoints.reduce((s, v) => s + v, 0);
  return {
    achievedTier: null,
    cappedTotal: total,
    directsAtVme: 0,
    totalDirects: directs.length,
  };
}

interface BonusRedeCardProps {
  tree: UnilevelNode;
}

export function BonusRedeCard({ tree }: BonusRedeCardProps) {
  const result = useMemo(() => calculateBonusRede(tree), [tree]);
  const { achievedTier } = result;

  const userQual = tree.qualification;
  const userTierIdx = getTierIndex(userQual);
  const eligibleTiers = bonusTiers.filter((t) => getTierIndex(t.key) >= userTierIdx);
  const highestTier = eligibleTiers[0];

  // Show the achieved tier info, or the highest eligible if none achieved
  const displayTier = achievedTier ?? highestTier;
  if (!displayTier) return null;

  const achieved = !!achievedTier;
  const q = qualificationConfig[displayTier.key] ?? qualificationConfig.consultor;

  // Calculate capped total for display tier specifically
  const directs = tree.children ?? [];
  const cappedPoints = directs.map((d) => Math.min(d.volume, displayTier.vmePerDirect));
  const cappedTotal = cappedPoints.reduce((s, v) => s + v, 0);
  const directsAtVme = cappedPoints.filter((v, i) => v >= displayTier.vmePerDirect && directs[i].active).length;

  return (
    <Card className={cn(
      "col-span-2 md:col-span-4",
      achieved ? "border-success/40 bg-success/5" : "border-warning/40 bg-warning/5"
    )}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "rounded-lg p-2 shrink-0",
            achieved ? "bg-success/15" : "bg-warning/15"
          )}>
            <TrendingUp className={cn("h-5 w-5", achieved ? "text-success" : "text-warning")} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Bônus de Rede
              </p>
              {achieved ? (
                <Badge variant="outline" className="text-[10px] border-success/40 text-success bg-success/10">
                  <CheckCircle2 className="h-3 w-3 mr-0.5" /> Meta atingida
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] border-warning/40 text-warning bg-warning/10">
                  <XCircle className="h-3 w-3 mr-0.5" /> Meta não atingida
                </Badge>
              )}
            </div>

            <p className="text-lg sm:text-xl font-bold" style={{ color: q.color }}>
              {displayTier.label}
            </p>

            <p className="text-sm font-semibold text-foreground mt-0.5">
              {cappedTotal.toLocaleString("pt-BR")} / {displayTier.target.toLocaleString("pt-BR")} pontos
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
              <span className="text-[11px] text-muted-foreground">
                ({displayTier.vmePerDirect.toLocaleString("pt-BR")} máx. por direto)
              </span>
              <span className="text-[11px] text-muted-foreground">
                {directsAtVme} direto{directsAtVme !== 1 ? "s" : ""} atingiram o VME
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

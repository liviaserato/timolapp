import { useMemo } from "react";
import { TrendingUp, CheckCircle2, XCircle, Sparkles } from "lucide-react";
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

/** Extended tiers including Diamante levels — used only for potential simulation */
const allTiersForPotential: BonusTier[] = [
  { key: "diamante_black", label: "Diamante Black", target: 25000, vmePerDirect: 10000 },
  { key: "diamante_5", label: "Diamante ★★★★★", target: 20000, vmePerDirect: 8000 },
  { key: "diamante_4", label: "Diamante ★★★★", target: 16000, vmePerDirect: 6400 },
  { key: "diamante_3", label: "Diamante ★★★", target: 12000, vmePerDirect: 4800 },
  { key: "diamante_2", label: "Diamante ★★", target: 9000, vmePerDirect: 3600 },
  { key: "diamante_1", label: "Diamante ★", target: 7000, vmePerDirect: 2800 },
  { key: "diamante",   label: "Diamante", target: 5000, vmePerDirect: 2000 },
  ...bonusTiers,
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

/** Calculate the max tier the user COULD achieve if qualification wasn't a limit */
function calculatePotentialTier(tree: UnilevelNode): BonusTier | null {
  const directs = tree.children ?? [];

  for (const tier of allTiersForPotential) {
    const cappedPoints = directs.map((d) => Math.min(d.volume, tier.vmePerDirect));
    const total = cappedPoints.reduce((s, v) => s + v, 0);
    if (total >= tier.target) {
      return tier;
    }
  }
  return null;
}

interface BonusRedeCardProps {
  tree: UnilevelNode;
}

export function BonusRedeCard({ tree }: BonusRedeCardProps) {
  const result = useMemo(() => calculateBonusRede(tree), [tree]);
  const { achievedTier } = result;

  const potentialTier = useMemo(() => calculatePotentialTier(tree), [tree]);

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

  // Show potential only if it's higher than the achieved/display tier
  const showPotential = potentialTier && getTierIndex(potentialTier.key) < getTierIndex(displayTier.key);
  const potentialQ = potentialTier ? (qualificationConfig[potentialTier.key] ?? qualificationConfig.consultor) : null;

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
            <div className="flex flex-col md:flex-row md:gap-6">
              {/* Column 1 — Current result */}
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

              {/* Column 2 — Potential tier (motivational) */}
              {showPotential && potentialTier && potentialQ && (
                <>
                  <div className="hidden md:block w-px bg-border/60 self-stretch my-1" />
                  <div className="mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/60 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <p className="text-xs font-medium text-primary uppercase tracking-wide">
                        Seu potencial
                      </p>
                    </div>

                    <p className="text-lg sm:text-xl font-bold" style={{ color: potentialQ.color }}>
                      {potentialTier.label}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[280px]">
                      Pela pontuação da sua rede, você poderia receber o bônus de{" "}
                      <strong className="text-foreground">{potentialTier.label}</strong>.
                      Que tal focar em subir sua qualificação?
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Gem, Shield, TrendingUp, Crown, Check, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

import franquiaBronze from "@/assets/franquia-bronze.svg";
import franquiaPrata from "@/assets/franquia-prata.svg";
import franquiaOuro from "@/assets/franquia-ouro.svg";
import franquiaPlatina from "@/assets/franquia-platina.svg";

/* ── franchise data ── */

interface FranchiseInfo {
  id: string;
  name: string;
  icon: typeof Shield;
  image: string;
  binaryBonus: string;
  benefits: string[];
  installmentPrice: number;
  installments: number;
}

const franchises: FranchiseInfo[] = [
  {
    id: "bronze",
    name: "Bronze",
    icon: Shield,
    image: franquiaBronze,
    binaryBonus: "8%",
    installmentPrice: 160,
    installments: 12,
    benefits: [
      "Entrada ideal para começar com baixo risco",
      "Bônus Binário de 8%",
      "Acesso ao escritório digital e treinamentos",
      "Permissão para vender como consultor",
    ],
  },
  {
    id: "silver",
    name: "Prata",
    icon: TrendingUp,
    image: franquiaPrata,
    binaryBonus: "16%",
    installmentPrice: 260,
    installments: 12,
    benefits: [
      "Tudo do Bronze + mais crescimento",
      "Bônus Binário de 16%",
      "Qualificação como distribuidor e líder",
      "Descontos maiores em produtos",
    ],
  },
  {
    id: "gold",
    name: "Ouro",
    icon: Crown,
    image: franquiaOuro,
    binaryBonus: "24%",
    installmentPrice: 380,
    installments: 12,
    benefits: [
      "Tudo do Prata",
      "Bônus Binário de 24%",
      "Qualificações Rubi e Esmeralda",
      "Premiações e viagens",
    ],
  },
  {
    id: "platinum",
    name: "Platina",
    icon: Gem,
    image: franquiaPlatina,
    binaryBonus: "32% a 60%",
    installmentPrice: 675,
    installments: 12,
    benefits: [
      "Tudo do Ouro",
      "Bônus Binário de 32% a 60%",
      "Único nível que permite chegar a Diamante",
      "Maior potencial de ganhos recorrentes",
    ],
  },
];

const franchiseOrder = ["bronze", "silver", "gold", "platinum"];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground text-sm shrink-0">{label}</span>
      <span className="text-sm font-medium text-right break-words min-w-0">{value}</span>
    </div>
  );
}

/* ── props ── */

interface Props {
  franchiseId: string;
  planCode: string;
  sponsor: string;
}

export function FranchiseCard({ franchiseId, planCode, sponsor }: Props) {
  const [tabIndex, setTabIndex] = useState(() => franchiseOrder.indexOf(planCode));
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const currentFranchise = franchises.find((f) => f.id === planCode) || franchises[0];
  const viewingFranchise = franchises[tabIndex] || currentFranchise;
  const isCurrentPlan = viewingFranchise.id === planCode;
  const currentIdx = franchiseOrder.indexOf(planCode);
  const isMaxPlan = planCode === "platinum";
  const upgradeOptions = franchises.filter((_, i) => i > currentIdx);

  const handlePrev = () => setTabIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setTabIndex((i) => Math.min(franchises.length - 1, i + 1));

  return (
    <>
      <DashboardCard icon={Gem} title="Franquia">
        <div className="mt-1">
          {/* Tabs navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handlePrev}
              disabled={tabIndex === 0}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              {franchises.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => setTabIndex(i)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium transition-colors",
                    i === tabIndex
                      ? "bg-primary text-primary-foreground"
                      : i === currentIdx
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <button
              onClick={handleNext}
              disabled={tabIndex === franchises.length - 1}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Franchise details */}
          <div className="space-y-1">
            {isCurrentPlan && <Row label="ID" value={franchiseId} />}
            <Row label="Franquia" value={
              <span className="flex items-center gap-1.5">
                {viewingFranchise.name}
                {isCurrentPlan && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Atual</Badge>
                )}
              </span>
            } />
            <Row label="Bônus Binário" value={viewingFranchise.binaryBonus} />
            {isCurrentPlan && <Row label="Patrocinador" value={sponsor} />}
            {!isCurrentPlan && (
              <Row label="Parcela" value={`12x R$ ${viewingFranchise.installmentPrice},00`} />
            )}
          </div>

          {/* Benefits preview */}
          <div className="mt-2">
            <p className="text-xs font-semibold text-foreground mb-1">Benefícios</p>
            {viewingFranchise.benefits.slice(0, 3).map((b, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Check className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary/60" />
                <span>{b}</span>
              </div>
            ))}
            {viewingFranchise.benefits.length > 3 && (
              <p className="text-xs text-muted-foreground mt-0.5 ml-4.5">
                +{viewingFranchise.benefits.length - 3} mais...
              </p>
            )}
          </div>

          {/* Upgrade button */}
          {!isMaxPlan && isCurrentPlan && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-xs h-7 w-full gap-1.5"
              onClick={() => setUpgradeOpen(true)}
            >
              <ArrowUp className="h-3 w-3" />
              Fazer upgrade
            </Button>
          )}
        </div>
      </DashboardCard>

      {/* Upgrade dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upgrade de Franquia</DialogTitle>
            <DialogDescription>
              Sua franquia atual é {currentFranchise.name}. Escolha um plano superior:
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upgradeOptions.map((f) => {
              const Icon = f.icon;
              const total = f.installmentPrice * f.installments;
              return (
                <div key={f.id} className="rounded-lg border-2 border-border hover:border-primary/50 hover:shadow-md transition-all p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-6 w-6 text-primary/60" />
                    <h3 className="text-lg font-bold">{f.name}</h3>
                  </div>
                  <Separator className="mb-2" />
                  <div className="space-y-1 flex-1">
                    {f.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-2" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">12x de</p>
                    <p className="text-2xl font-extrabold text-foreground">R$ {f.installmentPrice},00</p>
                    <p className="text-xs text-muted-foreground">Total: R$ {total.toLocaleString("pt-BR")},00</p>
                  </div>
                  <Button className="mt-3 w-full" size="sm">
                    Escolher {f.name}
                  </Button>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

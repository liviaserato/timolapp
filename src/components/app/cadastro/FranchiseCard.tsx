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
import { Gem, Shield, TrendingUp, Crown, Check, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

import franquiaBronze from "@/assets/franquia-bronze.svg";
import franquiaPrata from "@/assets/franquia-prata.svg";
import franquiaOuro from "@/assets/franquia-ouro.svg";
import franquiaPlatina from "@/assets/franquia-platina.svg";

/* ── qualification icons ── */

const qualificationConfig: Record<string, { label: string; icon: string }> = {
  consultor: { label: "Consultor", icon: "○" },
  distribuidor: { label: "Distribuidor", icon: "◐" },
  lider: { label: "Líder", icon: "●" },
  rubi: { label: "Rubi", icon: "◆" },
  esmeralda: { label: "Esmeralda", icon: "◈" },
  diamante: { label: "Diamante", icon: "◇" },
  "diamante-1": { label: "Diamante ★", icon: "◇★" },
  "diamante-2": { label: "Diamante ★★", icon: "◇★★" },
  "diamante-3": { label: "Diamante ★★★", icon: "◇★★★" },
  "diamante-4": { label: "Diamante ★★★★", icon: "◇★★★★" },
  "diamante-5": { label: "Diamante ★★★★★", icon: "◇★★★★★" },
  "diamante-black": { label: "Diamante Black", icon: "◆◆" },
};

/* ── franchise plan data ── */

interface FranchisePlan {
  id: string;
  name: string;
  icon: typeof Shield;
  image: string;
  binaryBonus: string;
  benefits: string[];
  installmentPrice: number;
  installments: number;
}

const franchisePlans: FranchisePlan[] = [
  {
    id: "bronze", name: "Bronze", icon: Shield, image: franquiaBronze, binaryBonus: "8%",
    installmentPrice: 160, installments: 12,
    benefits: [
      "Entrada ideal para começar com baixo risco",
      "Bônus Binário de 8%",
      "Acesso ao escritório digital e treinamentos",
      "Permissão para vender como consultor",
    ],
  },
  {
    id: "silver", name: "Prata", icon: TrendingUp, image: franquiaPrata, binaryBonus: "16%",
    installmentPrice: 260, installments: 12,
    benefits: [
      "Tudo do Bronze + mais crescimento",
      "Bônus Binário de 16%",
      "Qualificação como distribuidor e líder",
      "Descontos maiores em produtos",
    ],
  },
  {
    id: "gold", name: "Ouro", icon: Crown, image: franquiaOuro, binaryBonus: "24%",
    installmentPrice: 380, installments: 12,
    benefits: [
      "Tudo do Prata",
      "Bônus Binário de 24%",
      "Qualificações Rubi e Esmeralda",
      "Premiações e viagens",
    ],
  },
  {
    id: "platinum", name: "Platina", icon: Gem, image: franquiaPlatina, binaryBonus: "32% a 60%",
    installmentPrice: 675, installments: 12,
    benefits: [
      "Tudo do Ouro",
      "Bônus Binário de 32% a 60%",
      "Único nível que permite chegar a Diamante",
      "Maior potencial de ganhos recorrentes",
    ],
  },
];

const planOrder = ["bronze", "silver", "gold", "platinum"];
const planLabels: Record<string, string> = { bronze: "Bronze", silver: "Prata", gold: "Ouro", platinum: "Platina" };

/* ── mock user IDs data ── */

interface UserFranchise {
  franchiseId: string;
  planCode: string;
  sponsor: string;
  registrationDate: string;
  qualification: string;
}

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
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Mock: user may have multiple IDs
  const userFranchises: UserFranchise[] = [
    { franchiseId, planCode, sponsor, registrationDate: "10/01/2025", qualification: "esmeralda" },
    { franchiseId: "200587", planCode: "silver", sponsor: "Carlos Souza (ID 88002)", registrationDate: "15/06/2025", qualification: "distribuidor" },
    { franchiseId: "300145", planCode: "bronze", sponsor: "Ana Costa (ID 77003)", registrationDate: "20/09/2025", qualification: "consultor" },
  ];

  const hasMultipleIds = userFranchises.length > 1;
  const [selectedTabIdx, setSelectedTabIdx] = useState(0);
  const viewing = userFranchises[selectedTabIdx];

  const currentPlanIdx = planOrder.indexOf(viewing.planCode);
  const isMaxPlan = viewing.planCode === "platinum";
  const upgradeOptions = franchisePlans.filter((_, i) => i > currentPlanIdx);

  const qual = qualificationConfig[viewing.qualification];

  return (
    <>
      <DashboardCard icon={Gem} title="Franquia">
        <div className="mt-1">
          {/* ID Tabs - only show if multiple IDs */}
          {hasMultipleIds && (
            <div className="flex flex-wrap gap-1 mb-3">
              {userFranchises.map((uf, i) => (
                <button
                  key={uf.franchiseId}
                  onClick={() => setSelectedTabIdx(i)}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap",
                    i === selectedTabIdx
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  ID {uf.franchiseId}
                </button>
              ))}
            </div>
          )}

          {/* Franchise data */}
          <div className="space-y-0">
            <Row label="ID" value={viewing.franchiseId} />
            <Row label="Franquia" value={
              <span className="flex items-center gap-1.5">
                {planLabels[viewing.planCode] || viewing.planCode}
                {/* Emphasize the franchise selected in header */}
                {viewing.franchiseId === franchiseId && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Ativa</Badge>
                )}
              </span>
            } />
            <Row label="Patrocinador" value={viewing.sponsor} />
            <Row label="Cadastro" value={viewing.registrationDate} />
            <Row label="Qualificação" value={
              qual ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">{qual.icon}</span>
                  {qual.label}
                </span>
              ) : viewing.qualification
            } />
          </div>

          {/* Upgrade button */}
          {!isMaxPlan && (
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
              Sua franquia atual (ID {viewing.franchiseId}) é {planLabels[viewing.planCode] || viewing.planCode}. Escolha um plano superior:
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

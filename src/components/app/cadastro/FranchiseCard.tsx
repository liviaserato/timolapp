import { useState, useRef, useEffect, useCallback } from "react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gem, ArrowUp, Plus, ChevronLeft, ChevronRight, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradeDialog } from "./UpgradeDialog";
import { NewFranchiseDialog } from "./NewFranchiseDialog";
import { useFranchise } from "@/contexts/FranchiseContext";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── franchise status helper ── */

function getFranchiseStatusInfo(activeUntil: string, t: (key: string) => string, locale: string) {
  const now = new Date();
  const expDate = new Date(activeUntil);
  const diffMs = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      level: "expired" as const,
      icon: ShieldX,
      colorClass: "text-destructive",
      bgClass: "bg-destructive/8 border-destructive/20",
      message: t("fc.expiredMsg"),
      label: `${t("fc.inactiveSince")} ${expDate.toLocaleDateString(locale)}`,
    };
  }
  if (diffDays <= 10) {
    return {
      level: "warning" as const,
      icon: ShieldAlert,
      colorClass: "text-warning",
      bgClass: "bg-warning/8 border-warning/20",
      message: t("fc.warningMsg").replace("{n}", String(diffDays)),
      label: `${t("fc.activeUntil")} ${expDate.toLocaleDateString(locale)}`,
    };
  }
  return {
    level: "active" as const,
    icon: ShieldCheck,
    colorClass: "text-success",
    bgClass: "bg-success/8 border-success/20",
    message: t("fc.activeMsg"),
    label: `${t("fc.activeUntil")} ${expDate.toLocaleDateString(locale)}`,
  };
}

/* ── qualification icons ── */

const qualificationConfig: Record<string, { labelKey: string; icon: string }> = {
  consultor: { labelKey: "qual.consultor", icon: "○" },
  distribuidor: { labelKey: "qual.distribuidor", icon: "◐" },
  lider: { labelKey: "qual.lider", icon: "●" },
  rubi: { labelKey: "qual.rubi", icon: "◆" },
  esmeralda: { labelKey: "qual.esmeralda", icon: "◈" },
  diamante: { labelKey: "qual.diamante", icon: "◇" },
  "diamante-1": { labelKey: "qual.diamante", icon: "◇★" },
  "diamante-2": { labelKey: "qual.diamante", icon: "◇★★" },
  "diamante-3": { labelKey: "qual.diamante", icon: "◇★★★" },
  "diamante-4": { labelKey: "qual.diamante", icon: "◇★★★★" },
  "diamante-5": { labelKey: "qual.diamante", icon: "◇★★★★★" },
  "diamante-black": { labelKey: "qual.diamante", icon: "◆◆" },
};

const planOrder = ["bronze", "silver", "gold", "platinum"];

/* ── mock user IDs data ── */

interface UserFranchise {
  franchiseId: string;
  planCode: string;
  sponsor: string;
  registrationDate: string;
  qualification: string;
  activeUntil: string;
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
  className?: string;
}

export function FranchiseCard({ franchiseId, planCode, sponsor, className }: Props) {
  const { t, language } = useLanguage();
  const locale = language === "pt" ? "pt-BR" : language === "es" ? "es-ES" : "en-US";
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [newFranchiseOpen, setNewFranchiseOpen] = useState(false);
  const { profiles: contextProfiles } = useFranchise();

  const planLabels: Record<string, string> = {
    bronze: t("franchise.bronze"),
    silver: t("franchise.silver"),
    gold: t("franchise.gold"),
    platinum: t("franchise.platinum"),
  };

  // Mock: user may have multiple IDs with different activity dates
  const baseFranchises: UserFranchise[] = [
    { franchiseId, planCode, sponsor, registrationDate: "10/01/2025", qualification: "esmeralda", activeUntil: "2026-07-20" },
    { franchiseId: "200587", planCode: "silver", sponsor: "Carlos Souza (ID 88002)", registrationDate: "15/06/2025", qualification: "distribuidor", activeUntil: "2026-03-18" },
    { franchiseId: "300145", planCode: "bronze", sponsor: "Ana Costa (ID 77003)", registrationDate: "20/09/2025", qualification: "consultor", activeUntil: "2026-02-01" },
    { franchiseId: "400201", planCode: "gold", sponsor: "Roberto Lima (ID 66004)", registrationDate: "01/03/2025", qualification: "lider", activeUntil: "2026-09-15" },
    { franchiseId: "500312", planCode: "platinum", sponsor: "Fernanda Dias (ID 55005)", registrationDate: "12/11/2024", qualification: "rubi", activeUntil: "2026-05-30" },
    { franchiseId: "600789", planCode: "bronze", sponsor: "João Santos (ID 44006)", registrationDate: "05/07/2025", qualification: "consultor", activeUntil: "2025-12-10" },
  ];

  // Merge dynamically added franchises from context
  const baseIds = new Set(baseFranchises.map((f) => f.franchiseId));
  const dynamicFranchises: UserFranchise[] = contextProfiles
    .filter((p) => !baseIds.has(p.franchiseId))
    .map((p) => ({
      franchiseId: p.franchiseId,
      planCode: p.planCode ?? "bronze",
      sponsor: `ID ${franchiseId}`,
      registrationDate: new Date().toLocaleDateString(locale),
      qualification: "consultor",
      activeUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }));

  const userFranchises = [...baseFranchises, ...dynamicFranchises];

  const sortedFranchises = [
    ...userFranchises.filter((f) => f.franchiseId === franchiseId),
    ...userFranchises.filter((f) => f.franchiseId !== franchiseId).sort((a, b) => a.franchiseId.localeCompare(b.franchiseId)),
  ];

  const hasMultipleIds = sortedFranchises.length > 1;
  const [selectedTabIdx, setSelectedTabIdx] = useState(0);
  const viewing = sortedFranchises[selectedTabIdx];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
  };

  const isMaxPlan = viewing.planCode === "platinum";
  const qual = qualificationConfig[viewing.qualification];

  return (
    <>
      <DashboardCard icon={Gem} title={t("fc.title")} className={className}>
        <div className="mt-1">
          {hasMultipleIds && (
            <div className="flex items-center gap-0.5 mb-3">
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  className="flex-shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={t("fc.previous")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              <div
                ref={scrollRef}
                className="flex gap-1 overflow-x-hidden flex-1 min-w-0"
              >
                {sortedFranchises.map((uf, i) => (
                  <button
                    key={uf.franchiseId}
                    onClick={() => setSelectedTabIdx(i)}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0",
                      i === selectedTabIdx
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    ID {uf.franchiseId}
                  </button>
                ))}
              </div>
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  className="flex-shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={t("fc.next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          <div className="space-y-0">
            <Row label={t("fc.id")} value={viewing.franchiseId} />
            <Row label={t("fc.franchise")} value={planLabels[viewing.planCode] || viewing.planCode} />
            <Row label={t("fc.sponsor")} value={viewing.sponsor} />
            <Row label={t("fc.registration")} value={viewing.registrationDate} />
            <Row label={t("fc.qualification")} value={
              qual ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">{qual.icon}</span>
                  {t(qual.labelKey)}
                </span>
              ) : viewing.qualification
            } />
          </div>

          {/* Franchise status alert */}
          {(() => {
            const status = getFranchiseStatusInfo(viewing.activeUntil, t, locale);
            const StatusIcon = status.icon;
            return (
              <div className={cn(
                "mt-3 flex items-start gap-2 rounded-md border p-2.5",
                status.bgClass
              )}>
                <StatusIcon className={cn("h-4 w-4 shrink-0 mt-0.5", status.colorClass)} />
                <div className="min-w-0">
                  <p className={cn("text-xs font-semibold leading-tight", status.colorClass)}>{status.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{status.message}</p>
                </div>
              </div>
            );
          })()}

          {/* Action buttons */}
          <div className={cn("mt-3 flex gap-2", isMaxPlan ? "" : "")}>
            {!isMaxPlan && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 flex-1 gap-1.5"
                onClick={() => setUpgradeOpen(true)}
              >
                <ArrowUp className="h-3 w-3" />
                {t("fc.upgrade")}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 flex-1 gap-1.5"
              onClick={() => setNewFranchiseOpen(true)}
            >
              <Plus className="h-3 w-3" />
              {t("fc.newFranchise")}
            </Button>
          </div>
        </div>
      </DashboardCard>

      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentPlanCode={viewing.planCode}
        franchiseId={viewing.franchiseId}
        userFranchises={sortedFranchises.map((f) => ({
          franchiseId: f.franchiseId,
          planCode: f.planCode,
        }))}
        isBrazilian={true}
        userName="Lívia Serato"
        userEmail="livia.serato@email.com"
      />

      <NewFranchiseDialog
        open={newFranchiseOpen}
        onOpenChange={setNewFranchiseOpen}
        userFranchises={sortedFranchises.map((f) => ({
          franchiseId: f.franchiseId,
          planCode: f.planCode,
        }))}
        isBrazilian={true}
        userName="Lívia Serato"
        userEmail="livia.serato@email.com"
      />
    </>
  );
}

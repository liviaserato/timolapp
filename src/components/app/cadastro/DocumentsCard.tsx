import { DashboardCard } from "@/components/app/DashboardCard";
import { FileText, Download } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface DocumentItem {
  id: string;
  nameKey: string;
  descKey: string;
  available: boolean;
}

const documents: DocumentItem[] = [
  { id: "contract", nameKey: "docs.franchiseContract", descKey: "docs.franchiseContractDesc", available: true },
  { id: "guide", nameKey: "docs.franchiseeGuide", descKey: "docs.franchiseeGuideDesc", available: true },
  { id: "marketing", nameKey: "docs.marketingPlan", descKey: "docs.marketingPlanDesc", available: true },
  { id: "compensation", nameKey: "docs.compensationPlan", descKey: "docs.compensationPlanDesc", available: true },
];

export function DocumentsCard({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <DashboardCard icon={FileText} title={t("docs.title")} className={className}>
      <div className="mt-2 space-y-2">
        {documents.map((doc) => (
          <div key={doc.id} className={`flex items-center gap-3 rounded-md border border-border/60 p-2.5 transition-colors ${doc.available ? "hover:bg-muted/50 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
            <FileText className="h-5 w-5 text-primary/60 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t(doc.nameKey)}</p>
              <p className="text-xs text-muted-foreground truncate">{t(doc.descKey)}</p>
            </div>
            {doc.available ? (
              <Download className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <span className="text-[10px] text-muted-foreground flex-shrink-0">{t("docs.comingSoon")}</span>
            )}
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

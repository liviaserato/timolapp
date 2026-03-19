import { Store, ExternalLink, Copy } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

export function LojaVirtualCard() {
  const { t } = useLanguage();
  const storeUrl = "https://loja.timol.com.br/franqueado123";

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    toast.success(t("rede.linkCopied"));
  };

  const handleOpen = () => {
    window.open(storeUrl, "_blank");
  };

  return (
    <DashboardCard icon={Store} title={t("clientes.virtualStore")}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-1">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">{t("clientes.personalLink")}</p>
          <div className="flex items-center gap-2 rounded-md bg-muted/50 border border-border/60 px-3 py-2">
            <span className="text-sm font-medium text-primary truncate">{storeUrl}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5" />
            {t("clientes.copy")}
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={handleOpen}>
            <ExternalLink className="h-3.5 w-3.5" />
            {t("clientes.openStore")}
          </Button>
        </div>
      </div>
    </DashboardCard>
  );
}

import { Store, ExternalLink, Copy } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LojaVirtualCard() {
  const storeUrl = "https://loja.timol.com.br/franqueado123";

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    toast.success("Link copiado!");
  };

  const handleOpen = () => {
    window.open(storeUrl, "_blank");
  };

  return (
    <DashboardCard icon={Store} title="Loja Virtual">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-1">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">Seu link personalizado para compartilhar com clientes:</p>
          <div className="flex items-center gap-2 rounded-md bg-muted/50 border border-border/60 px-3 py-2">
            <span className="text-sm font-medium text-primary truncate">{storeUrl}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5" />
            Copiar
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={handleOpen}>
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir Loja
          </Button>
        </div>
      </div>
    </DashboardCard>
  );
}

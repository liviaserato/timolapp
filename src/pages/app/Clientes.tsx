import { useState } from "react";
import { BookOpen, ShoppingBag, Users, Plus } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { MaterialApoioSection } from "@/components/app/clientes/MaterialApoioSection";
import { LojaVirtualCard } from "@/components/app/clientes/LojaVirtualCard";
import { VendasClientesSection } from "@/components/app/clientes/VendasClientesSection";
import { NovoClienteDialog } from "@/components/app/clientes/NovoClienteDialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Clientes() {
  const [novoClienteOpen, setNovoClienteOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="space-y-5 pb-8">
      <LojaVirtualCard />

      <DashboardCard icon={BookOpen} title={t("clientes.supportMaterial")}>
        <MaterialApoioSection />
      </DashboardCard>

      <DashboardCard
        icon={Users}
        title={t("clientes.salesControl")}
        headerRight={
          <Button
            size="sm"
            className="gap-1.5 rounded-full text-xs font-semibold bg-card border-2 border-app-card-border text-primary hover:bg-accent shadow-none"
            onClick={() => setNovoClienteOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            {t("clientes.newClient")}
          </Button>
        }
      >
        <VendasClientesSection onAddClient={() => setNovoClienteOpen(true)} />
      </DashboardCard>

      <NovoClienteDialog open={novoClienteOpen} onOpenChange={setNovoClienteOpen} />
    </div>
  );
}

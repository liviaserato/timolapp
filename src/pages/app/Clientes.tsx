import { useState } from "react";
import { BookOpen, ShoppingBag, Users, Plus } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { MaterialApoioSection } from "@/components/app/clientes/MaterialApoioSection";
import { LojaVirtualCard } from "@/components/app/clientes/LojaVirtualCard";
import { VendasClientesSection } from "@/components/app/clientes/VendasClientesSection";
import { NovoClienteDialog } from "@/components/app/clientes/NovoClienteDialog";
import { Button } from "@/components/ui/button";

export default function Clientes() {
  const [novoClienteOpen, setNovoClienteOpen] = useState(false);

  return (
    <div className="space-y-5 pb-8">
      {/* Loja Virtual / Catálogo */}
      <LojaVirtualCard />

      {/* Material de Apoio */}
      <DashboardCard icon={BookOpen} title="Material de Apoio">
        <MaterialApoioSection />
      </DashboardCard>

      {/* Controle de Vendas */}
      <DashboardCard
        icon={Users}
        title="Controle de Vendas"
        headerRight={
          <Button
            size="sm"
            className="gap-1.5 rounded-full text-xs font-semibold bg-card border-2 border-app-card-border text-primary hover:bg-accent shadow-none"
            onClick={() => setNovoClienteOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Novo Cliente
          </Button>
        }
      >
        <VendasClientesSection onAddClient={() => setNovoClienteOpen(true)} />
      </DashboardCard>

      <NovoClienteDialog open={novoClienteOpen} onOpenChange={setNovoClienteOpen} />
    </div>
  );
}

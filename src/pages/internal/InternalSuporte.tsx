import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { HelpCircle, Ticket, MapPin, ChevronRight } from "lucide-react";
import StaffFaqSection from "@/components/internal/suporte/StaffFaqSection";
import StaffTicketsSection from "@/components/internal/suporte/StaffTicketsSection";
import StaffOfficesSection from "@/components/internal/suporte/StaffOfficesSection";

type SuporteView = "menu" | "faq" | "chamados" | "enderecos";

const menuItems: {
  key: Exclude<SuporteView, "menu">;
  icon: typeof HelpCircle;
  title: string;
  desc: string;
}[] = [
  {
    key: "faq",
    icon: HelpCircle,
    title: "FAQ",
    desc: "Gerencie as perguntas frequentes exibidas aos franqueados, organizadas por categoria.",
  },
  {
    key: "chamados",
    icon: Ticket,
    title: "Chamados",
    desc: "Acompanhe e responda os chamados abertos pelos franqueados, com filtros por status e departamento.",
  },
  {
    key: "enderecos",
    icon: MapPin,
    title: "Nossos endereços",
    desc: "Consulte e edite os endereços dos escritórios e centros de distribuição da Timol.",
  },
];

export default function InternalSuporte() {
  const location = useLocation();
  const [view, setView] = useState<SuporteView>("menu");

  useEffect(() => {
    setView("menu");
  }, [location.key]);

  if (view !== "menu") {
    const item = menuItems.find((m) => m.key === view);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("menu")}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">{item?.title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{item?.desc}</p>
          </div>
        </div>

        {view === "faq" && <StaffFaqSection />}
        {view === "chamados" && <StaffTicketsSection />}
        {view === "enderecos" && <StaffOfficesSection />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-primary">Suporte</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Central de atendimento aos franqueados: gerencie FAQ, chamados e endereços dos escritórios.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className="flex flex-col items-start rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/30 hover:shadow-sm"
            >
              <div className="rounded-lg bg-app-sidebar p-2.5 mb-3">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="text-base font-bold text-app-sidebar">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
              <ChevronRight className="h-4 w-4 text-muted-foreground mt-auto pt-2 self-end" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

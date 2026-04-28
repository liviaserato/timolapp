import { useState } from "react";
import { MapPin, Pencil } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import OfficeMap, { escritorios, type Office } from "@/components/app/suporte/OfficeMap";

export default function StaffOfficesSection() {
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);

  return (
    <DashboardCard icon={MapPin} title="Nossos endereços">
      <div className="mt-2 flex flex-col lg:flex-row gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 lg:w-[320px] lg:shrink-0 lg:max-h-[400px] lg:overflow-y-auto">
          {escritorios.map((e) => {
            const isActive = selectedOffice?.cidade === e.cidade;
            return (
              <div
                key={e.cidade}
                className={`group flex items-start gap-2.5 p-2.5 rounded-lg transition-colors text-left border ${
                  isActive
                    ? "bg-primary/10 border-primary/30"
                    : "border-transparent hover:bg-muted/50"
                }`}
              >
                <button
                  onClick={() => setSelectedOffice(isActive ? null : e)}
                  className="flex items-start gap-2.5 flex-1 min-w-0 text-left"
                >
                  <span
                    className={`shrink-0 mt-0.5 h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {e.uf}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {e.cidade} – {e.uf}
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug">{e.endereco}</p>
                  </div>
                </button>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    // Placeholder: popup de edição será implementado depois
                  }}
                  className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
                  title="Editar endereço"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
        <div className="lg:flex-1 lg:min-w-0">
          <OfficeMap selectedOffice={selectedOffice} onSelectOffice={setSelectedOffice} />
        </div>
      </div>
    </DashboardCard>
  );
}

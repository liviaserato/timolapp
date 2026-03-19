import { useState } from "react";
import { GitFork, Network, Trophy, ChevronRight } from "lucide-react";
import { BinaryTab } from "@/components/app/rede/BinaryTab";
import { UnilevelTab } from "@/components/app/rede/UnilevelTab";
import { LiderFechamentoTab } from "@/components/app/rede/LiderFechamentoTab";
import { cn } from "@/lib/utils";

type RedeView = "menu" | "binario" | "unilevel" | "lider";

const menuItems: { key: RedeView; icon: typeof GitFork; title: string; description: string }[] = [
  { key: "binario", icon: GitFork, title: "Binário", description: "Visualize sua árvore binária, pernas e pontuação." },
  { key: "unilevel", icon: Network, title: "Unilevel", description: "Explore todos os níveis da sua rede de indicações." },
  { key: "lider", icon: Trophy, title: "Líder de Fechamento", description: "Veja seu desempenho e ranking de liderança." },
];

export default function Rede() {
  const [view, setView] = useState<RedeView>("menu");
  const [search, setSearch] = useState("");

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
            <p className="text-sm text-muted-foreground mt-0.5">{item?.description}</p>
          </div>
        </div>

        {view === "binario" && <BinaryTab />}
        {view === "unilevel" && <UnilevelTab searchQuery={search} />}
        {view === "lider" && <LiderFechamentoTab />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-primary">Minha Rede</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe a estrutura e o desempenho da sua rede de franqueados</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
              <ChevronRight className="h-4 w-4 text-muted-foreground mt-auto pt-2 self-end" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

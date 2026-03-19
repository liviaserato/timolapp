import { useState } from "react";
import { Search, X, ChevronRight, Phone, MessageCircle, Bell, Calendar, StickyNote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClienteDetalheDialog } from "@/components/app/clientes/ClienteDetalheDialog";
import { cn } from "@/lib/utils";

interface ClienteVenda {
  id: string;
  nome: string;
  whatsapp: string;
  ultimaVenda: string;
  proximoContato: string;
  totalVendas: number;
  status: "em-dia" | "pendente" | "atrasado";
}

const mockClientes: ClienteVenda[] = [
  { id: "1", nome: "Maria Silva", whatsapp: "+55 11 99999-1234", ultimaVenda: "2026-02-15", proximoContato: "2026-03-17", totalVendas: 3, status: "atrasado" },
  { id: "2", nome: "João Santos", whatsapp: "+55 21 98888-5678", ultimaVenda: "2026-03-01", proximoContato: "2026-03-31", totalVendas: 1, status: "em-dia" },
  { id: "3", nome: "Ana Oliveira", whatsapp: "+55 31 97777-9012", ultimaVenda: "2026-03-10", proximoContato: "2026-04-09", totalVendas: 2, status: "em-dia" },
  { id: "4", nome: "Carlos Pereira", whatsapp: "+55 41 96666-3456", ultimaVenda: "2026-02-28", proximoContato: "2026-03-30", totalVendas: 5, status: "pendente" },
];

const statusConfig = {
  "em-dia": { label: "Em dia", class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  pendente: { label: "Retornar em breve", class: "bg-amber-100 text-amber-700 border-amber-200" },
  atrasado: { label: "Contato atrasado", class: "bg-red-100 text-red-700 border-red-200" },
};

export function VendasClientesSection({ onAddClient }: { onAddClient: () => void }) {
  const [search, setSearch] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<ClienteVenda | null>(null);

  const filtered = mockClientes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.whatsapp.includes(search)
  );

  const atrasados = filtered.filter((c) => c.status === "atrasado").length;
  const pendentes = filtered.filter((c) => c.status === "pendente").length;

  return (
    <div className="mt-2 space-y-3">
      {/* Summary badges */}
      {(atrasados > 0 || pendentes > 0) && (
        <div className="flex flex-wrap gap-2">
          {atrasados > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs gap-1">
              <Bell className="h-3 w-3" />
              {atrasados} contato{atrasados > 1 ? "s" : ""} atrasado{atrasados > 1 ? "s" : ""}
            </Badge>
          )}
          {pendentes > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs gap-1">
              <Calendar className="h-3 w-3" />
              {pendentes} retorno{pendentes > 1 ? "s" : ""} em breve
            </Badge>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente por nome ou WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-8 h-9 text-sm"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Client list */}
      <div className="space-y-1.5">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {mockClientes.length === 0 ? (
              <div className="space-y-2">
                <p>Nenhum cliente cadastrado ainda.</p>
                <Button size="sm" onClick={onAddClient}>Adicionar primeiro cliente</Button>
              </div>
            ) : (
              <p>Nenhum cliente encontrado.</p>
            )}
          </div>
        ) : (
          filtered.map((cliente) => {
            const status = statusConfig[cliente.status];
            return (
              <button
                key={cliente.id}
                onClick={() => setSelectedCliente(cliente)}
                className="w-full flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3 text-left transition-all hover:border-primary/30 hover:shadow-sm group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {cliente.nome.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{cliente.nome}</p>
                    <Badge variant="outline" className={cn("shrink-0 text-[10px] px-1.5 py-0 border", status.class)}>
                      {status.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {cliente.whatsapp}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {cliente.totalVendas} venda{cliente.totalVendas > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
              </button>
            );
          })
        )}
      </div>

      <ClienteDetalheDialog
        cliente={selectedCliente}
        open={!!selectedCliente}
        onOpenChange={(open) => !open && setSelectedCliente(null)}
      />
    </div>
  );
}

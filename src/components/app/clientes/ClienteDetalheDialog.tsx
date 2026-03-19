import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Phone, MessageCircle, ShoppingBag, StickyNote, Bell,
  Send, Calendar, Plus, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ClienteVenda {
  id: string;
  nome: string;
  whatsapp: string;
  ultimaVenda: string;
  proximoContato: string;
  totalVendas: number;
  status: "em-dia" | "pendente" | "atrasado";
}

interface HistoryItem {
  id: string;
  type: "venda" | "nota" | "lembrete";
  date: string;
  text: string;
}

const mockHistory: HistoryItem[] = [
  { id: "h1", type: "venda", date: "2026-02-15", text: "Combo Mini – 1 unidade" },
  { id: "h2", type: "nota", date: "2026-02-15", text: "Cliente gostou muito do produto, mencionou interesse no combo mega." },
  { id: "h3", type: "lembrete", date: "2026-03-17", text: "Retornar contato – 30 dias pós-venda" },
  { id: "h4", type: "venda", date: "2026-03-01", text: "Combo Mega – 1 unidade" },
  { id: "h5", type: "nota", date: "2026-03-01", text: "Comprou para presentear. Pedir feedback depois." },
];

const typeConfig = {
  venda: { icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50", label: "Venda" },
  nota: { icon: StickyNote, color: "text-blue-600", bg: "bg-blue-50", label: "Nota" },
  lembrete: { icon: Bell, color: "text-amber-600", bg: "bg-amber-50", label: "Lembrete" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

interface Props {
  cliente: ClienteVenda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClienteDetalheDialog({ cliente, open, onOpenChange }: Props) {
  const [newNote, setNewNote] = useState("");
  const [tab, setTab] = useState("historico");

  if (!cliente) return null;

  const handleWhatsApp = () => {
    const phone = cliente.whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    toast.success("Nota adicionada!");
    setNewNote("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="bg-primary px-5 py-4 text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/20 text-lg font-bold">
              {cliente.nome.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <DialogHeader className="p-0 space-y-0">
                <DialogTitle className="text-primary-foreground text-base truncate">{cliente.nome}</DialogTitle>
              </DialogHeader>
              <p className="text-xs text-primary-foreground/80 flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3" />
                {cliente.whatsapp}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 text-xs shrink-0"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-3 text-xs">
            <div>
              <span className="text-primary-foreground/60">Vendas:</span>{" "}
              <span className="font-semibold">{cliente.totalVendas}</span>
            </div>
            <div>
              <span className="text-primary-foreground/60">Última:</span>{" "}
              <span className="font-semibold">{formatDate(cliente.ultimaVenda)}</span>
            </div>
            <div>
              <span className="text-primary-foreground/60">Próx. contato:</span>{" "}
              <span className="font-semibold">{formatDate(cliente.proximoContato)}</span>
            </div>
          </div>
        </div>

        {/* Tabs content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-3">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full bg-muted/50 h-auto p-1">
              <TabsTrigger value="historico" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-1.5">
                Histórico
              </TabsTrigger>
              <TabsTrigger value="nova-nota" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-1.5">
                <Plus className="h-3 w-3 mr-1" />
                Nova Nota
              </TabsTrigger>
            </TabsList>

            <TabsContent value="historico" className="mt-3">
              <div className="relative space-y-0">
                {/* Timeline line */}
                <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />

                {mockHistory.map((item) => {
                  const config = typeConfig[item.type];
                  const Icon = config.icon;
                  return (
                    <div key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
                      <div className={cn("relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full", config.bg)}>
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/60">
                            {config.label}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(item.date)}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="nova-nota" className="mt-3 space-y-3">
              <Textarea
                placeholder="Escreva uma observação, registre uma venda ou adicione um lembrete..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gap-1.5 text-xs" onClick={handleAddNote}>
                  <StickyNote className="h-3.5 w-3.5" />
                  Salvar Nota
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs" onClick={() => toast.info("Em breve!")}>
                  <Bell className="h-3.5 w-3.5" />
                  Criar Lembrete
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

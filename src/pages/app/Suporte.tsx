import { useState } from "react";
import {
  Ticket,
  Phone,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  MapPin,
  MessageSquare,
  Send,
  Eye,
  EyeOff,
} from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { openWhatsAppLink } from "@/lib/whatsapp";
import iconWhatsapp from "@/assets/icon-logo-whatsapp.svg";
import TicketDetailDialog from "@/components/app/suporte/TicketDetailDialog";
import { mockTicketsDetalhados } from "@/components/app/suporte/mock-tickets";
import type { TicketDetail } from "@/components/app/suporte/TicketDetailDialog";
import FaqSection, { faqTabs } from "@/components/app/suporte/FaqSection";
import faviconTimol from "@/assets/favicon-timol-azul-escuro.svg";

/* ── Status map ── */

const statusMap: Record<TicketDetail["status"], { label: string; color: string; icon: typeof Clock }> = {
  aberto: { label: "Aberto", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
  em_andamento: { label: "Em andamento", color: "bg-amber-100 text-amber-700", icon: Clock },
  respondido: { label: "Respondido", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  fechado: { label: "Fechado", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
};

const escritorios = [
  { uf: "PA", cidade: "Altamira", estado: "PA", endereco: "Av. Popular, 1816 Sudam II" },
  { uf: "PR", cidade: "Cascavel", estado: "PR", endereco: "R. São Luís, 2137 Recanto Tropical" },
  { uf: "RS", cidade: "Caxias do Sul", estado: "RS", endereco: "Av. Itália, 288 – Sala 65 São Pelegrino" },
  { uf: "RO", cidade: "Ji-Paraná", estado: "RO", endereco: "Av. Aracajú, 2368 Sala 07 Nova Brasília" },
  { uf: "SP", cidade: "São Paulo", estado: "SP", endereco: "Rua Vergueiro, 1855 4º andar, Sala ..." },
  { uf: "PB", cidade: "João Pessoa", estado: "PB", endereco: "R. Cândida Maria da Silva, 340 João..." },
  { uf: "BA", cidade: "Salvador", estado: "BA", endereco: "R. Cel. Almerindo Rehem, 126 Sala ..." },
  { uf: "PR", cidade: "Londrina", estado: "PR", endereco: "R. Sergipe, 476 Sala 1206 Centro" },
  { uf: "MG", cidade: "Uberlândia", estado: "MG", endereco: "Av. Rondon Pacheco, 4600 Sala 1010" },
];

const categoriasChamado = [...faqTabs.map((t) => t.label), "Outro"];

/* ── Helper: check if ticket is older than 30 days ── */
function isOlderThan30Days(dateStr: string) {
  const [d, m, y] = dateStr.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  const diff = Date.now() - date.getTime();
  return diff > 30 * 24 * 60 * 60 * 1000;
}

/* ── Component ── */

export default function Suporte() {
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [ticketCategory, setTicketCategory] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showOldTickets, setShowOldTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [ticketDetailOpen, setTicketDetailOpen] = useState(false);

  const visibleTickets = showOldTickets
    ? mockTicketsDetalhados
    : mockTicketsDetalhados.filter(
        (t) => !(t.status === "fechado" && isOlderThan30Days(t.ultimaAtualizacao))
      );

  const hasHiddenOld = mockTicketsDetalhados.some(
    (t) => t.status === "fechado" && isOlderThan30Days(t.ultimaAtualizacao)
  );

  function handleSubmitTicket() {
    if (!ticketCategory || !ticketSubject.trim() || !ticketDescription.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setNewTicketOpen(false);
      setTicketCategory("");
      setTicketSubject("");
      setTicketDescription("");
      toast.success("Chamado enviado com sucesso! Nossa equipe responderá em breve.");
    }, 1200);
  }

  function handleOpenTicket(ticket: TicketDetail) {
    setSelectedTicket(ticket);
    setTicketDetailOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ── */}
      <header className="mb-1">
        <h1 className="text-2xl font-bold text-primary">Suporte</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Encontre respostas rápidas, fale com a equipe Timol ou acompanhe seus chamados de atendimento.
        </p>
      </header>

      {/* ── 1. FAQ ── */}
      <FaqSection />

      {/* ── 2. CTA Banner ── */}
      <section className="rounded-[10px] overflow-hidden bg-gradient-to-r from-[hsl(var(--app-header))] to-[hsl(210,80%,45%)] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-primary-foreground text-center sm:text-left">
          <p className="font-bold text-base">Não encontrou o que precisava?</p>
          <p className="text-xs opacity-90 mt-0.5">
            Abra um chamado e nossa equipe responderá em até 24h úteis
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0 gap-1.5 text-xs shrink-0"
          onClick={() => setNewTicketOpen(true)}
        >
          <Ticket className="h-4 w-4" />
          Abrir Chamado
        </Button>
      </section>

      {/* ── 3. Meus Chamados ── */}
      <section>
        <DashboardCard icon={Ticket} title="Meus Chamados">
          <div className="mt-2">
            {visibleTickets.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Você não possui chamados no momento.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {visibleTickets.map((c) => {
                  const st = statusMap[c.status];
                  const StIcon = st.icon;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleOpenTicket(c)}
                      className="w-full flex items-center gap-3 py-3 px-1 text-left hover:bg-muted/50 rounded transition-colors"
                    >
                      <StIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          <span className="text-muted-foreground">{c.numero}</span>{" "}
                          {c.assunto}
                        </p>
                        <p className="text-xs text-muted-foreground">Atualizado em {c.ultimaAtualizacao}</p>
                      </div>
                      <Badge variant="secondary" className={`text-[10px] shrink-0 ${st.color}`}>
                        {st.label}
                      </Badge>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            )}

            {hasHiddenOld && (
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => setShowOldTickets(!showOldTickets)}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showOldTickets ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      Ocultar chamados antigos
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      Mostrar chamados encerrados há mais de 30 dias
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </DashboardCard>
      </section>

      {/* ── 4. Fale Conosco ── */}
      <section>
        <DashboardCard icon={Phone} title="Fale Conosco">
          <div className="mt-2 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => openWhatsAppLink("Olá! Preciso de ajuda.")}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
              >
                <img src={iconWhatsapp} alt="WhatsApp" className="h-8 w-8" />
                <div>
                  <p className="text-sm font-medium">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">(34) 99125-8000</p>
                </div>
              </button>
              <a
                href="mailto:suporte@timol.com.br"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
              >
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Send className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">E-mail</p>
                  <p className="text-xs text-muted-foreground">suporte@timol.com.br</p>
                </div>
              </a>
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                Nossos Escritórios
              </h3>
              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                {escritorios.map((e, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="shrink-0 mt-0.5 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                      {e.uf}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {e.cidade} – {e.estado}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{e.endereco}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>
      </section>

      {/* ── Dialog: Novo Chamado ── */}
      <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg flex items-center justify-center gap-2">
              <img src={faviconTimol} alt="" className="h-5 w-5" />
              Novo Chamado
            </DialogTitle>
            <DialogDescription>
              Descreva sua dúvida ou problema. Nossa equipe responderá em breve.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Categoria *</Label>
              <Select value={ticketCategory} onValueChange={setTicketCategory}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasChamado.map((c) => (
                    <SelectItem key={c} value={c} className="text-sm">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Assunto *</Label>
              <Input
                placeholder="Ex: Dúvida sobre bônus"
                className="text-sm"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Descrição *</Label>
              <Textarea
                placeholder="Descreva detalhadamente sua dúvida ou problema..."
                className="text-sm min-h-[100px] resize-none"
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Anexo (opcional)</Label>
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-md p-3 text-sm text-muted-foreground hover:border-primary/40 transition-colors">
                <Paperclip className="h-4 w-4" />
                <span>Clique para anexar um arquivo</span>
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button
              className="w-full gap-1.5 text-sm"
              disabled={submitting}
              onClick={handleSubmitTicket}
            >
              <Send className="h-4 w-4" />
              {submitting ? "Enviando..." : "Enviar Chamado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Detalhe do Chamado ── */}
      <TicketDetailDialog
        ticket={selectedTicket}
        open={ticketDetailOpen}
        onOpenChange={setTicketDetailOpen}
      />
    </div>
  );
}

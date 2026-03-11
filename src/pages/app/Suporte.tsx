import { useState } from "react";
import {
  Ticket,
  ChevronRight,
  Clock,
  X,
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
  em_andamento: { label: "Em andamento", color: "bg-amber-100 text-amber-700", icon: Clock },
  expirado: { label: "Expirado", color: "bg-red-100 text-red-700", icon: AlertCircle },
  respondido: { label: "Respondido", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  concluido: { label: "Concluído", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  arquivado: { label: "Arquivado", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
};

import OfficeMap, { escritorios, type Office } from "@/components/app/suporte/OfficeMap";

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
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const MAX_FILES = 5;

  const visibleTickets = showOldTickets
    ? mockTicketsDetalhados
    : mockTicketsDetalhados.filter(
        (t) => !(t.status === "arquivado" && isOlderThan30Days(t.ultimaAtualizacao))
      );

  const hasHiddenOld = mockTicketsDetalhados.some(
    (t) => t.status === "arquivado" && isOlderThan30Days(t.ultimaAtualizacao)
  );

  function handleSubmitTicket() {
    const errors: Record<string, string> = {};
    if (!ticketCategory) errors.category = "Selecione uma categoria";
    if (!ticketSubject.trim()) errors.subject = "Informe o assunto do chamado";
    if (!ticketDescription.trim()) errors.description = "Descreva sua dúvida ou problema";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setNewTicketOpen(false);
      setTicketCategory("");
      setTicketSubject("");
      setTicketDescription("");
      setAttachedFiles([]);
      setFieldErrors({});
      toast.success("Chamado enviado com sucesso! Nossa equipe responderá em breve.");
    }, 1200);
  }

  function handleFileAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && attachedFiles.length < MAX_FILES) {
      setAttachedFiles((prev) => [...prev, file]);
    }
    e.target.value = "";
  }

  function handleRemoveFile(index: number) {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
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
            Abra um chamado ou fale diretamente com uma atendente
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0 gap-1.5 text-xs shrink-0"
            onClick={() => setNewTicketOpen(true)}
          >
            <Ticket className="h-4 w-4" />
            Abrir Chamado
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0 gap-1.5 text-xs shrink-0"
            onClick={() => openWhatsAppLink("Olá! Preciso de ajuda.")}
          >
            <img src={iconWhatsapp} alt="" className="h-4 w-4" />
            Falar com Atendente
          </Button>
        </div>
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

      {/* ── 4. Nossos Endereços ── */}
      <section>
        <DashboardCard icon={MapPin} title="Nossos Endereços">
          <div className="mt-2 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {escritorios.map((e) => {
                const isActive = selectedOffice?.cidade === e.cidade;
                return (
                  <button
                    key={e.cidade}
                    onClick={() => setSelectedOffice(isActive ? null : e)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg transition-colors text-left ${
                      isActive
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/50 border border-transparent"
                    }`}
                  >
                    <span className={`shrink-0 mt-0.5 h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {e.uf}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{e.cidade} – {e.uf}</p>
                      <p className="text-xs text-muted-foreground leading-snug">{e.endereco}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <OfficeMap selectedOffice={selectedOffice} onSelectOffice={setSelectedOffice} />
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
            <DialogDescription className="text-center">
              Descreva sua dúvida ou problema.
              <br />
              Nossa equipe responderá em breve.
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
                placeholder="Ex: Quero alterar meu e-mail do cadastro"
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
            <div className="space-y-2">
              <Label className="text-xs font-medium">Anexos (opcional)</Label>
              {attachedFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 border border-border rounded-md p-2.5 text-sm"
                >
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(i)}
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {attachedFiles.length < MAX_FILES ? (
                <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-md p-3 text-sm text-muted-foreground hover:border-primary/40 transition-colors">
                  <Paperclip className="h-4 w-4" />
                  <span>Clique para anexar um arquivo</span>
                  <input type="file" className="hidden" onChange={handleFileAttach} />
                </label>
              ) : (
                <p className="text-xs text-muted-foreground text-center">
                  Limite máximo de {MAX_FILES} arquivos atingido
                </p>
              )}
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

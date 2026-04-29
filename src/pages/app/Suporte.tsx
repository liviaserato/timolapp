import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  HelpCircle,
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
import { useLanguage } from "@/i18n/LanguageContext";
import iconWhatsapp from "@/assets/icon-logo-whatsapp.svg";
import TicketDetailDialog from "@/components/app/suporte/TicketDetailDialog";
import { mockTicketsDetalhados } from "@/components/app/suporte/mock-tickets";
import type { TicketDetail } from "@/components/app/suporte/TicketDetailDialog";
import FaqSection, { faqTabs } from "@/components/app/suporte/FaqSection";
import faviconTimol from "@/assets/favicon-timol-azul-escuro.svg";
import OfficeMap, { escritorios, type Office } from "@/components/app/suporte/OfficeMap";

type SuporteView = "menu" | "faq" | "chamados" | "enderecos";

function isOlderThan30Days(dateStr: string) {
  const [d, m, y] = dateStr.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  const diff = Date.now() - date.getTime();
  return diff > 30 * 24 * 60 * 60 * 1000;
}

export default function Suporte() {
  const { t } = useLanguage();
  const location = useLocation();
  const [view, setView] = useState<SuporteView>("menu");
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

  useEffect(() => {
    setView("menu");
  }, [location.key]);

  const statusMap: Record<TicketDetail["status"], { label: string; color: string; icon: typeof Clock }> = {
    em_andamento: { label: t("suporte.inProgress"), color: "bg-amber-100 text-amber-700", icon: Clock },
    expirado: { label: t("suporte.expired"), color: "bg-red-100 text-red-700", icon: AlertCircle },
    respondido: { label: t("suporte.answered"), color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
    concluido: { label: t("suporte.completed"), color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    arquivado: { label: t("suporte.archived"), color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
  };

  const categoriasChamado = [...faqTabs.map((tab) => tab.label), t("suporte.other")];

  const visibleTickets = showOldTickets
    ? mockTicketsDetalhados
    : mockTicketsDetalhados.filter((ticket) => !(ticket.status === "arquivado" && isOlderThan30Days(ticket.ultimaAtualizacao)));

  const hasHiddenOld = mockTicketsDetalhados.some((ticket) => ticket.status === "arquivado" && isOlderThan30Days(ticket.ultimaAtualizacao));

  function handleSubmitTicket() {
    const errors: Record<string, string> = {};
    if (!ticketCategory) errors.category = t("suporte.selectCategoryError");
    if (!ticketSubject.trim()) errors.subject = t("suporte.subjectError");
    if (!ticketDescription.trim()) errors.description = t("suporte.descriptionError");
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
      toast.success(t("suporte.ticketSent"));
    }, 1200);
  }

  function handleFileAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && attachedFiles.length < MAX_FILES) setAttachedFiles((prev) => [...prev, file]);
    e.target.value = "";
  }

  function handleRemoveFile(index: number) {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleOpenTicket(ticket: TicketDetail) {
    setSelectedTicket(ticket);
    setTicketDetailOpen(true);
  }

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
      desc: "Encontre respostas rápidas para as principais dúvidas, organizadas por categoria.",
    },
    {
      key: "chamados",
      icon: Ticket,
      title: "Chamados",
      desc: "Abra um novo chamado ou acompanhe o andamento dos seus atendimentos.",
    },
    {
      key: "enderecos",
      icon: MapPin,
      title: "Nossos endereços",
      desc: "Consulte os endereços dos escritórios e centros de distribuição da Timol.",
    },
  ];

  const currentItem = menuItems.find((m) => m.key === view);

  return (
    <div className="flex flex-col gap-4">
      {view === "menu" ? (
        <header className="mb-1">
          <h1 className="text-2xl font-bold text-primary">{t("suporte.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("suporte.subtitle")}</p>
        </header>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("menu")}
            className="text-primary hover:text-primary/80 transition-colors"
            aria-label="Voltar"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-primary">{currentItem?.title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{currentItem?.desc}</p>
          </div>
          {view === "chamados" && (
            <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setNewTicketOpen(true)}>
              <Ticket className="h-4 w-4" />
              {t("suporte.newTicket")}
            </Button>
          )}
        </div>
      )}

      {view === "menu" && (
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
      )}

      {view === "faq" && (
        <>
          <FaqSection onOpenTicket={() => setNewTicketOpen(true)} />
          <section className="rounded-[10px] overflow-hidden bg-gradient-to-r from-[hsl(var(--app-header))] to-[hsl(210,80%,45%)] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-primary-foreground text-center sm:text-left">
              <p className="font-bold text-sm">Não encontrou o que procurava?</p>
              <p className="text-xs opacity-90 mt-0.5">Abra um chamado ou fale com um atendente.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0 gap-1.5 text-xs shrink-0" onClick={() => setNewTicketOpen(true)}>
                <Ticket className="h-4 w-4" />
                {t("suporte.openTicket")}
              </Button>
              <Button variant="outline" size="sm" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0 gap-1.5 text-xs shrink-0" onClick={() => openWhatsAppLink("Olá! Preciso de ajuda.")}>
                <img src={iconWhatsapp} alt="" className="h-4 w-4" />
                {t("suporte.talkToAgent")}
              </Button>
            </div>
          </section>
        </>
      )}

      {view === "chamados" && (
        <>
          <section>
            <DashboardCard icon={Ticket} title={t("suporte.myTickets")}>
              <div className="mt-2">
                {visibleTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">{t("suporte.noTickets")}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {visibleTickets.map((c) => {
                      const st = statusMap[c.status];
                      const StIcon = st.icon;
                      return (
                        <button key={c.id} onClick={() => handleOpenTicket(c)} className="w-full flex items-center gap-3 py-3 px-1 text-left hover:bg-muted/50 rounded transition-colors">
                          <StIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              <span className="text-muted-foreground">{c.numero}</span> {c.assunto}
                            </p>
                            <p className="text-xs text-muted-foreground">{t("suporte.updatedAt")} {c.ultimaAtualizacao}</p>
                          </div>
                          <Badge variant="secondary" className={`text-[10px] shrink-0 ${st.color}`}>{st.label}</Badge>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {hasHiddenOld && (
                  <div className="mt-3 flex justify-center">
                    <button onClick={() => setShowOldTickets(!showOldTickets)} className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                      {showOldTickets ? (
                        <><EyeOff className="h-3.5 w-3.5" />{t("suporte.hideOld")}</>
                      ) : (
                        <><Eye className="h-3.5 w-3.5" />{t("suporte.showOld")}</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </DashboardCard>
          </section>
        </>
      )}

      {view === "enderecos" && (
        <section>
          <DashboardCard icon={MapPin} title={t("suporte.ourAddresses")}>
            <div className="mt-2 flex flex-col lg:flex-row gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 lg:w-[280px] lg:shrink-0 lg:max-h-[400px] lg:overflow-y-auto">
                {escritorios.map((e) => {
                  const isActive = selectedOffice?.cidade === e.cidade;
                  return (
                    <button key={e.cidade} onClick={() => setSelectedOffice(isActive ? null : e)} className={`flex items-start gap-2.5 p-2.5 rounded-lg transition-colors text-left ${isActive ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50 border border-transparent"}`}>
                      <span className={`shrink-0 mt-0.5 h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{e.uf}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{e.cidade} – {e.uf}</p>
                        <p className="text-xs text-muted-foreground leading-snug">{e.endereco}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="lg:flex-1 lg:min-w-0">
                <OfficeMap selectedOffice={selectedOffice} onSelectOffice={setSelectedOffice} />
              </div>
            </div>
          </DashboardCard>
        </section>
      )}

      {/* Dialog: Novo Chamado */}
      <Dialog open={newTicketOpen} onOpenChange={(open) => {
        setNewTicketOpen(open);
        if (!open) {
          setTicketCategory("");
          setTicketSubject("");
          setTicketDescription("");
          setAttachedFiles([]);
          setFieldErrors({});
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg flex items-center justify-center gap-2">
              <img src={faviconTimol} alt="" className="h-5 w-5" />
              {t("suporte.newTicket")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("suporte.describeIssue")}<br />{t("suporte.teamWillRespond")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2 min-w-0 w-full">
            <div className="space-y-1.5 min-w-0 w-full">
              <Label className="text-xs font-medium">{t("suporte.category")}</Label>
              <Select value={ticketCategory} onValueChange={(v) => { setTicketCategory(v); setFieldErrors((p) => ({ ...p, category: "" })); }}>
                <SelectTrigger className={`text-sm w-full min-w-0 ${fieldErrors.category ? "border-destructive" : ""}`}>
                  <SelectValue placeholder={t("suporte.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categoriasChamado.map((c) => (
                    <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.category && <p className="text-xs text-destructive">{fieldErrors.category}</p>}
            </div>
            <div className="space-y-1.5 min-w-0 w-full">
              <Label className="text-xs font-medium">{t("suporte.subject")}</Label>
              <Input placeholder={t("suporte.subjectPlaceholder")} className={`text-sm w-full min-w-0 ${fieldErrors.subject ? "border-destructive" : ""}`} value={ticketSubject} onChange={(e) => { setTicketSubject(e.target.value); setFieldErrors((p) => ({ ...p, subject: "" })); }} />
              {fieldErrors.subject && <p className="text-xs text-destructive">{fieldErrors.subject}</p>}
            </div>
            <div className="space-y-1.5 min-w-0 w-full">
              <Label className="text-xs font-medium">{t("suporte.descriptionLabel")}</Label>
              <Textarea placeholder={t("suporte.descriptionPlaceholder")} className={`text-sm min-h-[100px] resize-none w-full min-w-0 ${fieldErrors.description ? "border-destructive" : ""}`} value={ticketDescription} onChange={(e) => { setTicketDescription(e.target.value); setFieldErrors((p) => ({ ...p, description: "" })); }} />
              {fieldErrors.description && <p className="text-xs text-destructive">{fieldErrors.description}</p>}
            </div>
            <div className="space-y-2 min-w-0 w-full">
              <Label className="text-xs font-medium">{t("suporte.attachments")}</Label>
              {attachedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 border border-border rounded-md p-2.5 text-sm">
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate flex-1">{file.name}</span>
                  <button type="button" onClick={() => handleRemoveFile(i)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {attachedFiles.length < MAX_FILES ? (
                <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-md p-3 text-sm text-muted-foreground hover:border-primary/40 transition-colors w-full min-w-0">
                  <Paperclip className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t("suporte.clickToAttach")}</span>
                  <input type="file" className="hidden" onChange={handleFileAttach} />
                </label>
              ) : (
                <p className="text-xs text-muted-foreground text-center">
                  {t("suporte.maxFiles").replace("{n}", String(MAX_FILES))}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button className="w-full gap-1.5 text-sm" disabled={submitting} onClick={handleSubmitTicket}>
              <Send className="h-4 w-4" />
              {submitting ? t("suporte.sending") : t("suporte.sendTicket")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TicketDetailDialog ticket={selectedTicket} open={ticketDetailOpen} onOpenChange={setTicketDetailOpen} />
    </div>
  );
}

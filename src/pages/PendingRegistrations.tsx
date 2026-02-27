import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Loader2, FileText, Mail, Phone, Users, Award, CreditCard,
  Calendar, MessageCircle, StickyNote, ChevronDown, ChevronUp,
  SearchCheck, Sparkles, Check, Copy, Bell,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { countries, getCountryName } from "@/data/countries";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface PendingRegistration {
  id: string;
  user_id: string;
  full_name: string | null;
  document: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  user_display_id: string | null;
  sponsor_id: string | null;
  sponsor_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  status: string;
  franchise_selected: boolean;
  franchise_name: string | null;
  payment_completed: boolean;
  recovery_email_sent: boolean;
  recovery_email_sent_at: string | null;
  whatsapp_recovery_sent: boolean;
  whatsapp_recovery_sent_at: string | null;
  sponsor_source: string | null;
  sponsor_notified: boolean;
  sponsor_notified_at: string | null;
}

function capitalize(str: string | null): string {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

function firstName(str: string | null): string {
  if (!str) return "";
  const first = str.trim().split(" ")[0] || "";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export default function PendingRegistrations() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [whatsappDialog, setWhatsappDialog] = useState<{ open: boolean; reg: PendingRegistration | null }>({ open: false, reg: null });
  const [sponsorDialog, setSponsorDialog] = useState<{ open: boolean; reg: PendingRegistration | null }>({ open: false, reg: null });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPending() {
      try {
        const { data, error } = await supabase.functions.invoke("get-pending-registrations");
        if (error) throw error;
        setRegistrations(data?.data || []);
      } catch (err: any) {
        console.error("Error fetching pending registrations:", err);
        setError("Erro ao carregar cadastros pendentes.");
      } finally {
        setLoading(false);
      }
    }
    fetchPending();
  }, []);

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "2-digit",
    });
  };

  const getCountryData = (iso2: string | null) => {
    if (!iso2) return null;
    return countries.find((c) => c.iso2 === iso2.toUpperCase());
  };

  const isBrazilian = (countryIso: string | null) => !countryIso || countryIso.toUpperCase() === "BR";

  const getPaymentLabel = (reg: PendingRegistration) => {
    if (reg.payment_completed) return "Confirmado";
    if (reg.franchise_selected) return "Pagamento não aprovado";
    return "";
  };

  const getDisplayId = (raw: string | null) => {
    if (!raw) return "ID";
    const nums = raw.replace(/\D/g, "");
    return `ID ${parseInt(nums, 10) || nums}`;
  };

  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSaveNote = (id: string) => {
    setSavedNotes((prev) => ({ ...prev, [id]: notes[id] || "" }));
    toast.success("Observação salva.");
  };

  const handleCancelNote = (id: string) => {
    setNotes((prev) => ({ ...prev, [id]: savedNotes[id] || "" }));
  };

  const buildWhatsAppMessage = (name: string) =>
    `Oi, ${capitalize(name)}! Tudo bem? 😊\nVi que você começou seu cadastro na Timol e quis passar aqui pra te dar um suporte rápido.\n\nSe ainda estiver avaliando ou ficou com alguma dúvida, posso te explicar de forma simples e sem compromisso.\nAssim você decide com segurança se quer continuar ou não 👍\n\nSe fizer sentido pra você, me chama aqui que eu te ajudo.`;

  const formatDateOnly = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  const buildSponsorMessage = (reg: PendingRegistration) => {
    const sponsorFirst = firstName(reg.sponsor_name);
    const userFirst = firstName(reg.full_name);
    const userFull = capitalize(reg.full_name || "");
    const date = formatDateOnly(reg.created_at);
    const phone = reg.phone || "";
    const location = [reg.city, reg.state, (() => { const c = getCountryData(reg.country); return c ? getCountryName(c, "pt") : null; })()].filter(Boolean).join(", ");

    if (reg.sponsor_source === "suggestion") {
      return `Olá, ${sponsorFirst}! Tudo bem? 😊\nSeu ID foi sugerido de forma aleatória em um cadastro de franquia. O ${userFirst} iniciou o processo no dia ${date}, mas ainda não concluiu.\n\nMesmo que você não o conheça, esse é um bom momento para uma abordagem. Ele pode acabar fazendo parte da sua rede.\n\nQuando puder, se apresente, entenda se ficou alguma dúvida e veja se consegue ajudá-lo a avançar 🤝\n\nNome: ${userFull}\nContato: ${phone}\nLocalização: ${location}\n\nObs.: Caso não consiga fazer o acompanhamento, me avise por favor para que eu possa indicar outro patrocinador.`;
    }

    // Default: "search"
    return `Olá, ${sponsorFirst}! Tudo bem? 😊\nO ${userFirst} iniciou o cadastro de uma franquia no dia ${date}, mas ainda não concluiu.\n\nComo ele está na sua rede, sua abordagem pode fazer toda a diferença agora.\nQuando puder, vale dar um toque rápido pra entender se ficou alguma dúvida e ajudá-lo a avançar na decisão 🤝\n\nNome: ${userFull}\nContato: ${phone}`;
  };

  const handleCopyMessage = (msg: string) => {
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = (phone: string, msg: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const encoded = encodeURIComponent(msg);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = isMobile
      ? `https://wa.me/${cleaned}?text=${encoded}`
      : `https://web.whatsapp.com/send?phone=${cleaned}&text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleConfirmSent = async (regId: string, type: "whatsapp" | "sponsor") => {
    try {
      const { data, error } = await supabase.functions.invoke("mark-recovery-sent", {
        body: { registration_id: regId, type },
      });
      if (error) throw error;
      const sentAt = data?.sent_at || new Date().toISOString();
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === regId
            ? type === "whatsapp"
              ? { ...r, whatsapp_recovery_sent: true, whatsapp_recovery_sent_at: sentAt }
              : { ...r, sponsor_notified: true, sponsor_notified_at: sentAt }
            : r
        )
      );
      toast.success("Envio confirmado!");
      if (type === "whatsapp") setWhatsappDialog({ open: false, reg: null });
      else setSponsorDialog({ open: false, reg: null });
    } catch (err) {
      console.error("Error confirming sent:", err);
      toast.error("Erro ao confirmar envio.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl md:text-2xl font-semibold mb-6 text-center">Cadastros Pendentes</h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-8">{error}</p>
        ) : registrations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum cadastro pendente encontrado.</p>
        ) : (
          <div className="flex flex-col gap-5 items-center">
            {registrations.map((reg) => {
              const countryData = getCountryData(reg.country);
              const brazilian = isBrazilian(reg.country);
              const countryName = countryData ? getCountryName(countryData, "pt") : null;
              const isCollapsed = collapsed[reg.id] || false;
              const noteChanged = (notes[reg.id] || "") !== (savedNotes[reg.id] || "");

              return (
                <Card key={reg.id} className="overflow-hidden flex flex-col w-full max-w-[600px]">
                  {/* Header */}
                  <CardHeader
                    className="pb-3 cursor-pointer select-none flex flex-col justify-center"
                    style={{ backgroundColor: "hsl(210 60% 96%)" }}
                    onClick={() => toggleCollapse(reg.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <Badge className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 shrink-0">
                            {getDisplayId(reg.user_display_id)}
                          </Badge>
                          <span className="text-lg font-bold truncate" title={reg.full_name || undefined}>
                            {capitalize(reg.full_name)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-0 min-h-[1rem]">
                          {reg.city
                            ? <>
                                {[reg.city, reg.state, countryName].filter(Boolean).join(", ")}
                                {countryData && (
                                  <span title={countryName || undefined} className="ml-1">{countryData.flag}</span>
                                )}
                              </>
                            : "\u00A0"
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 mt-1">
                        <Badge variant="outline" className="text-[10px] px-2 py-0 border-amber-400 text-amber-600">
                          Pendente
                        </Badge>
                        {isCollapsed ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Body — collapsible */}
                  {!isCollapsed && (
                    <CardContent className="pt-4 pb-3 flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Left column */}
                        <div className="space-y-2.5">
                          <InfoItem icon={FileText} label={brazilian ? "CPF" : "Documento"}>
                            <span className="truncate" title={reg.document || undefined}>
                              {reg.document || ""}
                            </span>
                            {!brazilian && countryData && (
                              <span title={countryName || undefined} className="ml-1 shrink-0">{countryData.flag}</span>
                            )}
                          </InfoItem>
                          <InfoItem icon={Mail} label="E-mail">
                            <span className="truncate" title={reg.email}>{reg.email}</span>
                          </InfoItem>
                          <InfoItem icon={Phone} label="Telefone">
                            {reg.phone || ""}
                          </InfoItem>
                        </div>

                        {/* Right column */}
                        <div className="space-y-2.5">
                          <InfoItem icon={Users} label="Patrocinador">
                            <span className="truncate" title={
                              reg.sponsor_id && reg.sponsor_name
                                ? `${reg.sponsor_id} – ${capitalize(reg.sponsor_name)}`
                                : capitalize(reg.sponsor_name) || reg.sponsor_id || undefined
                            }>
                              {reg.sponsor_id && reg.sponsor_name
                                ? `${reg.sponsor_id} – ${capitalize(reg.sponsor_name)}`
                                : capitalize(reg.sponsor_name) || reg.sponsor_id || ""}
                            </span>
                            {reg.sponsor_source && <SponsorTypeBadge type={reg.sponsor_source === "suggestion" ? "suggestion" : "search"} />}
                          </InfoItem>
                          <InfoItem icon={Award} label="Franquia">
                            {reg.franchise_name || ""}
                          </InfoItem>
                          <InfoItem icon={CreditCard} label="Pagamento">
                            {getPaymentLabel(reg)}
                          </InfoItem>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mt-4">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                          <StickyNote className="h-3.5 w-3.5" aria-hidden="true" />
                          Observações
                        </label>
                        <Textarea
                          placeholder="Anote a resposta do cliente, quais dúvidas ele tem e tente identificar por que ainda não concluiu o cadastro."
                          className="text-xs min-h-[60px] resize-y"
                          value={notes[reg.id] || ""}
                          onChange={(e) => setNotes((prev) => ({ ...prev, [reg.id]: e.target.value }))}
                        />
                        {noteChanged && (
                          <div className="flex gap-2 mt-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => handleCancelNote(reg.id)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => handleSaveNote(reg.id)}
                            >
                              Salvar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}

                  {/* Footer timeline */}
                  <Separator />
                  <CardFooter
                    className="px-2 sm:px-5 py-4 flex-col items-stretch gap-0"
                    style={{ backgroundColor: "hsl(210 60% 96%)" }}
                  >
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-3 w-full">
                      <TimelineStep
                        icon={Calendar}
                        label="Cadastro"
                        value={formatDateTime(reg.created_at) || "—"}
                      />
                      <TimelineStep
                        icon={Mail}
                        label="Email"
                        value={formatDateTime(reg.recovery_email_sent_at) || "—"}
                      />
                      <TimelineStepAction
                        icon={MessageCircle}
                        label="WhatsApp"
                        value={formatDateTime(reg.whatsapp_recovery_sent_at)}
                        done={reg.whatsapp_recovery_sent}
                        buttonLabel="Enviar mensagem"
                        onAction={() => setWhatsappDialog({ open: true, reg })}
                      />
                      <TimelineStepAction
                        icon={Bell}
                        label="Patrocinador"
                        value={formatDateTime(reg.sponsor_notified_at)}
                        done={reg.sponsor_notified}
                        buttonLabel="Notificar"
                        onAction={() => setSponsorDialog({ open: true, reg })}
                      />
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* WhatsApp Dialog */}
      <MessageDialog
        open={whatsappDialog.open}
        title="Enviar mensagem via WhatsApp"
        description="Copie a mensagem abaixo ou envie diretamente pelo WhatsApp."
        message={whatsappDialog.reg ? buildWhatsAppMessage(whatsappDialog.reg.full_name || "") : ""}
        phone={whatsappDialog.reg?.phone || null}
        copied={copied}
        confirmed={whatsappDialog.reg?.whatsapp_recovery_sent || false}
        onCopy={handleCopyMessage}
        onSend={handleSendWhatsApp}
        onConfirm={() => whatsappDialog.reg && handleConfirmSent(whatsappDialog.reg.id, "whatsapp")}
        onClose={() => setWhatsappDialog({ open: false, reg: null })}
      />

      {/* Sponsor Dialog */}
      <MessageDialog
        open={sponsorDialog.open}
        title="Notificar patrocinador via WhatsApp"
        description="Copie a mensagem abaixo ou envie diretamente pelo WhatsApp para o patrocinador."
        message={sponsorDialog.reg ? buildSponsorMessage(sponsorDialog.reg) : ""}
        phone={sponsorDialog.reg?.phone || null}
        copied={copied}
        confirmed={sponsorDialog.reg?.sponsor_notified || false}
        onCopy={handleCopyMessage}
        onSend={handleSendWhatsApp}
        onConfirm={() => sponsorDialog.reg && handleConfirmSent(sponsorDialog.reg.id, "sponsor")}
        onClose={() => setSponsorDialog({ open: false, reg: null })}
      />
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function InfoItem({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground leading-none mb-0.5">{label}</p>
        <p className="text-sm font-medium flex items-center gap-0.5 min-w-0">{children}</p>
      </div>
    </div>
  );
}

function SponsorTypeBadge({ type }: { type: "search" | "suggestion" }) {
  return type === "search" ? (
    <span title="Busca" className="ml-1 shrink-0">
      <SearchCheck className="h-3 w-3 text-muted-foreground/70" />
    </span>
  ) : (
    <span title="Sugestão" className="ml-1 shrink-0">
      <Sparkles className="h-3 w-3 text-amber-400" />
    </span>
  );
}

function TimelineStep({
  icon: Icon, label, value,
}: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 py-2.5 px-1 rounded-md">
      <Icon className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
      <div className="flex flex-col justify-center min-w-0">
        <span className="text-xs sm:text-sm font-semibold text-foreground leading-tight">{label}</span>
        <span className="text-[11px] text-muted-foreground">{value}</span>
      </div>
    </div>
  );
}

function TimelineStepAction({
  icon: Icon, label, value, done, buttonLabel, onAction,
}: { icon: React.ElementType; label: string; value: string; done: boolean; buttonLabel: string; onAction: () => void }) {
  return (
    <div className="flex items-center gap-2 py-2.5 px-1 rounded-md">
      <Icon className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
      <div className="flex flex-col justify-center min-w-0">
        <span className="text-xs sm:text-sm font-semibold text-foreground leading-tight">{label}</span>
        {done ? (
          <span className="text-[11px] text-muted-foreground">{value}</span>
        ) : (
          <Button
            variant="link"
            size="sm"
            className="text-[11px] h-auto p-0 text-primary font-medium justify-start"
            onClick={(e) => { e.stopPropagation(); onAction(); }}
          >
            {buttonLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

function MessageDialog({
  open, title, description, message, phone, copied, confirmed, onCopy, onSend, onConfirm, onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  message: string;
  phone: string | null;
  copied: boolean;
  confirmed: boolean;
  onCopy: (msg: string) => void;
  onSend: (phone: string, msg: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/50 p-3 text-sm whitespace-pre-wrap font-mono leading-relaxed">
          {message}
        </div>

        <div className="flex flex-wrap gap-2 justify-end mt-2">
          <Button variant="outline" size="sm" onClick={() => onCopy(message)}>
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copiado!" : "Copiar"}
          </Button>
          {phone && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onSend(phone, message)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Enviar no WhatsApp
            </Button>
          )}
          <Button size="sm" onClick={onConfirm} disabled={confirmed}>
            <Check className="h-4 w-4 mr-1" />
            Confirmar envio e fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Loader2, FileText, Mail, Phone, Users, Award, CreditCard,
  Calendar, MessageCircle, StickyNote, ChevronDown, ChevronUp,
  Search, Sparkles, Check, Copy, CheckCircle2, Bell,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { countries, getCountryName } from "@/data/countries";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { openWhatsAppLink } from "@/lib/whatsapp";
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
}

export default function PendingRegistrations() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [whatsappDialog, setWhatsappDialog] = useState<{ open: boolean; reg: PendingRegistration | null }>({ open: false, reg: null });
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
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "2-digit",
      hour: "2-digit", minute: "2-digit",
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
    return "—";
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
    `Oi, ${name}! Tudo bem? 😊\nVi que você começou seu cadastro na Timol e quis passar aqui pra te dar um suporte rápido.`;

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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl md:text-2xl font-semibold mb-6">Cadastros Pendentes</h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-8">{error}</p>
        ) : registrations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum cadastro pendente encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {registrations.map((reg) => {
              const countryData = getCountryData(reg.country);
              const brazilian = isBrazilian(reg.country);
              const countryName = countryData ? getCountryName(countryData, "pt") : null;
              const isCollapsed = collapsed[reg.id] || false;
              const noteChanged = (notes[reg.id] || "") !== (savedNotes[reg.id] || "");

              return (
                <Card key={reg.id} className="overflow-hidden flex flex-col">
                  {/* Header */}
                  <CardHeader
                    className="pb-3 cursor-pointer select-none"
                    style={{ backgroundColor: "hsl(210 60% 96%)" }}
                    onClick={() => toggleCollapse(reg.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                        <Badge className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 shrink-0">
                          {getDisplayId(reg.user_display_id)}
                        </Badge>
                        <span className="text-lg font-bold truncate" title={reg.full_name || undefined}>
                          {reg.full_name || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
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
                    {[reg.city, reg.state, countryName].filter(Boolean).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {[reg.city, reg.state, countryName].filter(Boolean).join(", ")}
                        {countryData && (
                          <span title={countryName || undefined} className="ml-1">{countryData.flag}</span>
                        )}
                      </p>
                    )}
                  </CardHeader>

                  {/* Body — collapsible */}
                  {!isCollapsed && (
                    <CardContent className="pt-4 pb-3 flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Left column */}
                        <div className="space-y-2.5">
                          <InfoItem icon={FileText} label={brazilian ? "CPF" : "Documento"}>
                            <span className="truncate" title={reg.document || undefined}>
                              {reg.document || "—"}
                            </span>
                            {!brazilian && countryData && (
                              <span title={countryName || undefined} className="ml-1 shrink-0">{countryData.flag}</span>
                            )}
                          </InfoItem>
                          <InfoItem icon={Mail} label="E-mail">
                            <span className="truncate" title={reg.email}>{reg.email}</span>
                          </InfoItem>
                          <InfoItem icon={Phone} label="Telefone">
                            {reg.phone || "—"}
                          </InfoItem>
                        </div>

                        {/* Right column */}
                        <div className="space-y-2.5">
                          <InfoItem icon={Users} label="Patrocinador">
                            <span className="truncate" title={
                              reg.sponsor_id && reg.sponsor_name
                                ? `${reg.sponsor_id} – ${reg.sponsor_name}`
                                : reg.sponsor_name || reg.sponsor_id || undefined
                            }>
                              {reg.sponsor_id && reg.sponsor_name
                                ? `${reg.sponsor_id} – ${reg.sponsor_name}`
                                : reg.sponsor_name || reg.sponsor_id || "—"}
                            </span>
                            {/* Tipo de indicação — placeholder visual */}
                            <SponsorTypeBadge type="search" />
                          </InfoItem>
                          <InfoItem icon={Award} label="Franquia">
                            {reg.franchise_name || "—"}
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
                    className="px-4 py-4 flex-col items-start gap-0"
                    style={{ backgroundColor: "hsl(210 60% 96%)" }}
                  >
                    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-start gap-x-3 gap-y-1 w-full">
                      <TimelineStep
                        icon={Calendar}
                        label="Cadastro criado"
                        value={formatDateTime(reg.created_at)}
                        done={!!reg.created_at}
                      />
                      <Arrow />
                      <TimelineStep
                        icon={Mail}
                        label="Email enviado"
                        value={formatDateTime(reg.recovery_email_sent_at)}
                        done={reg.recovery_email_sent}
                      />
                      <Arrow />
                      <TimelineStepWhatsApp
                        value={formatDateTime(reg.whatsapp_recovery_sent_at)}
                        done={reg.whatsapp_recovery_sent}
                        onSend={() => setWhatsappDialog({ open: true, reg })}
                      />
                      <Arrow />
                      <TimelineStep
                        icon={Bell}
                        label="Patrocinador notificado"
                        value="—"
                        done={false}
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
      <WhatsAppDialog
        open={whatsappDialog.open}
        reg={whatsappDialog.reg}
        copied={copied}
        onCopy={handleCopyMessage}
        onSend={handleSendWhatsApp}
        onClose={() => setWhatsappDialog({ open: false, reg: null })}
        buildMessage={buildWhatsAppMessage}
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
    <span title="Busca" className="ml-1.5 shrink-0">
      <Search className="h-3.5 w-3.5 text-muted-foreground" />
    </span>
  ) : (
    <span title="Sugestão" className="ml-1.5 shrink-0">
      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
    </span>
  );
}

function TimelineStep({
  icon: Icon, label, value, done,
}: { icon: React.ElementType; label: string; value: string; done: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        {done ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" aria-hidden="true" />
        ) : (
          <Icon className="h-4 w-4 text-foreground shrink-0" aria-hidden="true" />
        )}
        <span className="text-xs font-semibold text-foreground leading-tight">{label}</span>
      </div>
      <span className="text-[11px] text-muted-foreground pl-[22px]">{value}</span>
    </div>
  );
}

function TimelineStepWhatsApp({ value, done, onSend }: { value: string; done: boolean; onSend: () => void }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        {done ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-4 w-4 text-foreground shrink-0" aria-hidden="true" />
        )}
        <span className="text-xs font-semibold text-foreground leading-tight">WhatsApp enviado</span>
      </div>
      {done ? (
        <span className="text-[11px] text-muted-foreground pl-[22px]">{value}</span>
      ) : (
        <Button
          variant="link"
          size="sm"
          className="text-[11px] h-auto p-0 pl-[22px] text-primary justify-start"
          onClick={(e) => { e.stopPropagation(); onSend(); }}
        >
          Enviar uma mensagem
        </Button>
      )}
    </div>
  );
}

function Arrow() {
  return (
    <span className="self-center text-primary/40 text-lg font-bold hidden sm:block select-none" aria-hidden="true">
      →
    </span>
  );
}

function WhatsAppDialog({
  open, reg, copied, onCopy, onSend, onClose, buildMessage,
}: {
  open: boolean;
  reg: PendingRegistration | null;
  copied: boolean;
  onCopy: (msg: string) => void;
  onSend: (phone: string, msg: string) => void;
  onClose: () => void;
  buildMessage: (name: string) => string;
}) {
  if (!reg) return null;
  const msg = buildMessage(reg.full_name || "");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar mensagem via WhatsApp</DialogTitle>
          <DialogDescription>
            Copie a mensagem abaixo ou envie diretamente pelo WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/50 p-3 text-sm whitespace-pre-wrap font-mono leading-relaxed">
          {msg}
        </div>

        <div className="flex gap-2 justify-end mt-2">
          <Button variant="outline" size="sm" onClick={() => onCopy(msg)}>
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copiado!" : "Copiar"}
          </Button>
          {reg.phone && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onSend(reg.phone!, msg)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Enviar no WhatsApp
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

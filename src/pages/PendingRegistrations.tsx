import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Loader2, FileText, Mail, Phone, Users, Award, CreditCard,
  Calendar, MessageCircle, StickyNote, ChevronDown, ChevronUp,
  SearchCheck, Sparkles, Check, Copy, Bell, AlertTriangle, X,
  CheckCircle2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FullScreenTimolLoader } from "@/components/ui/full-screen-timol-loader";
import { countries, getCountryName } from "@/data/countries";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getPendingRegistrations,
  getRegistrationNotes,
  createRegistrationNote,
  recordWhatsappTouchpoint,
  recordSponsorNotifiedTouchpoint,
  type PendingRegistrationItem,
  type RegistrationNote,
} from "@/lib/api/registrations";
import { manualApprovePayment } from "@/lib/api/payments";

type AlertLevel = "green" | "yellow" | "red" | null;
type AlertType = "whatsapp" | "sponsor";

interface FollowUpAlert {
  type: AlertType;
  level: AlertLevel;
  message: string;
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

function getDaysSinceCreation(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
}

function getWhatsappAlert(reg: PendingRegistrationItem): FollowUpAlert | null {
  if (reg.whatsappSentAt) return null;
  const days = getDaysSinceCreation(reg.createdAt);

  if (days >= 4) {
    return {
      type: "whatsapp",
      level: "red",
      message: "⚠️ ATENÇÃO: O WhatsApp ao cliente deveria ter sido enviado há dias. Essa omissão será reportada ao superior. Estamos perdendo a chance de recuperar um possível franqueado. Aja agora.",
    };
  }
  if (days >= 3) {
    return {
      type: "whatsapp",
      level: "yellow",
      message: "⏳ O WhatsApp ao cliente já deveria ter sido enviado ontem. O atraso demonstra falta de atenção com o lead. Envie a mensagem o quanto antes para não perder essa oportunidade.",
    };
  }
  if (days >= 2) {
    return {
      type: "whatsapp",
      level: "green",
      message: "📲 Hoje é dia de enviar a mensagem por WhatsApp. É importante dar atenção ao cliente no momento certo. Não deixe para depois.",
    };
  }
  return null;
}

function getSponsorAlert(reg: PendingRegistrationItem): FollowUpAlert | null {
  if (!reg.whatsappSentAt) return null;
  if (reg.sponsorNotifiedAt) return null;
  const days = getDaysSinceCreation(reg.createdAt);

  if (days >= 10) {
    return {
      type: "sponsor",
      level: "red",
      message: "⚠️ ATENÇÃO: A notificação ao patrocinador está gravemente atrasada. Essa omissão será reportada ao superior. Cada dia sem contato reduz as chances de conversão. Aja imediatamente.",
    };
  }
  if (days >= 8) {
    return {
      type: "sponsor",
      level: "yellow",
      message: "⏳ A notificação ao patrocinador já deveria ter sido enviada. O atraso compromete o acompanhamento do lead. Envie a mensagem o quanto antes.",
    };
  }
  if (days >= 7) {
    return {
      type: "sponsor",
      level: "green",
      message: "🔔 Hoje é um bom dia para notificar o patrocinador sobre este cadastro pendente. Um lembrete gentil pode ajudar a converter o lead.",
    };
  }
  return null;
}

function getAlertStyles(level: AlertLevel) {
  switch (level) {
    case "green":
      return {
        bg: "bg-emerald-50 border-emerald-200",
        text: "text-emerald-800",
        iconColor: "text-emerald-600",
        dotColor: "text-emerald-500",
      };
    case "yellow":
      return {
        bg: "bg-amber-50 border-amber-200",
        text: "text-amber-800",
        iconColor: "text-amber-600",
        dotColor: "text-amber-500",
      };
    case "red":
      return {
        bg: "bg-red-50 border-red-200",
        text: "text-red-800",
        iconColor: "text-red-600",
        dotColor: "text-red-500",
      };
    default:
      return { bg: "", text: "", iconColor: "", dotColor: "" };
  }
}

export default function PendingRegistrations() {
  const [registrations, setRegistrations] = useState<PendingRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [notesHistory, setNotesHistory] = useState<Record<string, RegistrationNote[]>>({});
  const [savingNote, setSavingNote] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [whatsappDialog, setWhatsappDialog] = useState<{ open: boolean; reg: PendingRegistrationItem | null }>({ open: false, reg: null });
  const [sponsorDialog, setSponsorDialog] = useState<{ open: boolean; reg: PendingRegistrationItem | null }>({ open: false, reg: null });
  const [copied, setCopied] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Record<string, Set<AlertType>>>({});
  const [approvingPayment, setApprovingPayment] = useState<Record<string, boolean>>({});

  useEffect(() => { document.title = "Cadastro Nova Franquia"; return () => { document.title = "Timol System"; }; }, []);

  useEffect(() => {
    async function fetchPending() {
      try {
        const response = await getPendingRegistrations();
        setRegistrations(response.items || []);
      } catch (err: any) {
        // If the API returns 404, it means the endpoint is not yet active — treat as empty list
        if (err?.status === 404) {
          setRegistrations([]);
        } else {
          console.error("Error fetching pending registrations:", err);
          setError("Erro ao carregar cadastros pendentes.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPending();
  }, []);

  // Load notes for a registration when expanded
  const loadNotes = async (franchiseId: string) => {
    if (notesHistory[franchiseId]) return; // already loaded
    try {
      const response = await getRegistrationNotes(franchiseId);
      setNotesHistory((prev) => ({ ...prev, [franchiseId]: response.notes }));
    } catch (err) {
      console.error("Error loading notes:", err);
    }
  };

  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "2-digit",
    });
  };

  const getCountryData = (iso2: string | null | undefined) => {
    if (!iso2) return null;
    return countries.find((c) => c.iso2 === iso2.toUpperCase());
  };

  const isBrazilian = (countryCode: string | null | undefined) => !countryCode || countryCode.toUpperCase() === "BR";

  const isSponsorBlocked = (reg: PendingRegistrationItem) => {
    if (!reg.whatsappSentAt) return true;
    const sentDate = new Date(reg.whatsappSentAt);
    const now = new Date();
    const diffDays = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays < 5;
  };

  const getSponsorBlockedDaysLeft = (reg: PendingRegistrationItem) => {
    if (!reg.whatsappSentAt) return 0;
    const sentDate = new Date(reg.whatsappSentAt);
    const now = new Date();
    const diffDays = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.ceil(5 - diffDays);
  };

  const isWhatsappBlocked = (reg: PendingRegistrationItem) => {
    const created = new Date(reg.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays < 2;
  };

  const getWhatsappBlockedDaysLeft = (reg: PendingRegistrationItem) => {
    const created = new Date(reg.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return Math.ceil(2 - diffDays);
  };

  const getPaymentLabel = (reg: PendingRegistrationItem) => {
    if (reg.paymentStatus === "approved" || reg.paymentStatus === "completed") return "Confirmado";
    if (reg.paymentStatus === "pending_manual_approval") return "Aguardando aprovação";
    if (reg.paymentStatus === "pending") return "Pendente";
    if (reg.paymentStatus === "rejected") return "Rejeitado";
    if (reg.franchiseTypeCode) return "Pagamento não aprovado";
    return "";
  };

  const showManualApproveButton = (reg: PendingRegistrationItem) => {
    return reg.approvalMethod === "manual" || reg.paymentStatus === "pending_manual_approval";
  };

  const getDisplayId = (raw: string | null) => {
    if (!raw) return "ID";
    const nums = raw.replace(/\D/g, "");
    return `ID ${parseInt(nums, 10) || nums}`;
  };

  const toggleCollapse = (franchiseId: string) => {
    const willExpand = collapsed[franchiseId] !== false;
    setCollapsed((prev) => ({ ...prev, [franchiseId]: !prev[franchiseId] }));
    if (willExpand) {
      loadNotes(franchiseId);
    }
  };

  const handleSaveNote = async (franchiseId: string) => {
    const noteText = notesDraft[franchiseId]?.trim();
    if (!noteText) return;
    setSavingNote((prev) => ({ ...prev, [franchiseId]: true }));
    try {
      const created = await createRegistrationNote(franchiseId, noteText);
      setNotesHistory((prev) => ({
        ...prev,
        [franchiseId]: [...(prev[franchiseId] || []), created],
      }));
      setNotesDraft((prev) => ({ ...prev, [franchiseId]: "" }));
      toast.success("Observação salva.");
    } catch (err) {
      console.error("Error saving note:", err);
      toast.error("Erro ao salvar observação.");
    } finally {
      setSavingNote((prev) => ({ ...prev, [franchiseId]: false }));
    }
  };

  const handleCancelNote = (franchiseId: string) => {
    setNotesDraft((prev) => ({ ...prev, [franchiseId]: "" }));
  };

  const getActiveAlerts = (reg: PendingRegistrationItem): FollowUpAlert[] => {
    const alerts: FollowUpAlert[] = [];
    const waAlert = getWhatsappAlert(reg);
    if (waAlert) alerts.push(waAlert);
    const spAlert = getSponsorAlert(reg);
    if (spAlert) alerts.push(spAlert);
    return alerts;
  };

  const isDismissed = (franchiseId: string, alertType: AlertType) => {
    return dismissedAlerts[franchiseId]?.has(alertType) || false;
  };

  const dismissAlert = (franchiseId: string, alertType: AlertType) => {
    setDismissedAlerts((prev) => {
      const current = prev[franchiseId] || new Set();
      const next = new Set(current);
      next.add(alertType);
      return { ...prev, [franchiseId]: next };
    });
  };

  const restoreAlert = (franchiseId: string, alertType: AlertType) => {
    setDismissedAlerts((prev) => {
      const current = prev[franchiseId];
      if (!current) return prev;
      const next = new Set(current);
      next.delete(alertType);
      return { ...prev, [franchiseId]: next };
    });
  };

  const hasDismissedAlerts = (reg: PendingRegistrationItem): FollowUpAlert[] => {
    const alerts = getActiveAlerts(reg);
    return alerts.filter((a) => isDismissed(reg.franchiseId, a.type));
  };

  const buildWhatsAppMessage = (reg: PendingRegistrationItem) => {
    const name = capitalize(reg.fullName || "");
    const lang = reg.preferredLanguage || "pt";

    if (lang === "en") {
      return `Hi, ${name}! How are you? 😊\nI noticed you started your registration at Timol and wanted to check in to offer some quick support.\n\nIf you're still evaluating or have any questions, I can explain things simply and with no commitment.\nThat way you can decide with confidence whether to continue or not 👍\n\nIf it makes sense to you, reach out and I'll help you.`;
    }
    if (lang === "es") {
      return `¡Hola, ${name}! ¿Todo bien? 😊\nVi que empezaste tu registro en Timol y quise pasar por aquí para darte un soporte rápido.\n\nSi todavía estás evaluando o te quedó alguna duda, puedo explicarte de forma simple y sin compromiso.\nAsí decides con seguridad si quieres continuar o no 👍\n\nSi tiene sentido para ti, escríbeme aquí que te ayudo.`;
    }
    return `Oi, ${name}! Tudo bem? 😊\nVi que você começou seu cadastro na Timol e quis passar aqui pra te dar um suporte rápido.\n\nSe ainda estiver avaliando ou ficou com alguma dúvida, posso te explicar de forma simples e sem compromisso.\nAssim você decide com segurança se quer continuar ou não 👍\n\nSe fizer sentido pra você, me chama aqui que eu te ajudo.`;
  };

  const formatDateOnly = (dateStr: string | null | undefined, lang?: string) => {
    if (!dateStr) return "";
    const locale = lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR";
    return new Date(dateStr).toLocaleDateString(locale, {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  const buildSponsorMessage = (reg: PendingRegistrationItem) => {
    const sponsorFirst = firstName(reg.sponsorName || null);
    const userFirst = firstName(reg.fullName);
    const userFull = capitalize(reg.fullName || "");
    const lang = reg.preferredLanguage || "pt";
    const date = formatDateOnly(reg.createdAt, lang);
    const phone = reg.phone || "";
    const location = [reg.cityId, reg.stateId, (() => { const c = getCountryData(reg.country); return c ? getCountryName(c, lang) : null; })()].filter(Boolean).join(", ");

    const fem = reg.gender === "female";

    if (lang === "en") {
      const pronoun = fem ? "her" : "him";
      const heShe = fem ? "She" : "He";
      const heSheMin = fem ? "she" : "he";
      const helpPronoun = fem ? "help her" : "help him";

      if (reg.sponsorSelectionMethod === "suggest") {
        return `Hi, ${sponsorFirst}! How are you? 😊\nYour ID was randomly suggested during a franchise registration. ${userFirst} started the process on ${date}, but hasn't completed it yet.\n\nEven if you don't know ${pronoun}, this is a good time to reach out. ${heShe} could end up being part of your network.\n\nWhen you can, introduce yourself, see if there are any questions, and try to ${helpPronoun} move forward 🤝\n\nName: ${userFull}\nContact: ${phone}\nLocation: ${location}\n\nNote: If you're unable to follow up, please let me know so I can assign another sponsor.`;
      }
      return `Hi, ${sponsorFirst}! How are you? 😊\n${userFirst} started a franchise registration on ${date}, but hasn't completed it yet.\n\nSince ${heSheMin} is in your network, your approach can make all the difference right now.\nWhen you can, it's worth a quick check to see if there are any questions and ${helpPronoun} move forward with the decision 🤝\n\nName: ${userFull}\nContact: ${phone}`;
    }

    if (lang === "es") {
      const pronEs = fem ? "la" : "lo";
      const ellaEl = fem ? "Ella" : "Él";
      const ellaElMin = fem ? "ella" : "él";
      const ayudar = fem ? "ayudarla" : "ayudarlo";

      if (reg.sponsorSelectionMethod === "suggest") {
        return `¡Hola, ${sponsorFirst}! ¿Todo bien? 😊\nTu ID fue sugerido de forma aleatoria en un registro de franquicia. ${userFirst} inició el proceso el día ${date}, pero aún no lo completó.\n\nAunque no ${pronEs} conozcas, este es un buen momento para un acercamiento. ${ellaEl} puede terminar formando parte de tu red.\n\nCuando puedas, preséntate, entiende si quedó alguna duda y ve si puedes ${ayudar} a avanzar 🤝\n\nNombre: ${userFull}\nContacto: ${phone}\nUbicación: ${location}\n\nObs.: Si no puedes hacer el seguimiento, avísame por favor para que pueda indicar otro patrocinador.`;
      }
      return `¡Hola, ${sponsorFirst}! ¿Todo bien? 😊\n${userFirst} inició el registro de una franquicia el día ${date}, pero aún no lo completó.\n\nComo ${ellaElMin} está en tu red, tu acercamiento puede marcar toda la diferencia ahora.\nCuando puedas, vale la pena un contacto rápido para entender si quedó alguna duda y ${ayudar} a avanzar en la decisión 🤝\n\nNombre: ${userFull}\nContacto: ${phone}`;
    }

    // PT (default)
    const artigo = fem ? "A" : "O";
    const pronome = fem ? "a" : "o";
    const elx = fem ? "Ela" : "Ele";
    const elxMin = fem ? "ela" : "ele";
    const ajuda = fem ? "ajudá-la" : "ajudá-lo";

    if (reg.sponsorSelectionMethod === "suggest") {
      return `Olá, ${sponsorFirst}! Tudo bem? 😊\nSeu ID foi sugerido de forma aleatória em um cadastro de franquia. ${artigo} ${userFirst} iniciou o processo no dia ${date}, mas ainda não concluiu.\n\nMesmo que você não ${pronome} conheça, esse é um bom momento para uma abordagem. ${elx} pode acabar fazendo parte da sua rede.\n\nQuando puder, se apresente, entenda se ficou alguma dúvida e veja se consegue ${ajuda} a avançar 🤝\n\nNome: ${userFull}\nContato: ${phone}\nLocalização: ${location}\n\nObs.: Caso não consiga fazer o acompanhamento, me avise por favor para que eu possa indicar outro patrocinador.`;
    }

    return `Olá, ${sponsorFirst}! Tudo bem? 😊\n${artigo} ${userFirst} iniciou o cadastro de uma franquia no dia ${date}, mas ainda não concluiu.\n\nComo ${elxMin} está na sua rede, sua abordagem pode fazer toda a diferença agora.\nQuando puder, vale dar um toque rápido pra entender se ficou alguma dúvida e ${ajuda} a avançar na decisão 🤝\n\nNome: ${userFull}\nContato: ${phone}`;
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

  const handleConfirmSent = async (reg: PendingRegistrationItem, type: "whatsapp" | "sponsor") => {
    try {
      const noteText = notesDraft[reg.franchiseId]?.trim() || undefined;
      if (type === "whatsapp") {
        const result = await recordWhatsappTouchpoint(reg.franchiseId, noteText);
        setRegistrations((prev) =>
          prev.map((r) =>
            r.franchiseId === reg.franchiseId
              ? { ...r, whatsappSentAt: result.sentAt }
              : r
          )
        );
      } else {
        const result = await recordSponsorNotifiedTouchpoint(reg.franchiseId, noteText);
        setRegistrations((prev) =>
          prev.map((r) =>
            r.franchiseId === reg.franchiseId
              ? { ...r, sponsorNotifiedAt: result.sentAt }
              : r
          )
        );
      }
      // Clear dismissed state for this alert type since it's now resolved
      setDismissedAlerts((prev) => {
        const current = prev[reg.franchiseId];
        if (!current) return prev;
        const next = new Set(current);
        next.delete(type);
        return { ...prev, [reg.franchiseId]: next };
      });
      toast.success("Envio confirmado!");
      if (type === "whatsapp") setWhatsappDialog({ open: false, reg: null });
      else setSponsorDialog({ open: false, reg: null });
    } catch (err) {
      console.error("Error confirming sent:", err);
      toast.error("Erro ao confirmar envio.");
    }
  };

  const handleManualApprove = async (reg: PendingRegistrationItem) => {
    setApprovingPayment((prev) => ({ ...prev, [reg.franchiseId]: true }));
    try {
      const result = await manualApprovePayment({
        franchiseId: reg.franchiseId,
        approved: true,
        note: `Aprovação manual do pagamento por depósito – franchiseId ${reg.franchiseId}`,
      });
      if (result.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.franchiseId === reg.franchiseId
              ? { ...r, paymentStatus: result.status || "approved" }
              : r
          )
        );
        toast.success("Pagamento aprovado com sucesso!");
      }
    } catch (err) {
      console.error("Error approving payment:", err);
      toast.error("Erro ao aprovar pagamento.");
    } finally {
      setApprovingPayment((prev) => ({ ...prev, [reg.franchiseId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl md:text-2xl font-semibold mb-6 text-center text-primary">Cadastros Pendentes</h1>

        {loading ? (
          <FullScreenTimolLoader
            mode="page"
            title="Carregando cadastros pendentes..."
            className="min-h-[320px] bg-background"
          />
        ) : error ? (
          <p className="text-center text-destructive py-8">{error}</p>
        ) : registrations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum cadastro pendente encontrado.</p>
        ) : (
          <div className="flex flex-col gap-5 items-center">
            {registrations.map((reg) => {
              const countryData = getCountryData(reg.documentCountryCode);
              const brazilian = isBrazilian(reg.documentCountryCode);
              const countryName = countryData ? getCountryName(countryData, "pt") : null;
              const isCollapsed = collapsed[reg.franchiseId] !== false;
              const noteText = notesDraft[reg.franchiseId] || "";
              const regNotes = notesHistory[reg.franchiseId] || [];

              const activeAlerts = getActiveAlerts(reg);
              const visibleAlerts = activeAlerts.filter((a) => !isDismissed(reg.franchiseId, a.type));
              const dismissedAlertsList = hasDismissedAlerts(reg);

              return (
                <Card key={reg.franchiseId} className="overflow-hidden flex flex-col w-full max-w-[600px]">
                  {/* Header */}
                  <CardHeader
                    className="pb-3 cursor-pointer select-none flex flex-col justify-center"
                    style={{ backgroundColor: "hsl(210 60% 96%)" }}
                    onClick={() => toggleCollapse(reg.franchiseId)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2.5 flex-wrap">
                          <Badge className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 shrink-0 mt-[4px]">
                            {getDisplayId(reg.franchiseId)}
                          </Badge>
                          <div className="min-w-0">
                            <span className="text-lg font-bold truncate block" title={reg.fullName || undefined}>
                              {capitalize(reg.fullName)}
                            </span>
                            <p className="text-xs text-muted-foreground min-h-[1rem]">
                              {reg.cityId
                                ? <>
                                    {[reg.cityId, reg.stateId, reg.country].filter(Boolean).join(", ")}
                                    {countryData && (
                                      <span title={countryName || undefined} className="ml-1">{countryData.flag}</span>
                                    )}
                                  </>
                                : "\u00A0"
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 mt-1">
                        {/* Dismissed alert indicator icons */}
                        {dismissedAlertsList.map((alert) => {
                          const styles = getAlertStyles(alert.level);
                          return (
                            <button
                              key={alert.type}
                              className={`p-0.5 rounded-full hover:bg-muted/60 transition-colors ${styles.dotColor}`}
                              title={alert.type === "whatsapp" ? "Alerta WhatsApp (clique para reabrir)" : "Alerta Patrocinador (clique para reabrir)"}
                              onClick={(e) => {
                                e.stopPropagation();
                                restoreAlert(reg.franchiseId, alert.type);
                              }}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          );
                        })}
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
                        <div className="space-y-2.5 sm:border-0 border-t border-border/40 pt-4 sm:pt-0">
                          <InfoItem icon={Users} label="Patrocinador">
                            {reg.sponsorSelectionMethod && (reg.sponsorFranchiseId || reg.sponsorName) && (
                              <SponsorTypeBadge type={reg.sponsorSelectionMethod === "suggest" ? "suggestion" : "search"} />
                            )}
                            <span className="truncate" title={
                              reg.sponsorFranchiseId && reg.sponsorName
                                ? `${reg.sponsorFranchiseId} – ${capitalize(reg.sponsorName)}`
                                : capitalize(reg.sponsorName || null) || reg.sponsorFranchiseId || undefined
                            }>
                              {reg.sponsorFranchiseId && reg.sponsorName
                                ? `${reg.sponsorFranchiseId} – ${capitalize(reg.sponsorName)}`
                                : capitalize(reg.sponsorName || null) || reg.sponsorFranchiseId || ""}
                            </span>
                          </InfoItem>
                          <InfoItem icon={Award} label="Franquia">
                            {reg.franchiseTypeCode || ""}
                          </InfoItem>
                          <InfoItem icon={CreditCard} label="Pagamento">
                            <span className="flex items-center gap-2">
                              {getPaymentLabel(reg)}
                              {showManualApproveButton(reg) && reg.paymentStatus !== "approved" && reg.paymentStatus !== "completed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-[10px] h-6 px-2 border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                                  onClick={(e) => { e.stopPropagation(); handleManualApprove(reg); }}
                                  disabled={approvingPayment[reg.franchiseId]}
                                >
                                  {approvingPayment[reg.franchiseId] ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  )}
                                  Aprovar
                                </Button>
                              )}
                            </span>
                          </InfoItem>
                        </div>
                      </div>

                      {/* Notes */}
                      <Separator className="mt-5 mb-0 opacity-40" />
                      <div className="mt-4">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                          <StickyNote className="h-3.5 w-3.5" aria-hidden="true" />
                          Observações
                        </label>

                        {/* Existing notes */}
                        {regNotes.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {regNotes.map((n) => (
                              <div key={n.registrationNoteId} className="rounded-md border bg-muted/30 p-2 text-xs">
                                <p className="text-foreground">{n.note}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {new Date(n.createdAt).toLocaleDateString("pt-BR", {
                                    day: "2-digit", month: "2-digit", year: "2-digit",
                                    hour: "2-digit", minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* New note input */}
                        <Textarea
                          placeholder="Anote a resposta do cliente, quais dúvidas ele tem e tente identificar por que ainda não concluiu o cadastro."
                          className="text-xs min-h-[60px] resize-y"
                          value={noteText}
                          onChange={(e) => setNotesDraft((prev) => ({ ...prev, [reg.franchiseId]: e.target.value }))}
                        />
                        {noteText.trim() && (
                          <div className="flex gap-2 mt-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => handleCancelNote(reg.franchiseId)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => handleSaveNote(reg.franchiseId)}
                              disabled={savingNote[reg.franchiseId]}
                            >
                              {savingNote[reg.franchiseId] && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                              Salvar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}

                  {/* Follow-up Alerts */}
                  {visibleAlerts.length > 0 && (
                    <div className="px-3 sm:px-5 pb-1">
                      {visibleAlerts.map((alert) => {
                        const styles = getAlertStyles(alert.level);
                        return (
                          <div
                            key={alert.type}
                            className={`relative rounded-md border p-3 mb-2 text-xs leading-relaxed ${styles.bg} ${styles.text}`}
                          >
                            <div className="flex items-start gap-2">
                              <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${styles.iconColor}`} />
                              <p className="flex-1 pr-5">{alert.message}</p>
                              <button
                                className={`absolute top-2 right-2 p-0.5 rounded hover:bg-black/5 transition-colors ${styles.iconColor}`}
                                onClick={() => dismissAlert(reg.franchiseId, alert.type)}
                                title="Fechar alerta"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
                        value={formatDateTime(reg.createdAt) || "—"}
                      />
                      <TimelineStep
                        icon={Mail}
                        label="Email"
                        value={formatDateTime(reg.recoveryEmailSentAt) || "—"}
                      />
                      <TimelineStepAction
                        icon={MessageCircle}
                        label="WhatsApp"
                        value={formatDateTime(reg.whatsappSentAt)}
                        done={!!reg.whatsappSentAt}
                        buttonLabel="Enviar"
                        buttonLabelDesktop="Enviar mensagem"
                        onAction={() => setWhatsappDialog({ open: true, reg })}
                        disabled={isWhatsappBlocked(reg)}
                        disabledText={isWhatsappBlocked(reg) ? (() => { const d = getWhatsappBlockedDaysLeft(reg); return d === 1 ? "1 dia" : `${d} dias`; })() : undefined}
                        disabledAriaLabel={isWhatsappBlocked(reg) ? (() => { const d = getWhatsappBlockedDaysLeft(reg); return `Envie a mensagem de WhatsApp em ${d === 1 ? "1 dia" : `${d} dias`}.`; })() : undefined}
                      />
                      <TimelineStepAction
                        icon={Bell}
                        label="Patrocinador"
                        value={formatDateTime(reg.sponsorNotifiedAt)}
                        done={!!reg.sponsorNotifiedAt}
                        buttonLabel="Notificar"
                        onAction={() => setSponsorDialog({ open: true, reg })}
                        disabled={isSponsorBlocked(reg)}
                        disabledText={isSponsorBlocked(reg) ? (!reg.whatsappSentAt ? "Após o WhatsApp" : (() => { const d = getSponsorBlockedDaysLeft(reg); return d === 1 ? "1 dia" : `${d} dias`; })()) : undefined}
                        disabledAriaLabel={isSponsorBlocked(reg) ? (!reg.whatsappSentAt ? "Notifique o patrocinador após enviar o WhatsApp ao cliente." : (() => { const d = getSponsorBlockedDaysLeft(reg); return `Notifique o patrocinador em ${d === 1 ? "1 dia" : `${d} dias`}.`; })()) : undefined}
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
        title="Enviar Mensagem"
        description="Mensagem modelo abaixo — copie e envie pelo WhatsApp ou ajuste como preferir."
        message={whatsappDialog.reg ? buildWhatsAppMessage(whatsappDialog.reg) : ""}
        phone={whatsappDialog.reg?.phone || null}
        copied={copied}
        confirmed={!!whatsappDialog.reg?.whatsappSentAt}
        onCopy={handleCopyMessage}
        onSend={handleSendWhatsApp}
        onConfirm={() => whatsappDialog.reg && handleConfirmSent(whatsappDialog.reg, "whatsapp")}
        onClose={() => setWhatsappDialog({ open: false, reg: null })}
      />

      {/* Sponsor Dialog */}
      <MessageDialog
        open={sponsorDialog.open}
        title="Notificar Patrocinador"
        description="Mensagem modelo abaixo — copie e envie pelo WhatsApp ou ajuste como preferir."
        message={sponsorDialog.reg ? buildSponsorMessage(sponsorDialog.reg) : ""}
        phone={sponsorDialog.reg?.phone || null}
        copied={copied}
        confirmed={!!sponsorDialog.reg?.sponsorNotifiedAt}
        onCopy={handleCopyMessage}
        onSend={handleSendWhatsApp}
        onConfirm={() => sponsorDialog.reg && handleConfirmSent(sponsorDialog.reg, "sponsor")}
        onClose={() => setSponsorDialog({ open: false, reg: null })}
      />
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function InfoItem({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  const isEmpty = !children || (typeof children === "string" && children.trim() === "");
  return (
    <div className="flex items-start gap-2 min-w-0 min-h-[36px] py-0.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground leading-none mb-0.5">{label}</p>
        <p className="text-sm font-medium flex items-center gap-0.5 min-w-0 min-h-[20px]">
          {isEmpty ? "\u00A0" : children}
        </p>
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
    <div className="flex flex-col items-center gap-1 py-2.5 px-1 sm:flex-row sm:gap-2">
      <Icon className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
      <div className="flex flex-col items-center sm:items-start min-w-0">
        <span className="hidden sm:block text-sm font-semibold text-foreground leading-tight">{label}</span>
        <span className="text-[11px] text-muted-foreground">{value}</span>
      </div>
    </div>
  );
}

function TimelineStepAction({
  icon: Icon, label, value, done, buttonLabel, buttonLabelDesktop, onAction, disabled, disabledText, disabledAriaLabel,
}: { icon: React.ElementType; label: string; value: string; done: boolean; buttonLabel: string; buttonLabelDesktop?: string; onAction: () => void; disabled?: boolean; disabledText?: string; disabledAriaLabel?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2.5 px-1 sm:flex-row sm:gap-2">
      <Icon className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
      <div className="flex flex-col items-center sm:items-start min-w-0">
        <span className="hidden sm:block text-sm font-semibold text-foreground leading-tight">{label}</span>
        {done ? (
          <span className="text-[11px] text-muted-foreground">{value}</span>
        ) : disabled ? (
          <span className="text-[11px] text-muted-foreground/60 italic cursor-default text-center sm:text-left" title={disabledAriaLabel || disabledText} aria-label={disabledAriaLabel}>
            {disabledText || "Indisponível"}
          </span>
        ) : (
          <Button
            variant="link"
            size="sm"
            className="text-[11px] h-auto p-0 text-primary font-medium"
            onClick={(e) => { e.stopPropagation(); onAction(); }}
          >
            <span className="sm:hidden">{buttonLabel}</span>
            <span className="hidden sm:inline">{buttonLabelDesktop || buttonLabel}</span>
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
  const [actionTaken, setActionTaken] = useState(false);

  const handleCopy = (msg: string) => {
    onCopy(msg);
    setActionTaken(true);
  };

  const handleSend = (ph: string, msg: string) => {
    onSend(ph, msg);
    setActionTaken(true);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setActionTaken(false); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => handleCopy(message)}>
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copiado!" : "Copiar"}
          </Button>
          {phone && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleSend(phone, message)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Enviar no WhatsApp
            </Button>
          )}
        </div>

        <div className="rounded-md border bg-muted/50 p-3 text-sm whitespace-pre-wrap font-mono leading-relaxed overflow-y-auto" style={{ maxHeight: "calc(15 * 1.65em)" }}>
          {message}
        </div>

        <div className="flex justify-end mt-2">
          <Button size="sm" onClick={onConfirm} disabled={confirmed || !actionTaken}>
            <Check className="h-4 w-4 mr-1" />
            Confirmar envio e fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

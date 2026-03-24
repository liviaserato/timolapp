import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  FileText, Mail, Phone, Users, Award, CreditCard,
  Calendar, MessageCircle, StickyNote, ChevronDown, ChevronUp,
  SearchCheck, Sparkles, Bell, AlertTriangle, X, CheckCircle2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/* ── Types ── */
interface PendingReg {
  franchiseId: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  document: string | null;
  sponsorFranchiseId: string | null;
  sponsorName: string | null;
  franchiseTypeCode: string | null;
  paymentStatus: string | null;
  createdAt: string;
  whatsappSentAt: string | null;
  sponsorNotifiedAt: string | null;
  recoveryEmailSentAt: string | null;
  gender: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  sponsorSelectionMethod: string | null;
}

/* ── Mock Data ── */
const mockPending: PendingReg[] = [
  {
    franchiseId: "200501",
    fullName: "Juliana Ferreira Costa",
    email: "juliana.ferreira@email.com",
    phone: "+55 11 98765-4321",
    document: "321.654.987-00",
    sponsorFranchiseId: "100231",
    sponsorName: "Lívia Serato",
    franchiseTypeCode: "Ouro",
    paymentStatus: "pending",
    createdAt: "2026-03-20T14:30:00Z",
    whatsappSentAt: null,
    sponsorNotifiedAt: null,
    recoveryEmailSentAt: "2026-03-21T10:00:00Z",
    gender: "female",
    city: "São Paulo",
    state: "SP",
    country: "BR",
    sponsorSelectionMethod: "search",
  },
  {
    franchiseId: "200502",
    fullName: "Ricardo Alves Santos",
    email: "ricardo.alves@email.com",
    phone: "+55 21 97654-3210",
    document: "654.321.987-00",
    sponsorFranchiseId: "100232",
    sponsorName: "Carlos Mendes",
    franchiseTypeCode: "Platina",
    paymentStatus: "pending_manual_approval",
    createdAt: "2026-03-18T09:15:00Z",
    whatsappSentAt: "2026-03-20T16:00:00Z",
    sponsorNotifiedAt: null,
    recoveryEmailSentAt: "2026-03-19T08:00:00Z",
    gender: "male",
    city: "Rio de Janeiro",
    state: "RJ",
    country: "BR",
    sponsorSelectionMethod: "search",
  },
  {
    franchiseId: "200503",
    fullName: "Camila Rodrigues",
    email: "camila.rodrigues@email.com",
    phone: "+55 31 96543-2109",
    document: "789.123.456-00",
    sponsorFranchiseId: null,
    sponsorName: null,
    franchiseTypeCode: "Bronze",
    paymentStatus: "pending",
    createdAt: "2026-03-15T18:45:00Z",
    whatsappSentAt: "2026-03-17T11:00:00Z",
    sponsorNotifiedAt: "2026-03-22T14:00:00Z",
    recoveryEmailSentAt: "2026-03-16T09:00:00Z",
    gender: "female",
    city: "Belo Horizonte",
    state: "MG",
    country: "BR",
    sponsorSelectionMethod: "suggest",
  },
  {
    franchiseId: "200504",
    fullName: "Pedro Augusto Lima",
    email: "pedro.augusto@email.com",
    phone: "+34 612 987 654",
    document: "B98765432",
    sponsorFranchiseId: "100238",
    sponsorName: "Juan García López",
    franchiseTypeCode: "Prata",
    paymentStatus: null,
    createdAt: "2026-03-22T12:00:00Z",
    whatsappSentAt: null,
    sponsorNotifiedAt: null,
    recoveryEmailSentAt: null,
    gender: "male",
    city: "Madrid",
    state: "MD",
    country: "ES",
    sponsorSelectionMethod: "search",
  },
];

/* ── Helpers ── */
function capitalize(str: string | null): string {
  if (!str) return "";
  return str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function getDisplayId(raw: string | null) {
  if (!raw) return "ID";
  const nums = raw.replace(/\D/g, "");
  return `ID ${parseInt(nums, 10) || nums}`;
}

function getDaysSince(dateStr: string) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

type AlertLevel = "green" | "yellow" | "red";

function getWhatsappAlert(reg: PendingReg): { level: AlertLevel; message: string } | null {
  if (reg.whatsappSentAt) return null;
  const days = getDaysSince(reg.createdAt);
  if (days >= 4) return { level: "red", message: "⚠️ WhatsApp ao cliente deveria ter sido enviado há dias." };
  if (days >= 3) return { level: "yellow", message: "⏳ WhatsApp ao cliente já deveria ter sido enviado." };
  if (days >= 2) return { level: "green", message: "📲 Hoje é dia de enviar a mensagem por WhatsApp." };
  return null;
}

function getSponsorAlert(reg: PendingReg): { level: AlertLevel; message: string } | null {
  if (!reg.whatsappSentAt || reg.sponsorNotifiedAt) return null;
  const days = getDaysSince(reg.createdAt);
  if (days >= 10) return { level: "red", message: "⚠️ Notificação ao patrocinador gravemente atrasada." };
  if (days >= 8) return { level: "yellow", message: "⏳ Notificação ao patrocinador atrasada." };
  if (days >= 7) return { level: "green", message: "🔔 Hoje é um bom dia para notificar o patrocinador." };
  return null;
}

const alertStyles: Record<AlertLevel, { bg: string; text: string; icon: string }> = {
  green: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", icon: "text-emerald-600" },
  yellow: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", icon: "text-amber-600" },
  red: { bg: "bg-red-50 border-red-200", text: "text-red-800", icon: "text-red-600" },
};

/* ── Component ── */
export default function PendingRegistrationsPanel() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [dismissedAlerts, setDismissedAlerts] = useState<Record<string, Set<string>>>({});

  const registrations = mockPending;

  if (registrations.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
        <p className="text-lg font-medium text-foreground mb-1">Tudo em dia!</p>
        <p className="text-sm text-muted-foreground">Não há cadastros pendentes no momento.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 items-center">
      {registrations.map((reg) => {
        const isCollapsed = collapsed[reg.franchiseId] !== false;
        const noteText = notesDraft[reg.franchiseId] || "";
        const waAlert = getWhatsappAlert(reg);
        const spAlert = getSponsorAlert(reg);
        const alerts = [waAlert, spAlert].filter(Boolean) as { level: AlertLevel; message: string }[];
        const dismissed = dismissedAlerts[reg.franchiseId] || new Set();

        return (
          <Card key={reg.franchiseId} className="overflow-hidden flex flex-col w-full max-w-[600px]">
            {/* Header */}
            <CardHeader
              className="pb-3 cursor-pointer select-none flex flex-col justify-center"
              style={{ backgroundColor: "hsl(210 60% 96%)" }}
              onClick={() => setCollapsed(prev => ({ ...prev, [reg.franchiseId]: !prev[reg.franchiseId] }))}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2.5 flex-wrap">
                    <Badge className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 shrink-0 mt-[4px]">
                      {getDisplayId(reg.franchiseId)}
                    </Badge>
                    <div className="min-w-0">
                      <span className="text-lg font-bold truncate block">{capitalize(reg.fullName)}</span>
                      <p className="text-xs text-muted-foreground">
                        {[reg.city, reg.state, reg.country].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 mt-1">
                  <Badge variant="outline" className="text-[10px] px-2 py-0 border-amber-400 text-amber-600">
                    Pendente
                  </Badge>
                  {isCollapsed ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronUp className="h-5 w-5 text-muted-foreground" />}
                </div>
              </div>
            </CardHeader>

            {/* Body */}
            {!isCollapsed && (
              <CardContent className="pt-4 pb-3 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2.5">
                    <InfoRow icon={FileText} label="Documento" value={reg.document || ""} />
                    <InfoRow icon={Mail} label="E-mail" value={reg.email} />
                    <InfoRow icon={Phone} label="Telefone" value={reg.phone || ""} />
                  </div>
                  <div className="space-y-2.5 sm:border-0 border-t border-border/40 pt-4 sm:pt-0">
                    <div className="flex items-start gap-2 min-h-[36px] py-0.5">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-muted-foreground leading-none mb-0.5">Patrocinador</p>
                        <p className="text-sm font-medium flex items-center gap-0.5">
                          {reg.sponsorSelectionMethod === "suggest" && <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />}
                          {reg.sponsorSelectionMethod === "search" && <SearchCheck className="h-3 w-3 text-muted-foreground/70 shrink-0" />}
                          <span className="truncate">
                            {reg.sponsorFranchiseId && reg.sponsorName
                              ? `${reg.sponsorFranchiseId} – ${capitalize(reg.sponsorName)}`
                              : capitalize(reg.sponsorName) || reg.sponsorFranchiseId || "—"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <InfoRow icon={Award} label="Franquia" value={reg.franchiseTypeCode || ""} />
                    <InfoRow icon={CreditCard} label="Pagamento" value={
                      reg.paymentStatus === "pending_manual_approval" ? "Aguardando aprovação"
                        : reg.paymentStatus === "pending" ? "Pendente"
                        : reg.paymentStatus || "—"
                    } />
                  </div>
                </div>

                {/* Notes */}
                <Separator className="mt-5 mb-0 opacity-40" />
                <div className="mt-4">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                    <StickyNote className="h-3.5 w-3.5" />
                    Observações
                  </label>
                  <Textarea
                    placeholder="Anote a resposta do cliente, quais dúvidas ele tem..."
                    className="text-xs min-h-[60px] resize-y"
                    value={noteText}
                    onChange={e => setNotesDraft(prev => ({ ...prev, [reg.franchiseId]: e.target.value }))}
                  />
                </div>
              </CardContent>
            )}

            {/* Alerts */}
            {alerts.filter(a => !dismissed.has(a.message)).length > 0 && (
              <div className="px-3 sm:px-5 pb-1">
                {alerts.filter(a => !dismissed.has(a.message)).map(alert => {
                  const s = alertStyles[alert.level];
                  return (
                    <div key={alert.message} className={`relative rounded-md border p-3 mb-2 text-xs leading-relaxed ${s.bg} ${s.text}`}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${s.icon}`} />
                        <p className="flex-1 pr-5">{alert.message}</p>
                        <button
                          className={`absolute top-2 right-2 p-0.5 rounded hover:bg-black/5 ${s.icon}`}
                          onClick={() => setDismissedAlerts(prev => {
                            const next = new Set(prev[reg.franchiseId] || []);
                            next.add(alert.message);
                            return { ...prev, [reg.franchiseId]: next };
                          })}
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
            <CardFooter className="px-2 sm:px-5 py-4 flex-col items-stretch gap-0" style={{ backgroundColor: "hsl(210 60% 96%)" }}>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-3 w-full">
                <TimelineStep icon={Calendar} label="Cadastro" value={formatDateTime(reg.createdAt) || "—"} />
                <TimelineStep icon={Mail} label="Email" value={formatDateTime(reg.recoveryEmailSentAt) || "—"} />
                <TimelineStep icon={MessageCircle} label="WhatsApp" value={formatDateTime(reg.whatsappSentAt) || "—"} done={!!reg.whatsappSentAt} />
                <TimelineStep icon={Bell} label="Patrocinador" value={formatDateTime(reg.sponsorNotifiedAt) || "—"} done={!!reg.sponsorNotifiedAt} />
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

/* ── Sub-components ── */
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 min-h-[36px] py-0.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground leading-none mb-0.5">{label}</p>
        <p className="text-sm font-medium truncate">{value || "\u00A0"}</p>
      </div>
    </div>
  );
}

function TimelineStep({ icon: Icon, label, value, done }: { icon: React.ElementType; label: string; value: string; done?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2.5 px-1 sm:flex-row sm:gap-2">
      <Icon className={`h-5 w-5 shrink-0 ${done ? "text-emerald-500" : "text-muted-foreground"}`} />
      <div className="flex flex-col items-center sm:items-start min-w-0">
        <span className="hidden sm:block text-sm font-semibold text-foreground leading-tight">{label}</span>
        <span className="text-[11px] text-muted-foreground">{value}</span>
      </div>
    </div>
  );
}

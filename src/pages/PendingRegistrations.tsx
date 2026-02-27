import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Loader2, FileText, Mail, Phone, Users, Award, CreditCard, Calendar, MessageCircle, StickyNote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { countries, getCountryName } from "@/data/countries";
import { Separator } from "@/components/ui/separator";

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

  useEffect(() => {
    async function fetchPending() {
      try {
        const { data, error } = await supabase.functions.invoke(
          "get-pending-registrations"
        );
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
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCountryData = (iso2: string | null) => {
    if (!iso2) return null;
    return countries.find(c => c.iso2 === iso2.toUpperCase());
  };

  const isBrazilian = (countryIso: string | null) => {
    return !countryIso || countryIso.toUpperCase() === "BR";
  };

  const getPaymentLabel = (reg: PendingRegistration) => {
    if (reg.payment_completed) return "Confirmado";
    if (reg.franchise_selected) return "Pagamento não confirmado";
    return "—";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl md:text-2xl font-semibold mb-6">Cadastros Pendentes</h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-8">{error}</p>
        ) : registrations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum cadastro pendente encontrado.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {registrations.map((reg) => {
              const countryData = getCountryData(reg.country);
              const brazilian = isBrazilian(reg.country);
              const countryName = countryData ? getCountryName(countryData, "pt") : null;

              return (
                <Card key={reg.id} className="overflow-hidden flex flex-col">
                  {/* Header */}
                  <CardHeader className="pb-3 bg-muted/40">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Badge variant="default" className="text-xs font-semibold px-2.5 py-0.5 shrink-0">
                        {reg.user_display_id || "—"}
                      </Badge>
                      <span
                        className="text-lg font-bold truncate"
                        title={reg.full_name || undefined}
                      >
                        {reg.full_name || "—"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {[reg.city, reg.state, countryName].filter(Boolean).join(", ") || "—"}
                      {countryData && (
                        <span title={countryName || undefined} className="ml-1">
                          {countryData.flag}
                        </span>
                      )}
                    </p>
                  </CardHeader>

                  {/* Body */}
                  <CardContent className="pt-4 pb-3 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Left column */}
                      <div className="space-y-2.5">
                        <InfoItem
                          icon={FileText}
                          label={brazilian ? "CPF" : "Documento"}
                        >
                          <span className="truncate" title={reg.document || undefined}>
                            {reg.document || "—"}
                          </span>
                          {!brazilian && countryData && (
                            <span title={countryName || undefined} className="ml-1 shrink-0">
                              {countryData.flag}
                            </span>
                          )}
                        </InfoItem>
                        <InfoItem icon={Mail} label="E-mail">
                          <span className="truncate" title={reg.email}>
                            {reg.email}
                          </span>
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
                        onChange={(e) =>
                          setNotes((prev) => ({ ...prev, [reg.id]: e.target.value }))
                        }
                      />
                    </div>
                  </CardContent>

                  {/* Footer timeline */}
                  <Separator />
                  <CardFooter className="bg-muted/60 px-4 py-4 flex-col items-start gap-0">
                    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-x-2 gap-y-1 w-full">
                      <TimelineBlock
                        icon={Calendar}
                        label="Data do cadastro"
                        value={formatDateTime(reg.created_at)}
                      />
                      <span className="text-muted-foreground/50 self-center text-sm font-bold hidden sm:block" aria-hidden="true">→</span>
                      <TimelineBlock
                        icon={Mail}
                        label="Email enviado"
                        value={formatDateTime(reg.recovery_email_sent_at)}
                      />
                      <span className="text-muted-foreground/50 self-center text-sm font-bold hidden sm:block" aria-hidden="true">→</span>
                      <TimelineBlock
                        icon={MessageCircle}
                        label="WhatsApp enviado"
                        value={formatDateTime(reg.whatsapp_recovery_sent_at)}
                      />
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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

function TimelineBlock({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-foreground shrink-0" aria-hidden="true" />
        <span className="text-xs font-semibold text-foreground">{label}</span>
      </div>
      <span className="text-xs text-muted-foreground pl-5">{value}</span>
    </div>
  );
}

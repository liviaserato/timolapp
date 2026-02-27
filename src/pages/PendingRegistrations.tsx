import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Loader2, FileText, Mail, Phone, Users, Award, CreditCard, ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { countries, getCountryName } from "@/data/countries";

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
    // If franchise was selected, user likely attempted payment
    if (reg.franchise_selected) return "Pagamento não confirmado";
    return "—";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {registrations.map((reg) => {
              const countryData = getCountryData(reg.country);
              const brazilian = isBrazilian(reg.country);

              return (
                <Card key={reg.id} className="overflow-hidden flex flex-col">
                  {/* Header */}
                  <CardHeader className="pb-3 bg-muted/40">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-medium text-primary">
                        {reg.user_display_id || "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">|</span>
                      <span className="text-base font-bold">{reg.full_name || "—"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[reg.city, reg.state].filter(Boolean).join(", ") || "—"}
                      {countryData && (
                        <span title={getCountryName(countryData, "pt")} className="ml-1">
                          {countryData.flag}
                        </span>
                      )}
                    </p>
                  </CardHeader>

                  {/* Body: 2 columns */}
                  <CardContent className="pt-4 pb-3 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Left column */}
                      <div className="space-y-2.5">
                        <InfoItem
                          icon={FileText}
                          label={brazilian ? "CPF" : "Documento"}
                        >
                          <span>{reg.document || "—"}</span>
                          {!brazilian && countryData && (
                            <span title={getCountryName(countryData, "pt")} className="ml-1">
                              {countryData.flag}
                            </span>
                          )}
                        </InfoItem>
                        <InfoItem icon={Mail} label="E-mail">
                          {reg.email}
                        </InfoItem>
                        <InfoItem icon={Phone} label="Telefone">
                          {reg.phone || "—"}
                        </InfoItem>
                      </div>

                      {/* Right column */}
                      <div className="space-y-2.5">
                        <InfoItem icon={Users} label="Patrocinador">
                          {reg.sponsor_id && reg.sponsor_name
                            ? `${reg.sponsor_id} – ${reg.sponsor_name}`
                            : reg.sponsor_name || reg.sponsor_id || "—"}
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
                  <CardFooter className="bg-muted/40 px-4 py-3 flex-col items-start gap-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground w-full">
                      <TimelineItem label="Data Cadastro" value={formatDateTime(reg.created_at)} />
                      <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/60 hidden sm:block" aria-hidden="true" />
                      <TimelineItem label="Email enviado" value={formatDateTime(reg.recovery_email_sent_at)} />
                      <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/60 hidden sm:block" aria-hidden="true" />
                      <TimelineItem label="WhatsApp enviado" value={formatDateTime(reg.whatsapp_recovery_sent_at)} />
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
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground leading-none mb-0.5">{label}</p>
        <p className="text-sm font-medium break-all">{children}</p>
      </div>
    </div>
  );
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-medium">{label}</span>
      <span>{value}</span>
    </span>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, User, FileText, MapPin, Hash, Users, Mail, Phone, Calendar, Award, CreditCard, Send } from "lucide-react";

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
  whatsapp_recovery_sent: boolean;
}

export default function PendingRegistrations() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLocation = (city: string | null, state: string | null, country: string | null) => {
    return [city, state, country].filter(Boolean).join(", ") || "—";
  };

  const formatSponsor = (sponsorId: string | null, sponsorName: string | null) => {
    if (sponsorId && sponsorName) {
      return `${sponsorId} - ${sponsorName}`;
    }
    return sponsorName || sponsorId || "—";
  };

  const StatusIcon = ({ value }: { value: boolean }) =>
    value ? (
      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
    ) : (
      <X className="h-4 w-4 text-destructive" />
    );

  const InfoRow = ({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) => (
    <div className="flex items-start gap-2 py-1.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <span className="text-xs text-muted-foreground shrink-0 w-24">{label}</span>
      <span className="text-sm font-medium break-all">{children}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
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
          <div className="flex flex-col gap-4">
            {registrations.map((reg) => (
              <Card key={reg.id} className="overflow-hidden">
                <CardHeader className="pb-3 bg-muted/30">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base font-bold tracking-wide">
                      {reg.user_display_id || "—"}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      Pendente
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground font-medium">{reg.full_name || "—"}</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-0 divide-y divide-border/50">
                  <InfoRow icon={FileText} label="CPF">{reg.document || "—"}</InfoRow>
                  <InfoRow icon={MapPin} label="Localização">{formatLocation(reg.city, reg.state, reg.country)}</InfoRow>
                  <InfoRow icon={Users} label="Patrocinador">{formatSponsor(reg.sponsor_id, reg.sponsor_name)}</InfoRow>
                  <InfoRow icon={Mail} label="E-mail">{reg.email}</InfoRow>
                  <InfoRow icon={Phone} label="Telefone">{reg.phone || "—"}</InfoRow>
                  <InfoRow icon={Calendar} label="Data cadastro">{formatDate(reg.created_at)}</InfoRow>
                  <InfoRow icon={Award} label="Franquia">{reg.franchise_name || "—"}</InfoRow>
                  <InfoRow icon={CreditCard} label="Pagamento">
                    <Badge variant={reg.payment_completed ? "default" : "secondary"}>
                      {reg.payment_completed ? "Sim" : "Não"}
                    </Badge>
                  </InfoRow>
                  <div className="flex items-center gap-6 py-2">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">E-mail</span>
                      <StatusIcon value={reg.recovery_email_sent} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Send className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">WhatsApp</span>
                      <StatusIcon value={reg.whatsapp_recovery_sent} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

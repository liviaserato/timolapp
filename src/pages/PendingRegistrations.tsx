import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2 } from "lucide-react";

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

  const StatusIcon = ({ value }: { value: boolean }) =>
    value ? (
      <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
    ) : (
      <span className="text-muted-foreground">—</span>
    );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">
            Cadastros Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Patrocinador</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead>Franquia selecionada</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-center">E-mail Enviado</TableHead>
                    <TableHead className="text-center">WhatsApp Enviado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {reg.full_name || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {reg.document || "—"}
                      </TableCell>
                      <TableCell>{reg.city || "—"}</TableCell>
                      <TableCell>{reg.state || "—"}</TableCell>
                      <TableCell>{reg.country || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {reg.user_display_id || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {reg.sponsor_name || reg.sponsor_id || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {reg.email}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {reg.phone || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(reg.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={reg.franchise_selected ? "default" : "secondary"}
                        >
                          {reg.franchise_selected ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={reg.payment_completed ? "default" : "secondary"}
                        >
                          {reg.payment_completed ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusIcon value={reg.recovery_email_sent} />
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusIcon value={reg.whatsapp_recovery_sent} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

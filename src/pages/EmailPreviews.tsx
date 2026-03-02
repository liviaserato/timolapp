import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildPendingEmailHtml,
  buildCompletedEmailHtml,
  getPendingSubject,
  getCompletedSubject,
} from "@/lib/emailTemplates";

const siteUrl = window.location.origin;

const pendingHtml = buildPendingEmailHtml({
  fullName: "Maria Silva",
  userId: "1587",
  document: "123.456.789-00",
  sponsorName: "João Santos",
  sponsorId: "842",
  continueToken: "abc123-demo-token",
  language: "pt",
  siteUrl,
});

const completedHtml = buildCompletedEmailHtml({
  fullName: "Maria Silva",
  userId: "1587",
  document: "123.456.789-00",
  sponsorName: "João Santos",
  sponsorId: "842",
  franchiseName: "Ouro",
  paymentMethod: "credit",
  cardLast4: "4521",
  cardInstallments: 3,
  installmentValue: "R$ 333,00",
  email: "maria@exemplo.com",
  username: "maria.silva",
  language: "pt",
  siteUrl,
});

const pendingSubject = getPendingSubject("pt");
const completedSubject = getCompletedSubject("pt");

export default function EmailPreviews() {
  return (
    <div className="min-h-screen bg-muted/40 py-8 px-4">
      <div className="mx-auto max-w-[700px]">
        <h1 className="text-xl font-bold text-foreground mb-1">Preview de E-mails</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Visualize os modelos de e-mail com dados fictícios antes de integrar o envio real.
        </p>

        <Tabs defaultValue="pending">
          <TabsList className="w-full">
            <TabsTrigger value="pending" className="flex-1">Cadastro Pendente</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">Cadastro Concluído</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="rounded-lg border bg-background shadow-sm overflow-hidden">
              <div className="bg-muted px-4 py-2 text-xs text-muted-foreground border-b space-y-0.5">
                <div><strong>Para:</strong> maria@exemplo.com</div>
                <div><strong>Assunto:</strong> {pendingSubject}</div>
              </div>
              <iframe
                srcDoc={pendingHtml}
                title="E-mail Cadastro Pendente"
                className="w-full border-0"
                style={{ minHeight: 900 }}
              />
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="rounded-lg border bg-background shadow-sm overflow-hidden">
              <div className="bg-muted px-4 py-2 text-xs text-muted-foreground border-b space-y-0.5">
                <div><strong>Para:</strong> maria@exemplo.com</div>
                <div><strong>Assunto:</strong> {completedSubject}</div>
              </div>
              <iframe
                srcDoc={completedHtml}
                title="E-mail Cadastro Concluído"
                className="w-full border-0"
                style={{ minHeight: 1000 }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

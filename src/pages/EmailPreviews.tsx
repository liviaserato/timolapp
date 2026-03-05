import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildCompletedEmailHtml,
  buildPasswordChangedEmailHtml,
  buildPasswordResetPinEmailHtml,
  buildPendingEmailHtml,
} from "@/lib/emailTemplates";
import { cn } from "@/lib/utils";

const siteUrl = window.location.origin;

const pendingHtml = buildPendingEmailHtml({
  fullName: "Maria Silva",
  franchiseId: "1587",
  document: "123.456.789-00",
  sponsorName: "João Santos",
  sponsorId: "842",
  continueToken: "abc123-demo-token",
  language: "pt",
  siteUrl,
});

const completedHtml = buildCompletedEmailHtml({
  fullName: "Maria Silva",
  franchiseId: "1587",
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

const resetPin = "483921";
const recoveryPinHtml = buildPasswordResetPinEmailHtml({
  fullName: "Lívia Serato",
  pin: resetPin,
  language: "pt",
  siteUrl,
});

const passwordChangedHtml = buildPasswordChangedEmailHtml({
  fullName: "Lívia Serato",
  language: "pt",
  siteUrl,
});

export default function EmailPreviews() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const emailCards = useMemo(
    () => [
      {
        id: "pending",
        badge: "Cadastro",
        title: "Cadastro pendente",
        description: "Recuperação do cadastro incompleto com CTA para continuar.",
        subject: "Continue seu cadastro Timol",
        from: "contato@timol.com.br",
        to: "maria@exemplo.com",
        html: pendingHtml,
        minHeight: 900,
      },
      {
        id: "completed",
        badge: "Cadastro",
        title: "Cadastro concluído",
        description: "Confirmação de franquia ativada com dados de primeiro acesso.",
        subject: "Sua franquia Timol foi ativada",
        from: "contato@timol.com.br",
        to: "maria@exemplo.com",
        html: completedHtml,
        minHeight: 1000,
      },
      {
        id: "recovery-pin",
        badge: "Segurança",
        title: "PIN de recuperação",
        description: "PIN válido por 5 minutos com alerta antifraude.",
        subject: "Seu PIN de recuperação Timol",
        from: "noreply@timol.com.br",
        to: "livia@exemplo.com",
        html: recoveryPinHtml,
        minHeight: 760,
      },
      {
        id: "pw-changed",
        badge: "Segurança",
        title: "Senha alterada",
        description: "Confirmação da troca de senha com orientação de suporte.",
        subject: "Sua senha foi alterada",
        from: "noreply@timol.com.br",
        to: "livia@exemplo.com",
        html: passwordChangedHtml,
        minHeight: 700,
      },
    ],
    []
  );

  const activeEmail = emailCards.find((email) => email.id === selectedEmail) ?? null;

  return (
    <div className="min-h-screen bg-muted/40 py-8 px-4">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground">Preview de E-mails</h1>
          <p className="text-sm text-muted-foreground">
            Escolha um modelo abaixo para abrir o preview com dados fictícios.
          </p>
        </div>


        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {emailCards.map((email) => {
            const isActive = activeEmail?.id === email.id;

            return (
              <button
                key={email.id}
                type="button"
                onClick={() => setSelectedEmail(email.id)}
                className="text-left"
              >
                <Card
                  className={cn(
                    "h-full rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg",
                    isActive && "border-primary shadow-lg ring-2 ring-primary/20"
                  )}
                >
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base leading-snug text-foreground">{email.title}</CardTitle>
                      <span className="inline-flex shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary-foreground">
                        {email.badge}
                      </span>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {email.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </button>
            );
          })}
        </div>

        {activeEmail ? (
          <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader className="space-y-4 border-b border-primary/15 bg-primary/10">
              <div>
                <CardTitle className="text-xl font-bold text-foreground">E-mail {activeEmail.title}</CardTitle>
              </div>

              <div className="grid gap-3 text-sm md:grid-cols-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/60">Assunto</p>
                  <p className="mt-1 text-foreground">{activeEmail.subject}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/60">De</p>
                  <p className="mt-1 text-foreground">{activeEmail.from}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/60">Para</p>
                  <p className="mt-1 text-foreground">{activeEmail.to}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <iframe
                srcDoc={activeEmail.html}
                title={`Preview ${activeEmail.title}`}
                className="w-full border-0 bg-background"
                style={{ minHeight: activeEmail.minHeight }}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

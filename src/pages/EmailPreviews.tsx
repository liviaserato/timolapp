import { useMemo, useState } from "react";
import { TimolLoader } from "@/components/ui/timol-loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildCompletedEmailHtml,
  buildPasswordChangedEmailHtml,
  buildPasswordResetPinEmailHtml,
  buildPendingEmailHtml,
  getCompletedSubject,
  getPasswordChangedSubject,
  getPasswordResetPinSubject,
  getPendingSubject,
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
        from: "contato@timol.com.br",
        to: "maria@exemplo.com",
        subject: getPendingSubject("pt"),
        html: pendingHtml,
        minHeight: 900,
      },
      {
        id: "completed",
        badge: "Cadastro",
        title: "Cadastro concluído",
        description: "Confirmação de franquia ativada com dados de primeiro acesso.",
        from: "contato@timol.com.br",
        to: "maria@exemplo.com",
        subject: getCompletedSubject("pt"),
        html: completedHtml,
        minHeight: 1000,
      },
      {
        id: "recovery-pin",
        badge: "Segurança",
        title: "PIN de recuperação",
        description: "Código com validade de 5 minutos e alerta antifraude no corpo do e-mail.",
        from: "noreply@timol.com.br",
        to: "liviaserato@yahoo.com.br",
        subject: getPasswordResetPinSubject(resetPin, "pt"),
        html: recoveryPinHtml,
        minHeight: 760,
      },
      {
        id: "pw-changed",
        badge: "Segurança",
        title: "Senha alterada",
        description: "Confirmação da troca de senha com orientação de suporte.",
        from: "noreply@timol.com.br",
        to: "liviaserato@yahoo.com.br",
        subject: getPasswordChangedSubject("pt"),
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

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div>
            <p className="text-sm font-medium text-foreground">Preview do loader</p>
            <p className="text-xs text-muted-foreground">Produtos dentro da garrafa com água subindo.</p>
          </div>
          <TimolLoader size={120} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                  <CardHeader className="space-y-3 pb-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-foreground">
                        {email.badge}
                      </span>
                      <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{email.title}</CardTitle>
                      <CardDescription className="mt-2 text-sm leading-relaxed">
                        {email.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs text-muted-foreground">
                    <div className="rounded-xl bg-muted/60 p-3">
                      <p className="mb-1 font-medium text-foreground">Assunto</p>
                      <p className="line-clamp-3">{email.subject}</p>
                    </div>
                    <div className="space-y-1">
                      <p>
                        <strong className="text-foreground">De:</strong> {email.from}
                      </p>
                      <p>
                        <strong className="text-foreground">Para:</strong> {email.to}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="text-base text-foreground">
              {activeEmail ? activeEmail.title : "Selecione um e-mail para visualizar"}
            </CardTitle>
            <CardDescription>
              {activeEmail
                ? "O preview só é carregado depois que você escolhe um card."
                : "Nenhum preview aberto ainda."}
            </CardDescription>
          </CardHeader>

          {activeEmail ? (
            <>
              <div className="space-y-0.5 border-b border-border bg-background px-4 py-3 text-xs text-muted-foreground">
                <div>
                  <strong className="text-foreground">De:</strong> {activeEmail.from}
                </div>
                <div>
                  <strong className="text-foreground">Para:</strong> {activeEmail.to}
                </div>
                <div>
                  <strong className="text-foreground">Assunto:</strong> {activeEmail.subject}
                </div>
              </div>
              <iframe
                srcDoc={activeEmail.html}
                title={`Preview ${activeEmail.title}`}
                className="w-full border-0 bg-background"
                style={{ minHeight: activeEmail.minHeight }}
              />
            </>
          ) : (
            <CardContent className="flex min-h-[260px] items-center justify-center p-8 text-center text-sm text-muted-foreground">
              Clique em um card acima para abrir o preview correspondente.
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        html: pendingHtml,
        minHeight: 900,
      },
      {
        id: "completed",
        badge: "Cadastro",
        title: "Cadastro concluído",
        description: "Confirmação de franquia ativada com dados de primeiro acesso.",
        html: completedHtml,
        minHeight: 1000,
      },
      {
        id: "recovery-pin",
        badge: "Segurança",
        title: "PIN de recuperação",
        description: "Código com validade de 5 minutos e alerta antifraude no corpo do e-mail.",
        html: recoveryPinHtml,
        minHeight: 760,
      },
      {
        id: "pw-changed",
        badge: "Segurança",
        title: "Senha alterada",
        description: "Confirmação da troca de senha com orientação de suporte.",
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
                  <CardHeader className="space-y-3 pb-5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-foreground">
                        {email.badge}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{email.title}</CardTitle>
                      <CardDescription className="mt-2 text-sm leading-relaxed">
                        {email.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </button>
            );
          })}
        </div>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            {activeEmail ? activeEmail.title : "Selecione um e-mail para visualizar"}
          </h2>

          {activeEmail ? (
            <iframe
              srcDoc={activeEmail.html}
              title={`Preview ${activeEmail.title}`}
              className="w-full bg-background"
              style={{ minHeight: activeEmail.minHeight }}
            />
          ) : (
            <div className="flex min-h-[260px] items-center justify-center text-center text-sm text-muted-foreground">
              Clique em um card acima para abrir o preview correspondente.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

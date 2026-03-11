/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface TicketClosedEmailProps {
  fullName: string
  ticketNumero: string
  ticketAssunto: string
  feedbackPositiveUrl: string
  feedbackNegativeUrl: string
}

const LOGO_URL =
  'https://sinflvoxbphblalcsaba.supabase.co/storage/v1/object/public/email-assets/logo-timol-azul-escuro.svg'

export const TicketClosedEmail = ({
  fullName,
  ticketNumero,
  ticketAssunto,
  feedbackPositiveUrl,
  feedbackNegativeUrl,
}: TicketClosedEmailProps) => {
  const firstName = fullName.split(' ')[0]

  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>Chamado {ticketNumero} concluído — Como foi o atendimento?</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} alt="Timol" height="44" style={logo} />

          <Heading style={h1}>Chamado Concluído</Heading>

          <Text style={text}>
            Olá, {firstName}.
          </Text>

          <Text style={text}>
            Seu chamado <strong>{ticketNumero}</strong> — <em>"{ticketAssunto}"</em> — foi concluído pela nossa equipe.
          </Text>

          <Text style={text}>
            Gostaríamos de saber: <strong>você ficou satisfeito com o atendimento?</strong>
          </Text>

          <Section style={buttonRow}>
            <Link href={feedbackPositiveUrl} style={btnPositive}>
              👍 Sim, fiquei satisfeito
            </Link>
          </Section>

          <Section style={{ ...buttonRow, marginTop: '12px' }}>
            <Link href={feedbackNegativeUrl} style={btnNegative}>
              👎 Não, preciso de mais ajuda
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Sua opinião é muito importante para melhorarmos nosso atendimento.
          </Text>

          <Text style={text}>
            Abraços,
            <br />
            <strong>Equipe Timol</strong>
          </Text>

          <Hr style={hrLight} />
          <Text style={footerCompany}>Timol Produtos Magnéticos</Text>
          <Text style={footerText}>contato@timol.com.br</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default TicketClosedEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Segoe UI', Roboto, Arial, sans-serif" }
const container = { padding: '40px 24px', maxWidth: '600px', margin: '0 auto' }
const logo = { marginBottom: '28px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#020817',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#64748b',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const buttonRow = {
  textAlign: 'center' as const,
}
const btnBase = {
  display: 'inline-block',
  padding: '14px 32px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  width: '100%',
  maxWidth: '320px',
}
const btnPositive = {
  ...btnBase,
  backgroundColor: '#16a34a',
  color: '#ffffff',
}
const btnNegative = {
  ...btnBase,
  backgroundColor: '#f1f5f9',
  color: '#475569',
  border: '1px solid #e2e8f0',
}
const hr = { borderColor: '#e2e8f0', margin: '24px 0' }
const hrLight = { borderColor: '#f1f5f9', margin: '28px 0 16px' }
const footerCompany = { fontSize: '12px', color: '#94a3b8', fontWeight: '600' as const, margin: '0 0 4px' }
const footerText = { fontSize: '12px', color: '#94a3b8', margin: '0' }

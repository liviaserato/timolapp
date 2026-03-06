/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const LOGO_URL =
  'https://sinflvoxbphblalcsaba.supabase.co/storage/v1/object/public/email-assets/logo-timol-azul-escuro.svg'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação — Timol</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="Timol" height="44" style={logo} />
        <Heading style={h1}>Código de verificação</Heading>
        <Text style={text}>Use o código abaixo para confirmar sua identidade:</Text>

        <Section style={codeBox}>
          <Text style={codeLabel}>PIN DE SEGURANÇA</Text>
          <Text style={codeStyle}>{token}</Text>
        </Section>

        <Text style={expiry}>Este código expira em 5 minutos.</Text>

        <Section style={alertBox}>
          <Text style={alertText}>
            <strong>Ninguém da Timol vai solicitar esse código.</strong> Não repasse a terceiros.
          </Text>
        </Section>

        <Text style={footer}>
          Se você não solicitou este código, ignore este e-mail com segurança.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
  margin: '0 0 20px',
}
const codeBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '16px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '0 0 20px',
}
const codeLabel = {
  fontSize: '12px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: '#64748b',
  margin: '0 0 8px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  color: '#003885',
  letterSpacing: '0.35em',
  margin: '0',
}
const expiry = {
  fontSize: '14px',
  color: '#475569',
  margin: '0 0 20px',
}
const alertBox = {
  backgroundColor: '#fefce8',
  border: '1px solid #fde68a',
  borderRadius: '12px',
  padding: '18px 20px',
  margin: '0 0 20px',
}
const alertText = {
  fontSize: '14px',
  color: '#854d0e',
  margin: '0',
}
const footer = { fontSize: '12px', color: '#94a3b8', margin: '32px 0 0' }

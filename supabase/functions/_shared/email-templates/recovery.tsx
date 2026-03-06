/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

const LOGO_URL =
  'https://sinflvoxbphblalcsaba.supabase.co/storage/v1/object/public/email-assets/logo-timol-azul-escuro.svg'

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Redefinição de senha — Timol</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="Timol" height="44" style={logo} />
        <Heading style={h1}>Redefinir senha</Heading>
        <Text style={text}>
          Recebemos uma solicitação para redefinir sua senha na Timol. Clique no
          botão abaixo para escolher uma nova senha.
        </Text>
        <Button style={button} href={confirmationUrl}>
          REDEFINIR SENHA →
        </Button>
        <Text style={footer}>
          Se você não solicitou a redefinição, ignore este e-mail com segurança.
          Sua senha não será alterada.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
const button = {
  backgroundColor: '#003885',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '700' as const,
  borderRadius: '8px',
  padding: '14px 32px',
  textDecoration: 'none',
  letterSpacing: '0.5px',
}
const footer = { fontSize: '12px', color: '#94a3b8', margin: '32px 0 0' }

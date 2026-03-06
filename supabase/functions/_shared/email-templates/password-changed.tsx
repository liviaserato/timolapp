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

interface PasswordChangedEmailProps {
  fullName: string
}

const LOGO_URL =
  'https://sinflvoxbphblalcsaba.supabase.co/storage/v1/object/public/email-assets/logo-timol-azul-escuro.svg'

const SUPPORT_URL = 'mailto:suporte@timol.com.br'

export const PasswordChangedEmail = ({ fullName }: PasswordChangedEmailProps) => {
  const firstName = fullName.split(' ')[0]

  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>Sua senha foi alterada com sucesso — Timol</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} alt="Timol" height="44" style={logo} />

          <Heading style={h1}>Senha alterada com sucesso</Heading>

          <Text style={text}>
            Olá, {firstName}.
          </Text>

          <Text style={text}>
            Sua senha de acesso ao Escritório Digital Timol foi alterada com sucesso.
          </Text>

          <Text style={text}>
            Se foi você quem fez essa alteração, nenhuma ação é necessária.
          </Text>

          <Text style={subtleAlert}>
            Se você não solicitou essa alteração, sua conta pode estar comprometida.{' '}
            <Link href={SUPPORT_URL} style={subtleLink}>
              Clique aqui
            </Link>{' '}
            para reportar ou pedir ajuda.
          </Text>

          <Hr style={hr} />

          <Text style={text}>
            Conte com a gente para manter sua conta protegida.
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

export default PasswordChangedEmail

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
const subtleAlert = {
  fontSize: '13px',
  color: '#94a3b8',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const subtleLink = {
  color: '#003885',
  textDecoration: 'underline',
}
const hr = { borderColor: '#e2e8f0', margin: '24px 0' }
const hrLight = { borderColor: '#f1f5f9', margin: '28px 0 16px' }
const footerCompany = { fontSize: '12px', color: '#94a3b8', fontWeight: '600' as const, margin: '0 0 4px' }
const footerText = { fontSize: '12px', color: '#94a3b8', margin: '0' }

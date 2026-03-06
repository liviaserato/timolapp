/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface PendingRegistrationEmailProps {
  fullName: string
  franchiseId: string
  sponsorName: string
  sponsorId: string
  continueUrl: string
}

const LOGO_URL =
  'https://sinflvoxbphblalcsaba.supabase.co/storage/v1/object/public/email-assets/logo-timol-azul-escuro.svg'

export const PendingRegistrationEmail = ({
  fullName,
  franchiseId,
  sponsorName,
  sponsorId,
  continueUrl,
}: PendingRegistrationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Falta pouco para ativar sua franquia Timol</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="Timol" height="44" style={logo} />

        <Heading style={h1}>Olá, {fullName}!</Heading>

        <Text style={text}>
          Vimos que você já iniciou seu cadastro na Timol e seu ID foi gerado com sucesso.
        </Text>

        <Text style={textBold}>Seus dados para continuar de onde parou:</Text>

        <Section style={dataCard}>
          <Row>
            <Column style={labelCol}>ID:</Column>
            <Column style={valueCol}>{franchiseId}</Column>
          </Row>
          <Row>
            <Column style={labelCol}>Nome:</Column>
            <Column style={valueCol}>{fullName}</Column>
          </Row>
          <Row>
            <Column style={labelCol}>Patrocinador:</Column>
            <Column style={valueCol}>{sponsorName} (ID {sponsorId})</Column>
          </Row>
        </Section>

        <Text style={text}>
          Falta só mais um passo para ativar sua franquia e começar sua jornada com a Timol.
        </Text>

        <Text style={text}>
          Se você ainda não escolheu sua franquia ou não concluiu o pagamento, pode retomar
          exatamente de onde parou clicando no botão abaixo:
        </Text>

        <Section style={ctaSection}>
          <Button style={button} href={continueUrl}>
            CONTINUAR CADASTRO →
          </Button>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          Estamos felizes por você ter começado essa jornada. Conte com a gente!
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

export default PendingRegistrationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Segoe UI', Roboto, Arial, sans-serif" }
const container = { padding: '40px 24px', maxWidth: '600px', margin: '0 auto' }
const logo = { marginBottom: '28px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#020817',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: '#64748b',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const textBold = {
  fontSize: '15px',
  color: '#334155',
  lineHeight: '1.6',
  fontWeight: '600' as const,
  margin: '0 0 8px',
}
const dataCard = {
  backgroundColor: '#f1f5f9',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
}
const labelCol = {
  fontSize: '14px',
  color: '#64748b',
  width: '120px',
  padding: '4px 0',
  verticalAlign: 'top' as const,
}
const valueCol = {
  fontSize: '14px',
  color: '#1e293b',
  fontWeight: '600' as const,
  padding: '4px 0',
  verticalAlign: 'top' as const,
}
const ctaSection = { textAlign: 'center' as const, margin: '32px 0' }
const button = {
  backgroundColor: '#003885',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '16px 48px',
  fontSize: '15px',
  fontWeight: '700' as const,
  textDecoration: 'none',
  letterSpacing: '0.5px',
}
const hr = { borderColor: '#e2e8f0', margin: '24px 0' }
const hrLight = { borderColor: '#f1f5f9', margin: '28px 0 16px' }
const footerCompany = { fontSize: '12px', color: '#94a3b8', fontWeight: '600' as const, margin: '0 0 4px' }
const footerText = { fontSize: '12px', color: '#94a3b8', margin: '0' }

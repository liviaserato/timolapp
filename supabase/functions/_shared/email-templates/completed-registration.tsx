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

interface CompletedRegistrationEmailProps {
  fullName: string
  franchiseId: string
  franchiseName: string
  sponsorName: string
  sponsorId: string
  paymentSummary: string
  username: string
  accessUrl: string
}

const LOGO_URL =
  'https://sinflvoxbphblalcsaba.supabase.co/storage/v1/object/public/email-assets/logo-timol-azul-escuro.svg'

export const CompletedRegistrationEmail = ({
  fullName,
  franchiseId,
  franchiseName,
  sponsorName,
  sponsorId,
  paymentSummary,
  username,
  accessUrl,
}: CompletedRegistrationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Sua franquia Timol foi ativada com sucesso!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="Timol" height="44" style={logo} />

        <Heading style={h1}>Parabéns, {fullName}!</Heading>

        <Text style={text}>
          Sua franquia <strong>{franchiseName}</strong> foi ativada com sucesso! Você agora faz parte
          da família Timol.
        </Text>

        {/* Registration Summary */}
        <Section style={card}>
          <Text style={cardTitle}>Resumo do seu cadastro:</Text>
          <Row><Column style={labelCol}>ID:</Column><Column style={valueCol}>{franchiseId}</Column></Row>
          <Row><Column style={labelCol}>Nome:</Column><Column style={valueCol}>{fullName}</Column></Row>
          <Row><Column style={labelCol}>Franquia:</Column><Column style={valueCol}>{franchiseName}</Column></Row>
          <Row><Column style={labelCol}>Patrocinador:</Column><Column style={valueCol}>{sponsorName} (ID {sponsorId})</Column></Row>
        </Section>

        {/* Payment */}
        <Section style={card}>
          <Text style={cardTitle}>Pagamento:</Text>
          <Text style={cardText}>{paymentSummary}</Text>
        </Section>

        {/* Contract Notice */}
        <Section style={card}>
          <Text style={cardTitleBold}>Contrato em anexo</Text>
          <Text style={cardText}>
            Segue em anexo o seu contrato de franquia. Recomendamos não deletar este e-mail para
            manter esse documento e seus dados de ativação sempre à mão.
          </Text>
        </Section>

        {/* First Access */}
        <Section style={card}>
          <Text style={cardTitleBold}>Primeiro Acesso ao TimolSystem</Text>
          <Text style={cardText}>Para acessar o sistema, utilize os dados abaixo:</Text>
          <Row><Column style={labelCol}>Login:</Column><Column style={valueCol}>{username}</Column></Row>
          <Row><Column style={labelCol}>Senha:</Column><Column style={valueCol}>A que você definiu no cadastro</Column></Row>
          <Section style={ctaLeft}>
            <Button style={button} href={accessUrl}>
              ACESSAR ESCRITÓRIO DIGITAL →
            </Button>
          </Section>
        </Section>

        {/* Security Alert */}
        <Section style={alertBox}>
          <Text style={alertTitle}>Alerta de Segurança</Text>
          <Text style={alertText}>
            Sua senha é pessoal e intransferível. <strong>Nunca compartilhe sua senha</strong> com
            terceiros, nem mesmo com a equipe Timol. Nós jamais solicitaremos sua senha por e-mail,
            WhatsApp ou qualquer outro canal.
          </Text>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          Estamos muito felizes em ter você conosco! Sua jornada começa agora. Conte com a gente!
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

export default CompletedRegistrationEmail

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
const card = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 16px',
}
const cardTitle = {
  fontSize: '15px',
  color: '#1e293b',
  fontWeight: '600' as const,
  margin: '0 0 12px',
}
const cardTitleBold = {
  fontSize: '15px',
  color: '#1e293b',
  fontWeight: '700' as const,
  margin: '0 0 8px',
}
const cardText = {
  fontSize: '14px',
  color: '#334155',
  lineHeight: '1.6',
  margin: '0 0 8px',
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
const ctaLeft = { textAlign: 'left' as const, margin: '16px 0 0' }
const button = {
  backgroundColor: '#003885',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '14px 40px',
  fontSize: '15px',
  fontWeight: '700' as const,
  textDecoration: 'none',
  letterSpacing: '0.5px',
}
const alertBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 24px',
}
const alertTitle = {
  fontSize: '15px',
  color: '#991b1b',
  fontWeight: '700' as const,
  margin: '0 0 8px',
}
const alertText = {
  fontSize: '14px',
  color: '#7f1d1d',
  lineHeight: '1.6',
  margin: '0',
}
const hr = { borderColor: '#e2e8f0', margin: '24px 0' }
const hrLight = { borderColor: '#f1f5f9', margin: '28px 0 16px' }
const footerCompany = { fontSize: '12px', color: '#94a3b8', fontWeight: '600' as const, margin: '0 0 4px' }
const footerText = { fontSize: '12px', color: '#94a3b8', margin: '0' }

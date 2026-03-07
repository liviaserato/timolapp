import { useState } from "react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { User, Phone, MapPin, KeyRound } from "lucide-react";
import { AddressManager, type Address } from "@/components/app/cadastro/AddressManager";
import { FranchiseCard } from "@/components/app/cadastro/FranchiseCard";
import { FinancialManager, type FinancialAccount } from "@/components/app/cadastro/FinancialManager";
import { DocumentsCard } from "@/components/app/cadastro/DocumentsCard";

/* ── mock data ── */

const isBrazilian = true;
const countryFlag = "🇧🇷";

const personalData = {
  fullName: "Lívia Serato",
  document: "123.456.789-00",
  birthDate: "15-03-1990",
  gender: "Feminino",
};

const contactData = {
  email: "livia.serato@email.com",
  phone: "+55 11 99999-0000",
};

const loginData = {
  username: "livia.serato",
};

const franchiseData = {
  id: "100231",
  sponsor: "Maria Silva (ID 99001)",
  plan: "Ouro",
  planCode: "gold",
};

const initialAddresses: Address[] = [
  {
    id: "1",
    label: "Casa",
    country: "Brasil",
    countryIso2: "BR",
    zipCode: "01234-567",
    street: "Rua das Flores",
    number: "123",
    complement: "Apto 45",
    neighborhood: "Jardim Paulista",
    city: "São Paulo",
    state: "SP",
    isDefault: true,
  },
];

const initialAccounts: FinancialAccount[] = [
  {
    id: "1",
    type: "bank",
    label: "Conta Principal",
    bank: "Banco do Brasil",
    agency: "1234-5",
    account: "12345-6",
    accountType: "Corrente",
    pixKey: "livia.serato@email.com",
    isDefault: true,
  },
  {
    id: "2",
    type: "pix",
    label: "PIX Nubank",
    pixKey: "123.456.789-00",
    pixKeyType: "CPF",
    isDefault: false,
  },
];

/* ── helpers ── */

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground text-sm shrink-0">{label}</span>
      <span className="text-sm font-medium text-right break-words min-w-0">{value}</span>
    </div>
  );
}

/* ── component ── */

export default function Cadastro() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [accounts, setAccounts] = useState<FinancialAccount[]>(initialAccounts);

  const docLabel = isBrazilian ? "CPF" : (
    <span className="flex items-center gap-1">
      <span>{countryFlag}</span> Documento
    </span>
  );

  return (
    <div>
      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold text-primary">Cadastro</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Seus dados pessoais e financeiros
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* ═══ LEFT COLUMN ═══ */}

        {/* Dados Pessoais */}
        <DashboardCard icon={User} title="Dados Pessoais">
          <div className="mt-1">
            <Row label="Nome Completo" value={personalData.fullName} />
            <Row label={docLabel as any} value={personalData.document} />
            <Row label="Nascimento" value={personalData.birthDate} />
            <Row label="Gênero" value={personalData.gender} />
          </div>
        </DashboardCard>

        {/* ═══ RIGHT COLUMN ═══ */}

        {/* Franquia — with tabs */}
        <FranchiseCard
          franchiseId={franchiseData.id}
          planCode={franchiseData.planCode}
          sponsor={franchiseData.sponsor}
        />

        {/* Contato */}
        <DashboardCard icon={Phone} title="Contato">
          <div className="mt-1">
            <Row label="E-mail" value={contactData.email} />
            <Row label="Telefone" value={contactData.phone} />
          </div>
        </DashboardCard>

        {/* Acesso */}
        <DashboardCard icon={KeyRound} title="Acesso">
          <div className="mt-1">
            <Row label="Usuário" value={loginData.username} />
            <Row
              label="Senha"
              value={
                <button className="text-primary text-xs underline underline-offset-2 hover:text-primary/80">
                  Alterar senha
                </button>
              }
            />
          </div>
        </DashboardCard>

        {/* Endereço */}
        <DashboardCard icon={MapPin} title="Endereço">
          <AddressManager addresses={addresses} onChange={setAddresses} />
        </DashboardCard>

        {/* Dados Financeiros */}
        <FinancialManager accounts={accounts} onChange={setAccounts} />

        {/* Documentos */}
        <DocumentsCard />
      </div>
    </div>
  );
}

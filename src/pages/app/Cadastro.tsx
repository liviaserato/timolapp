import { useState } from "react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  MapPin,
  KeyRound,
  Gem,
  Landmark,
  Plus,
  Star,
  Pencil,
  Trash2,
} from "lucide-react";

/* ── mock data (will be replaced by real DB queries) ── */

const isBrazilian = true; // toggle to test foreigner view
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

const addressData = {
  full: "Rua das Flores, 123 - Apto 45, Jardim Paulista, São Paulo - SP, 01234-567, Brasil",
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

interface BankAccount {
  id: string;
  label: string;
  bank: string;
  agency: string;
  account: string;
  type: string;
  pix?: string;
  isDefault: boolean;
}

const initialAccounts: BankAccount[] = [
  {
    id: "1",
    label: "Conta Principal",
    bank: "Banco do Brasil",
    agency: "1234-5",
    account: "12345-6",
    type: "Corrente",
    pix: "livia.serato@email.com",
    isDefault: true,
  },
  {
    id: "2",
    label: "Conta Secundária",
    bank: "Nubank",
    agency: "0001",
    account: "9876543-2",
    type: "Corrente",
    pix: "123.456.789-00",
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
  const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts);

  const handleSetDefault = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  const handleRemove = (id: string) => {
    setAccounts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (next.length > 0 && !next.some((a) => a.isDefault)) {
        next[0].isDefault = true;
      }
      return next;
    });
  };

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
        {/* Dados Pessoais — left, stretches to match right column */}
        <DashboardCard icon={User} title="Dados Pessoais" className="md:row-span-2">
          <div className="mt-1">
            <Row label="Nome Completo" value={personalData.fullName} />
            <Row label={docLabel as any} value={personalData.document} />
            <Row label="Nascimento" value={personalData.birthDate} />
            <Row label="Gênero" value={personalData.gender} />
          </div>
        </DashboardCard>

        {/* Contato — top right */}
        <DashboardCard icon={Phone} title="Contato">
          <div className="mt-1">
            <Row label="E-mail" value={contactData.email} />
            <Row label="Telefone" value={contactData.phone} />
          </div>
        </DashboardCard>

        {/* Endereço — bottom right */}
        <DashboardCard icon={MapPin} title="Endereço">
          <p className="mt-1 text-sm">{addressData.full}</p>
        </DashboardCard>

        {/* Acesso — left column */}
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

        {/* Franquia — right column */}
        <DashboardCard icon={Gem} title="Franquia">
          <div className="mt-1">
            <Row label="ID" value={franchiseData.id} />
            <Row label="Patrocinador" value={franchiseData.sponsor} />
            <Row label="Plano" value={franchiseData.plan} />
          </div>
        </DashboardCard>

        {/* Dados Financeiros — full width */}
        <DashboardCard icon={Landmark} title="Dados Financeiros" className="md:col-span-2">
          <div className="mt-2 space-y-3">
            {accounts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma conta bancária cadastrada.
              </p>
            )}

            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="rounded-md border border-app-card-border p-3 relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{acc.label}</span>
                    {acc.isDefault && (
                      <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        Padrão
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleRemove(acc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <Row label="Banco" value={acc.bank} />
                  <Row label="Agência" value={acc.agency} />
                  <Row label="Conta" value={acc.account} />
                  <Row label="Tipo" value={acc.type} />
                  {acc.pix && (
                    <div className="col-span-2">
                      <Row label="Chave PIX" value={acc.pix} />
                    </div>
                  )}
                </div>

                {!acc.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs h-7"
                    onClick={() => handleSetDefault(acc.id)}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Definir como padrão
                  </Button>
                )}
              </div>
            ))}

            <Button variant="outline" size="sm" className="w-full gap-1.5">
              <Plus className="h-4 w-4" />
              Adicionar conta bancária
            </Button>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

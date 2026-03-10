import { useState } from "react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, MapPin, KeyRound, HelpCircle, ShieldCheck } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AddressManager, type Address } from "@/components/app/cadastro/AddressManager";
import { FranchiseCard } from "@/components/app/cadastro/FranchiseCard";
import { FinancialManager, type FinancialAccount } from "@/components/app/cadastro/FinancialManager";
import { DocumentsCard } from "@/components/app/cadastro/DocumentsCard";
import { PasswordChangeDialog } from "@/components/app/cadastro/PasswordChangeDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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
    isDefault: true,
    status: "verified",
  },
  {
    id: "2",
    type: "pix",
    label: "PIX Nubank",
    pixKey: "123.456.789-00",
    pixKeyType: "CPF",
    isDefault: false,
    status: "pending",
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

/* ── Phone Change Dialog ── */

function PhoneChangeDialog({ open, onOpenChange, currentPhone }: { open: boolean; onOpenChange: (v: boolean) => void; currentPhone: string }) {
  const [step, setStep] = useState<"phone" | "pin">("phone");
  const [newPhone, setNewPhone] = useState("");
  const [pin, setPin] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendPin = () => {
    if (!newPhone.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setStep("pin");
      toast.info("PIN enviado por SMS para o novo número.");
    }, 1500);
  };

  const handleVerifyPin = () => {
    if (pin.length < 6) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Telefone alterado com sucesso!");
      onOpenChange(false);
      setStep("phone");
      setNewPhone("");
      setPin("");
    }, 1200);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setStep("phone");
      setNewPhone("");
      setPin("");
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Alterar Telefone</DialogTitle>
          <DialogDescription>
            {step === "phone"
              ? `Seu telefone atual é ${currentPhone}. Informe o novo número.`
              : "Digite o PIN de 6 dígitos enviado por SMS para o novo número."}
          </DialogDescription>
        </DialogHeader>
        {step === "phone" ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Novo telefone</Label>
              <Input
                placeholder="+55 11 99999-0000"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && newPhone.trim() && !sending) handleSendPin(); }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
              <Button onClick={handleSendPin} disabled={!newPhone.trim() || sending}>
                {sending ? "Enviando..." : "Enviar PIN"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>PIN de verificação</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={pin}
                  onChange={(value) => setPin(value)}
                  onComplete={() => {
                    setTimeout(() => handleVerifyPin(), 0);
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter" && pin.length === 6 && !sending) { e.preventDefault(); handleVerifyPin(); } }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("phone")}>Voltar</Button>
              <Button onClick={handleVerifyPin} disabled={pin.length < 6 || sending}>
                {sending ? "Verificando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ── component ── */

export default function Cadastro() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [accounts, setAccounts] = useState<FinancialAccount[]>(initialAccounts);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);

  const docLabel = isBrazilian ? "CPF" : (
    <span className="flex items-center gap-1">
      <span>{countryFlag}</span> Documento
    </span>
  );

  return (
    <div>
      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold text-primary">Meus Dados</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie suas informações pessoais, financeiras e de franquia
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Dados Pessoais */}
        <DashboardCard icon={User} title="Dados Pessoais">
          <div className="mt-1">
            <Row label="Nome Completo" value={personalData.fullName} />
            <Row label={docLabel as any} value={personalData.document} />
            <Row label="Nascimento" value={personalData.birthDate} />
            <Row label="Gênero" value={personalData.gender} />
          </div>
        </DashboardCard>

        {/* Franquia */}
        <FranchiseCard
          franchiseId={franchiseData.id}
          planCode={franchiseData.planCode}
          sponsor={franchiseData.sponsor}
        />

        {/* Contato */}
        <DashboardCard icon={Phone} title="Contato">
          <div className="mt-1 flex-1">
            <Row label="E-mail" value={contactData.email} />
            <Row label="Telefone" value={contactData.phone} />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-xs h-7 w-full gap-1.5"
            onClick={() => setPhoneDialogOpen(true)}
          >
            <ShieldCheck className="h-3 w-3" />
            Alterar telefone
          </Button>
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
          <AddressManager
            addresses={addresses}
            onChange={setAddresses}
            currentCountryIso2="BR"
          />
        </DashboardCard>

        {/* Dados Financeiros */}
        <FinancialManager accounts={accounts} onChange={setAccounts} />

        {/* Documentos */}
        <DocumentsCard />

        {/* Card de Ajuda */}
        <DashboardCard icon={HelpCircle} title="Precisa de ajuda?">
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Caso queira alterar dados sensíveis, tirar dúvidas ou tratar de qualquer outro assunto relacionado aos seus dados, abra um chamado{" "}
            <button className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium">
              clicando aqui
            </button>.
          </p>
        </DashboardCard>
      </div>

      <PhoneChangeDialog
        open={phoneDialogOpen}
        onOpenChange={setPhoneDialogOpen}
        currentPhone={contactData.phone}
      />
    </div>
  );
}

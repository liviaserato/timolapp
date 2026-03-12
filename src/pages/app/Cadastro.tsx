import { forwardRef, useState } from "react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Phone, MapPin, KeyRound, HelpCircle, ShieldCheck, MessageSquarePlus } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PhoneInput } from "@/components/ui/phone-input";
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

const Row = forwardRef<HTMLDivElement, { label: string; value: React.ReactNode }>(
  ({ label, value }, ref) => {
    return (
      <div ref={ref} className="flex justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
        <span className="text-muted-foreground text-sm shrink-0">{label}</span>
        <span className="text-sm font-medium text-right break-words min-w-0">{value}</span>
      </div>
    );
  }
);

Row.displayName = "Row";

/* ── Phone Change Dialog ── */

function PhoneChangeDialog({ open, onOpenChange, currentPhone, currentDdiIso2 }: { open: boolean; onOpenChange: (v: boolean) => void; currentPhone: string; currentDdiIso2?: string }) {
  const [step, setStep] = useState<"phone" | "pin" | "success">("phone");
  const [newDdi, setNewDdi] = useState(currentDdiIso2 || "BR");
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
      setStep("success");
      toast.success("Telefone alterado com sucesso!");
    }, 1200);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setStep("phone");
      setNewDdi(currentDdiIso2 || "BR");
      setNewPhone("");
      setPin("");
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {step === "success" ? (
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <ShieldCheck className="h-7 w-7 text-green-600" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold text-foreground">Telefone alterado</h3>
              <p className="text-sm text-muted-foreground">
                Seu telefone foi atualizado com sucesso.
              </p>
            </div>
            <Button onClick={() => handleClose(false)} className="mt-2 w-full max-w-[200px]">
              Fechar
            </Button>
          </div>
        ) : (
          <>
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
                  <PhoneInput
                    countryIso2={newDdi}
                    number={newPhone}
                    onCountryChange={setNewDdi}
                    onNumberChange={setNewPhone}
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
                  <Label className="text-center block">PIN de verificação</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      autoFocus
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
          </>
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
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const docLabel = isBrazilian ? "CPF" : (
    <span className="flex items-center gap-1">
      <span>{countryFlag}</span> Documento
    </span>
  );

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-primary">Meus Dados</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aqui você encontra tudo sobre o seu perfil — mantenha seus dados sempre atualizados 😊
        </p>
      </header>

      {/* Desktop: grouped rows. Mobile: flat column with custom order */}
      <div className="flex flex-col gap-3 sm:hidden">
        {/* Mobile order: Franquia, Acesso, Dados Pessoais, Contato, Endereço, Financeiro, Documentos, Ajuda */}
        <FranchiseCard
          franchiseId={franchiseData.id}
          planCode={franchiseData.planCode}
          sponsor={franchiseData.sponsor}
        />

        <DashboardCard icon={KeyRound} title="Acesso">
          <div className="mt-1">
            <Row label="Usuário" value={loginData.username} />
            <Row
              label="Senha"
              value={
                <button
                  className="text-primary text-xs underline underline-offset-2 hover:text-primary/80"
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Alterar senha
                </button>
              }
            />
          </div>
        </DashboardCard>

        <DashboardCard icon={User} title="Dados Pessoais">
          <div className="mt-1">
            <Row label="Nome Completo" value={personalData.fullName} />
            <Row label={docLabel as any} value={personalData.document} />
            <Row label="Nascimento" value={personalData.birthDate} />
            <Row label="Gênero" value={personalData.gender} />
          </div>
        </DashboardCard>

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

        <DashboardCard icon={MapPin} title="Endereço">
          <AddressManager
            addresses={addresses}
            onChange={setAddresses}
            currentCountryIso2="BR"
            franchiseCurrency="BRL"
          />
        </DashboardCard>

        <FinancialManager accounts={accounts} onChange={setAccounts} />

        <DocumentsCard />

        <DashboardCard icon={HelpCircle} title="Precisa de ajuda?" id="help-card">
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Para alterar dados sensíveis, tirar dúvidas ou resolver qualquer questão sobre sua conta, estamos aqui para te ajudar!
          </p>
          <Button
            size="sm"
            className="mt-3 w-full gap-2 h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm"
            onClick={() => {/* TODO: navigate to support */}}
          >
            <MessageSquarePlus className="h-4 w-4" />
            Abrir chamado
          </Button>
        </DashboardCard>
      </div>

      {/* Desktop layout (sm+) */}
      <div className="hidden sm:flex flex-col gap-3">
        {/* Row 1: Dados Pessoais + Contato | Franquia */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-3">
            <DashboardCard icon={User} title="Dados Pessoais">
              <div className="mt-1">
                <Row label="Nome Completo" value={personalData.fullName} />
                <Row label={docLabel as any} value={personalData.document} />
                <Row label="Nascimento" value={personalData.birthDate} />
                <Row label="Gênero" value={personalData.gender} />
              </div>
            </DashboardCard>

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
          </div>

          <FranchiseCard
            franchiseId={franchiseData.id}
            planCode={franchiseData.planCode}
            sponsor={franchiseData.sponsor}
            className="h-full"
          />
        </div>

        {/* Row 2: Endereço | Acesso */}
        <div className="grid grid-cols-2 gap-3">
          <DashboardCard icon={MapPin} title="Endereço">
            <AddressManager
              addresses={addresses}
              onChange={setAddresses}
              currentCountryIso2="BR"
              franchiseCurrency="BRL"
            />
          </DashboardCard>

          <DashboardCard icon={KeyRound} title="Acesso">
            <div className="mt-1">
              <Row label="Usuário" value={loginData.username} />
              <Row
                label="Senha"
                value={
                  <button
                    className="text-primary text-xs underline underline-offset-2 hover:text-primary/80"
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Alterar senha
                  </button>
                }
              />
            </div>
          </DashboardCard>
        </div>

        {/* Row 3: Financeiro + Ajuda | Documentos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-3">
            <FinancialManager accounts={accounts} onChange={setAccounts} />

            <DashboardCard icon={HelpCircle} title="Precisa de ajuda?" id="help-card">
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Para alterar dados sensíveis, tirar dúvidas ou resolver qualquer questão sobre sua conta, estamos aqui para te ajudar!
              </p>
              <Button
                size="sm"
                className="mt-3 w-full gap-2 h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm"
                onClick={() => {/* TODO: navigate to support */}}
              >
                <MessageSquarePlus className="h-4 w-4" />
                Abrir chamado
              </Button>
            </DashboardCard>
          </div>

          <DocumentsCard className="h-full" />
        </div>
      </div>

      <PhoneChangeDialog
        open={phoneDialogOpen}
        onOpenChange={setPhoneDialogOpen}
        currentPhone={contactData.phone}
      />

      <PasswordChangeDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        maskedEmail="li****@email.com"
      />
    </div>
  );
}

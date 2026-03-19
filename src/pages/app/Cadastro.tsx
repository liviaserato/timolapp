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
import { useLanguage } from "@/i18n/LanguageContext";
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

const personalData = { fullName: "Lívia Serato", document: "123.456.789-00", birthDate: "15-03-1990", gender: "Feminino" };
const contactData = { email: "livia.serato@email.com", phone: "+55 11 99999-0000" };
const loginData = { username: "livia.serato" };
const franchiseData = { id: "100231", sponsor: "Maria Silva (ID 99001)", plan: "Ouro", planCode: "gold" };

const initialAddresses: Address[] = [
  { id: "1", label: "Casa", country: "Brasil", countryIso2: "BR", zipCode: "01234-567", street: "Rua das Flores", number: "123", complement: "Apto 45", neighborhood: "Jardim Paulista", city: "São Paulo", state: "SP", isDefault: true },
];

const initialAccounts: FinancialAccount[] = [
  { id: "1", type: "bank", label: "Conta Principal", bank: "Banco do Brasil", agency: "1234-5", account: "12345-6", accountType: "Corrente", isDefault: true, status: "verified" },
  { id: "2", type: "pix", label: "PIX Nubank", pixKey: "123.456.789-00", pixKeyType: "CPF", isDefault: false, status: "pending" },
];

/* ── helpers ── */
const Row = forwardRef<HTMLDivElement, { label: string; value: React.ReactNode }>(
  ({ label, value }, ref) => (
    <div ref={ref} className="flex justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground text-sm shrink-0">{label}</span>
      <span className="text-sm font-medium text-right break-words min-w-0">{value}</span>
    </div>
  )
);
Row.displayName = "Row";

/* ── Phone Change Dialog ── */
function PhoneChangeDialog({ open, onOpenChange, currentPhone, currentDdiIso2 }: { open: boolean; onOpenChange: (v: boolean) => void; currentPhone: string; currentDdiIso2?: string }) {
  const { t } = useLanguage();
  const [step, setStep] = useState<"phone" | "pin" | "success">("phone");
  const [newDdi, setNewDdi] = useState(currentDdiIso2 || "BR");
  const [newPhone, setNewPhone] = useState("");
  const [pin, setPin] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendPin = () => {
    if (!newPhone.trim()) return;
    setSending(true);
    setTimeout(() => { setSending(false); setStep("pin"); toast.info(t("cadastro.pinSentToast")); }, 1500);
  };

  const handleVerifyPin = () => {
    if (pin.length < 6) return;
    setSending(true);
    setTimeout(() => { setSending(false); setStep("success"); toast.success(t("cadastro.phoneChangedToast")); }, 1200);
  };

  const handleClose = (v: boolean) => {
    if (!v) { setStep("phone"); setNewDdi(currentDdiIso2 || "BR"); setNewPhone(""); setPin(""); }
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
              <h3 className="text-lg font-semibold text-foreground">{t("cadastro.phoneChanged")}</h3>
              <p className="text-sm text-muted-foreground">{t("cadastro.phoneChangedDesc")}</p>
            </div>
            <Button onClick={() => handleClose(false)} className="mt-2 w-full max-w-[200px]">{t("common.close")}</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("cadastro.changePhoneTitle")}</DialogTitle>
              <DialogDescription>
                {step === "phone"
                  ? `${t("cadastro.currentPhone")} ${currentPhone}. ${t("cadastro.informNewNumber")}`
                  : t("cadastro.pinSentSms")}
              </DialogDescription>
            </DialogHeader>
            {step === "phone" ? (
              <form onSubmit={(e) => { e.preventDefault(); if (newPhone.trim() && !sending) handleSendPin(); }} className="space-y-3">
                <div className="space-y-2">
                  <Label>{t("cadastro.newPhone")}</Label>
                  <PhoneInput countryIso2={newDdi} number={newPhone} onCountryChange={setNewDdi} onNumberChange={setNewPhone} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => handleClose(false)}>{t("common.cancel")}</Button>
                  <Button type="submit" disabled={!newPhone.trim() || sending}>
                    {sending ? t("common.sending") : t("common.sendPin")}
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-center block">{t("cadastro.verificationPin")}</Label>
                  <div className="flex justify-center">
                    <InputOTP autoFocus maxLength={6} value={pin} onChange={(value) => setPin(value)}
                      onComplete={() => { setTimeout(() => handleVerifyPin(), 0); }}
                      onKeyDown={(e) => { if (e.key === "Enter" && pin.length === 6 && !sending) { e.preventDefault(); handleVerifyPin(); } }}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                        <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setStep("phone")}>{t("common.back")}</Button>
                  <Button onClick={handleVerifyPin} disabled={pin.length < 6 || sending}>
                    {sending ? t("common.verifying") : t("common.confirm")}
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
  const { t } = useLanguage();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [accounts, setAccounts] = useState<FinancialAccount[]>(initialAccounts);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const docLabel = isBrazilian ? "CPF" : (
    <span className="flex items-center gap-1"><span>{countryFlag}</span> {t("cadastro.document")}</span>
  );

  const personalCard = (
    <DashboardCard icon={User} title={t("cadastro.personalData")}>
      <div className="mt-1">
        <Row label={t("cadastro.fullName")} value={personalData.fullName} />
        <Row label={docLabel as any} value={personalData.document} />
        <Row label={t("cadastro.birthDate")} value={personalData.birthDate} />
        <Row label={t("cadastro.gender")} value={personalData.gender} />
      </div>
    </DashboardCard>
  );

  const contactCard = (
    <DashboardCard icon={Phone} title={t("cadastro.contact")}>
      <div className="mt-1 flex-1">
        <Row label={t("cadastro.email")} value={contactData.email} />
        <Row label={t("cadastro.phone")} value={contactData.phone} />
      </div>
      <Button variant="outline" size="sm" className="mt-2 text-xs h-7 w-full gap-1.5" onClick={() => setPhoneDialogOpen(true)}>
        <ShieldCheck className="h-3 w-3" />
        {t("cadastro.changePhone")}
      </Button>
    </DashboardCard>
  );

  const accessCard = (
    <DashboardCard icon={KeyRound} title={t("cadastro.access")}>
      <div className="mt-1">
        <Row label={t("cadastro.username")} value={loginData.username} />
        <Row label={t("cadastro.password")} value={
          <button className="text-primary text-xs underline underline-offset-2 hover:text-primary/80" onClick={() => setPasswordDialogOpen(true)}>
            {t("cadastro.changePassword")}
          </button>
        } />
      </div>
    </DashboardCard>
  );

  const helpCard = (
    <DashboardCard icon={HelpCircle} title={t("cadastro.help")} id="help-card">
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{t("cadastro.helpDesc")}</p>
      <Button size="sm" className="mt-3 w-full gap-2 h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm" onClick={() => {}}>
        <MessageSquarePlus className="h-4 w-4" />
        {t("cadastro.openTicket")}
      </Button>
    </DashboardCard>
  );

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-primary">{t("cadastro.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("cadastro.subtitle")}</p>
      </header>

      {/* Mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        <FranchiseCard franchiseId={franchiseData.id} planCode={franchiseData.planCode} sponsor={franchiseData.sponsor} />
        {accessCard}
        {personalCard}
        {contactCard}
        <DashboardCard icon={MapPin} title={t("cadastro.address")}>
          <AddressManager addresses={addresses} onChange={setAddresses} currentCountryIso2="BR" franchiseCurrency="BRL" />
        </DashboardCard>
        <FinancialManager accounts={accounts} onChange={setAccounts} />
        <DocumentsCard />
        {helpCard}
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-3">{personalCard}{contactCard}</div>
          <FranchiseCard franchiseId={franchiseData.id} planCode={franchiseData.planCode} sponsor={franchiseData.sponsor} className="h-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DashboardCard icon={MapPin} title={t("cadastro.address")}>
            <AddressManager addresses={addresses} onChange={setAddresses} currentCountryIso2="BR" franchiseCurrency="BRL" />
          </DashboardCard>
          {accessCard}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-3">
            <FinancialManager accounts={accounts} onChange={setAccounts} />
            {helpCard}
          </div>
          <DocumentsCard className="h-full" />
        </div>
      </div>

      <PhoneChangeDialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen} currentPhone={contactData.phone} />
      <PasswordChangeDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} maskedEmail="li****@email.com" />
    </div>
  );
}

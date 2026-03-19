import { useState, useEffect, useCallback } from "react";
import { ContractScreen } from "@/components/screens/ContractScreen";
import { useNavigate } from "react-router-dom";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Phone,
  MapPin,
  KeyRound,
  Landmark,
  Gem,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── mock data (simulating API response) ── */

const mockApiData = {
  fullName: "Lívia Serato",
  birthDate: "1990-03-15",
  gender: "female",
  document: "123.456.789-00",
  documentCountryCode: "BR",
  email: "livia.serato@email.com",
  phoneDdi: "BR",
  phoneNumber: "11 99999-0000",
  username: "livia.serato",
  address: {
    zipCode: "01234-567",
    street: "Rua das Flores",
    number: "123",
    complement: "Apto 45",
    neighborhood: "Jardim Paulista",
    city: "São Paulo",
    state: "SP",
    country: "Brasil",
    countryIso2: "BR",
  },
  financial: {
    type: "pix" as const,
    pixKey: "123.456.789-00",
    pixKeyType: "CPF",
    bank: "",
    agency: "",
    account: "",
    accountType: "",
  },
  franchises: [
    { franchiseId: "100231", planCode: "gold", planLabel: "Ouro" },
    { franchiseId: "200587", planCode: "silver", planLabel: "Prata" },
    { franchiseId: "300145", planCode: "bronze", planLabel: "Bronze" },
  ],
};

/* ── helpers ── */

function formatBirthDateForInput(date: string): string {
  // API sends YYYY-MM-DD or DD-MM-YYYY
  if (date.includes("-") && date.indexOf("-") === 4) return date;
  const [d, m, y] = date.split("-");
  return `${y}-${m}-${d}`;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground text-sm shrink-0">{label}</span>
      <span className="text-sm font-medium text-right break-words min-w-0">{value}</span>
    </div>
  );
}

const planColors: Record<string, string> = {
  bronze: "bg-amber-700/15 text-amber-800 border-amber-700/30",
  silver: "bg-slate-400/15 text-slate-600 border-slate-400/30",
  gold: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  platinum: "bg-indigo-400/15 text-indigo-700 border-indigo-400/30",
};

/* ── component ── */

export default function AtualizacaoCadastral() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const genderOptions = [
    { value: "male", label: t("atualiz.male") },
    { value: "female", label: t("atualiz.female") },
    { value: "other", label: t("atualiz.other") },
  ];

  // Form state
  const [fullName, setFullName] = useState(mockApiData.fullName);
  const [birthDate, setBirthDate] = useState(formatBirthDateForInput(mockApiData.birthDate));
  const [gender, setGender] = useState(mockApiData.gender);
  const [email, setEmail] = useState(mockApiData.email);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneDdi, setPhoneDdi] = useState(mockApiData.phoneDdi);
  const [phoneNumber, setPhoneNumber] = useState(mockApiData.phoneNumber);
  const [username, setUsername] = useState(mockApiData.username);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  // Address
  const [zipCode, setZipCode] = useState(mockApiData.address.zipCode);
  const [street, setStreet] = useState(mockApiData.address.street);
  const [addrNumber, setAddrNumber] = useState(mockApiData.address.number);
  const [complement, setComplement] = useState(mockApiData.address.complement);
  const [neighborhood, setNeighborhood] = useState(mockApiData.address.neighborhood);
  const [city, setCity] = useState(mockApiData.address.city);
  const [state, setState] = useState(mockApiData.address.state);
  const [country, setCountry] = useState(mockApiData.address.country);
  const [loadingCep, setLoadingCep] = useState(false);

  // Financial
  const [financialType, setFinancialType] = useState<string>(mockApiData.financial.type);
  const [pixKey, setPixKey] = useState(mockApiData.financial.pixKey);
  const [bank, setBank] = useState(mockApiData.financial.bank);
  const [agency, setAgency] = useState(mockApiData.financial.agency);
  const [account, setAccount] = useState(mockApiData.financial.account);
  const [accountType, setAccountType] = useState(mockApiData.financial.accountType);

  // Contract
  const [contractAccepted, setContractAccepted] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);

  // Divergence
  const [divergenceOpen, setDivergenceOpen] = useState(false);
  const [divergenceText, setDivergenceText] = useState("");
  const [divergenceSent, setDivergenceSent] = useState(false);

  // Submit
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── email uniqueness check (debounced) ──
  useEffect(() => {
    if (!email.trim() || email === mockApiData.email) {
      setEmailError("");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(t("atualiz.invalidEmail"));
      return;
    }
    setEmailChecking(true);
    const timer = setTimeout(() => {
      const taken = email.toLowerCase() === "admin@timol.com";
      setEmailError(taken ? t("atualiz.emailTaken") : "");
      setEmailChecking(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [email]);

  // ── username uniqueness check (debounced) ──
  useEffect(() => {
    if (!username.trim() || username === mockApiData.username) {
      setUsernameError("");
      return;
    }
    const usernameRegex = /^[a-z0-9._]*$/;
    if (!usernameRegex.test(username)) {
      setUsernameError(t("atualiz.usernameOnlyChars"));
      return;
    }
    if (username.length > 20) {
      setUsernameError(t("atualiz.usernameMaxChars"));
      return;
    }
    const timer = setTimeout(() => {
      const taken = username.toLowerCase() === "admin";
      setUsernameError(taken ? t("atualiz.usernameTaken") : "");
      setUsernameChecking(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [username]);

  // ── CEP lookup ──
  const handleCepChange = (val: string) => {
    const masked = val.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
    setZipCode(masked);
    if (masked.replace(/\D/g, "").length === 8) {
      setLoadingCep(true);
      fetch(`https://viacep.com.br/ws/${masked.replace(/\D/g, "")}/json/`)
        .then((r) => r.json())
        .then((json) => {
          if (!json.erro) {
            setStreet(json.logradouro || street);
            setNeighborhood(json.bairro || neighborhood);
            setCity(json.localidade || city);
            setState(json.uf || state);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingCep(false));
    }
  };

  // ── validation ──
  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const req = t("atualiz.requiredField");
    if (!fullName.trim()) errors.fullName = req;
    if (!birthDate) errors.birthDate = req;
    if (!gender) errors.gender = req;
    if (!email.trim()) errors.email = req;
    if (emailError) errors.email = emailError;
    if (!phoneNumber.trim()) errors.phoneNumber = req;
    if (!username.trim()) errors.username = req;
    if (usernameError) errors.username = usernameError;
    if (!street.trim()) errors.street = req;
    if (!city.trim()) errors.city = req;
    if (!contractAccepted) errors.contract = t("atualiz.contractRequired");
    if (financialType === "pix" && !pixKey.trim()) errors.pixKey = req;
    if (financialType === "bank" && (!bank.trim() || !agency.trim() || !account.trim())) {
      if (!bank.trim()) errors.bank = req;
      if (!agency.trim()) errors.agency = req;
      if (!account.trim()) errors.account = req;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast.error(t("atualiz.fillRequired"));
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(t("atualiz.savedSuccess"));
      navigate("/app");
    }, 1500);
  };

  const handleLater = () => {
    toast.info(t("atualiz.laterMsg"));
    navigate("/app");
  };

  const handleDivergenceSend = () => {
    if (!divergenceText.trim()) return;
    setDivergenceSent(true);
    toast.success(t("atualiz.divergenceSentToast"));
  };

  const clearError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const errorClass = (field: string) => fieldErrors[field] ? "border-destructive" : "";

  return (
    <div className="max-w-xl mx-auto">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-primary">{t("atualiz.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("atualiz.subtitle")}
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {/* ── Dados Pessoais ── */}
        <DashboardCard icon={User} title={t("atualiz.personalData")}>
          <div className="mt-2 space-y-3">
            <div className="space-y-1.5">
              <Label>{t("atualiz.fullName")}</Label>
              <Input
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); clearError("fullName"); }}
                className={errorClass("fullName")}
              />
              {fieldErrors.fullName && <p className="text-xs text-destructive">{fieldErrors.fullName}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("atualiz.birthDate")}</Label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => { setBirthDate(e.target.value); clearError("birthDate"); }}
                  className={errorClass("birthDate")}
                />
                {fieldErrors.birthDate && <p className="text-xs text-destructive">{fieldErrors.birthDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>{t("atualiz.gender")}</Label>
                <Select value={gender} onValueChange={(v) => { setGender(v); clearError("gender"); }}>
                  <SelectTrigger className={errorClass("gender")}><SelectValue placeholder={t("atualiz.select")} /></SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.gender && <p className="text-xs text-destructive">{fieldErrors.gender}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{mockApiData.documentCountryCode === "BR" ? t("atualiz.documentCpf") : t("atualiz.document")}</Label>
              <Input value={mockApiData.document} readOnly disabled className="bg-muted/50 cursor-not-allowed" />
              <p className="text-[11px] text-muted-foreground">
                {t("atualiz.documentHint")}
              </p>
            </div>
            {mockApiData.documentCountryCode !== "BR" && (
              <div className="space-y-1.5">
                <Label>{t("atualiz.issuingCountry")}</Label>
                <Input value={mockApiData.documentCountryCode} readOnly disabled className="bg-muted/50 cursor-not-allowed" />
              </div>
            )}
          </div>
        </DashboardCard>

        {/* ── Contato ── */}
        <DashboardCard icon={Mail} title={t("atualiz.contact")}>
          <div className="mt-2 space-y-3">
            <div className="space-y-1.5">
              <Label>{t("atualiz.activeEmail")}</Label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                  className={`${errorClass("email")} pr-8`}
                />
                {emailChecking && <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
                {!emailChecking && !emailError && email && email !== mockApiData.email && (
                  <CheckCircle2 className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-success" />
                )}
              </div>
              {emailError && <p className="text-xs text-destructive">{emailError}</p>}
              {fieldErrors.email && !emailError && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <PhoneInput
                countryIso2={phoneDdi}
                number={phoneNumber}
                onCountryChange={setPhoneDdi}
                onNumberChange={(v) => { setPhoneNumber(v); clearError("phoneNumber"); }}
                hasError={!!fieldErrors.phoneNumber}
              />
              {fieldErrors.phoneNumber && <p className="text-xs text-destructive">{fieldErrors.phoneNumber}</p>}
            </div>
          </div>
        </DashboardCard>

        {/* ── Endereço ── */}
        <DashboardCard icon={MapPin} title="Endereço">
          <div className="mt-2 space-y-3">
            <div className="space-y-1.5">
              <Label>País</Label>
              <Input value={country} readOnly disabled className="bg-muted/50" />
            </div>
            <div className="space-y-1.5">
              <Label>CEP</Label>
              <div className="relative">
                <Input
                  value={zipCode}
                  onChange={(e) => handleCepChange(e.target.value)}
                  maxLength={9}
                  placeholder="00000-000"
                />
                {loadingCep && <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Rua / Logradouro</Label>
                <Input
                  value={street}
                  onChange={(e) => { setStreet(e.target.value); clearError("street"); }}
                  className={errorClass("street")}
                />
                {fieldErrors.street && <p className="text-xs text-destructive">{fieldErrors.street}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Número</Label>
                <Input value={addrNumber} onChange={(e) => setAddrNumber(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Complemento</Label>
                <Input value={complement} onChange={(e) => setComplement(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Bairro</Label>
                <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Cidade</Label>
                <Input
                  value={city}
                  onChange={(e) => { setCity(e.target.value); clearError("city"); }}
                  className={errorClass("city")}
                />
                {fieldErrors.city && <p className="text-xs text-destructive">{fieldErrors.city}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Input value={state} onChange={(e) => setState(e.target.value)} />
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* ── Usuário ── */}
        <DashboardCard icon={KeyRound} title="Usuário">
          <div className="mt-2 space-y-1.5">
            <Label>Nome de usuário</Label>
            <div className="relative">
              <Input
                value={username}
                onChange={(e) => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 20);
                  setUsername(val);
                  clearError("username");
                }}
                className={`${errorClass("username")} ${usernameError ? "border-destructive" : ""} pr-8`}
              />
              {usernameChecking && <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
              {!usernameChecking && !usernameError && username && username !== mockApiData.username && (
                <CheckCircle2 className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-success" />
              )}
            </div>
            {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
            {fieldErrors.username && !usernameError && <p className="text-xs text-destructive">{fieldErrors.username}</p>}
            <p className="text-[11px] text-muted-foreground">Letras minúsculas, números, ponto e underline. Máx. 20 caracteres.</p>
          </div>
        </DashboardCard>

        {/* ── Dados Financeiros ── */}
        <DashboardCard icon={Landmark} title="Dados Financeiros">
          <div className="mt-2 space-y-3">
            <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-3">
              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                A conta informada deve estar no nome do titular da franquia.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de conta</Label>
              <Select value={financialType} onValueChange={(v: any) => setFinancialType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="bank">Dados Bancários</SelectItem>
                  <SelectItem value="international">Conta Internacional</SelectItem>
                  <SelectItem value="digital">Carteira Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {financialType === "pix" && (
              <div className="space-y-1.5">
                <Label>Chave PIX</Label>
                <Input
                  value={pixKey}
                  onChange={(e) => { setPixKey(e.target.value); clearError("pixKey"); }}
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  className={errorClass("pixKey")}
                />
                {fieldErrors.pixKey && <p className="text-xs text-destructive">{fieldErrors.pixKey}</p>}
              </div>
            )}
            {financialType === "bank" && (
              <>
                <div className="space-y-1.5">
                  <Label>Banco</Label>
                  <Input
                    value={bank}
                    onChange={(e) => { setBank(e.target.value); clearError("bank"); }}
                    className={errorClass("bank")}
                  />
                  {fieldErrors.bank && <p className="text-xs text-destructive">{fieldErrors.bank}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Agência</Label>
                    <Input
                      value={agency}
                      onChange={(e) => { setAgency(e.target.value); clearError("agency"); }}
                      className={errorClass("agency")}
                    />
                    {fieldErrors.agency && <p className="text-xs text-destructive">{fieldErrors.agency}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Conta</Label>
                    <Input
                      value={account}
                      onChange={(e) => { setAccount(e.target.value); clearError("account"); }}
                      className={errorClass("account")}
                    />
                    {fieldErrors.account && <p className="text-xs text-destructive">{fieldErrors.account}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo (opcional)</Label>
                  <Input placeholder="Corrente / Poupança" value={accountType} onChange={(e) => setAccountType(e.target.value)} />
                </div>
              </>
            )}
          </div>
        </DashboardCard>

        {/* ── Franquias ── */}
        <DashboardCard icon={Gem} title="Minhas Franquias">
          <div className="mt-2 space-y-2">
            {mockApiData.franchises.map((f) => (
              <div key={f.franchiseId} className="flex items-center justify-between rounded-md border border-border/60 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">ID {f.franchiseId}</span>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${planColors[f.planCode] || ""}`}>
                    {f.planLabel}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* ── Contrato ── */}
        <DashboardCard icon={FileCheck} title="Contrato Atualizado">
          <div className="mt-2 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="contract"
                checked={contractAccepted}
                onCheckedChange={(v) => { setContractAccepted(!!v); clearError("contract"); }}
                className={fieldErrors.contract ? "border-destructive" : ""}
              />
              <label htmlFor="contract" className="text-sm leading-relaxed cursor-pointer">
                Declaro que li e concordo com o{" "}
                <button
                  type="button"
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                  onClick={() => setContractOpen(true)}
                >
                  Contrato de Franquia TIMOL
                </button>{" "}
                e com as políticas atualizadas do sistema.
              </label>
            </div>
            {fieldErrors.contract && <p className="text-xs text-destructive">{fieldErrors.contract}</p>}
          </div>
        </DashboardCard>

        {/* ── Divergência ── */}
        <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3">
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Encontrou alguma divergência no seu documento ou nas franquias listadas?
            </p>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-warning hover:text-warning/80 mt-0.5"
              onClick={() => { setDivergenceOpen(true); setDivergenceSent(false); setDivergenceText(""); }}
            >
              Reportar divergência
            </Button>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 pb-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
          <Button
            variant="outline"
            onClick={handleLater}
            disabled={saving}
            className="flex-1"
          >
            Atualizar depois
          </Button>
        </div>
      </div>

      {/* ── Divergence Dialog ── */}
      <Dialog open={divergenceOpen} onOpenChange={setDivergenceOpen}>
        <DialogContent className="max-w-md">
          {divergenceSent ? (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold text-foreground">Divergência registrada</h3>
                <p className="text-sm text-muted-foreground">
                  Nossa equipe analisará e entrará em contato.
                </p>
              </div>
              <Button onClick={() => setDivergenceOpen(false)} className="mt-2 w-full max-w-[200px]">
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Reportar Divergência</DialogTitle>
                <DialogDescription>
                  Descreva o problema encontrado no seu documento ou nas franquias listadas. Nossa equipe analisará o caso.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Textarea
                  value={divergenceText}
                  onChange={(e) => setDivergenceText(e.target.value)}
                  placeholder="Descreva a divergência encontrada..."
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDivergenceOpen(false)}>Cancelar</Button>
                <Button onClick={handleDivergenceSend} disabled={!divergenceText.trim()}>Enviar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Contract Modal ── */}
      <Dialog open={contractOpen} onOpenChange={setContractOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <ContractScreen mode="modal" onClose={() => setContractOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

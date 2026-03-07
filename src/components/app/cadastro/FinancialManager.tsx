import { useState } from "react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Landmark, Plus, Trash2, Star, Settings } from "lucide-react";

/* ── types ── */

export type AccountType = "bank" | "pix" | "international" | "digital";

export interface FinancialAccount {
  id: string;
  type: AccountType;
  label: string;
  // Bank fields
  bank?: string;
  agency?: string;
  account?: string;
  accountType?: string;
  // PIX
  pixKey?: string;
  pixKeyType?: string;
  // International
  iban?: string;
  swift?: string;
  bankName?: string;
  // Digital wallet
  provider?: string;
  email?: string;
  isDefault: boolean;
}

const accountTypeLabels: Record<AccountType, string> = {
  bank: "Dados Bancários",
  pix: "PIX",
  international: "Conta Internacional",
  digital: "Carteira Digital",
};

function formatAccountSummary(acc: FinancialAccount): string {
  switch (acc.type) {
    case "bank":
      return [acc.bank, `Ag ${acc.agency}`, `Cc ${acc.account}`, acc.accountType].filter(Boolean).join(" · ");
    case "pix":
      return `PIX: ${acc.pixKey || "—"}`;
    case "international":
      return [acc.bankName, acc.iban, acc.swift].filter(Boolean).join(" · ");
    case "digital":
      return [acc.provider, acc.email].filter(Boolean).join(" · ");
    default:
      return acc.label;
  }
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground text-sm shrink-0">{label}</span>
      <span className="text-sm font-medium text-right break-words min-w-0">{value}</span>
    </div>
  );
}

/* ── props ── */

interface Props {
  accounts: FinancialAccount[];
  onChange: (accounts: FinancialAccount[]) => void;
}

export function FinancialManager({ accounts, onChange }: Props) {
  const [listOpen, setListOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [formType, setFormType] = useState<AccountType>("bank");
  const [form, setForm] = useState<Record<string, string>>({});

  const defaultAcc = accounts.find((a) => a.isDefault);

  const handleSetDefault = (id: string) => {
    onChange(accounts.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const toggleDeleteSelection = (id: string) => {
    setSelectedForDelete((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirmDelete = () => {
    const remaining = accounts.filter((a) => !selectedForDelete.has(a.id));
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) remaining[0].isDefault = true;
    onChange(remaining);
    setSelectedForDelete(new Set());
    setDeleteMode(false);
    setConfirmDeleteOpen(false);
  };

  const handleAdd = () => {
    const newAcc: FinancialAccount = {
      id: crypto.randomUUID(),
      type: formType,
      label: form.label || accountTypeLabels[formType],
      bank: form.bank,
      agency: form.agency,
      account: form.account,
      accountType: form.accountType,
      pixKey: form.pixKey,
      pixKeyType: form.pixKeyType,
      iban: form.iban,
      swift: form.swift,
      bankName: form.bankName,
      provider: form.provider,
      email: form.email,
      isDefault: accounts.length === 0,
    };
    onChange([...accounts, newAcc]);
    setForm({});
    setAddOpen(false);
  };

  const renderFormFields = () => {
    switch (formType) {
      case "bank":
        return (
          <>
            <div className="space-y-2"><Label>Banco</Label><Input value={form.bank || ""} onChange={(e) => setForm((p) => ({ ...p, bank: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Agência</Label><Input value={form.agency || ""} onChange={(e) => setForm((p) => ({ ...p, agency: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Conta</Label><Input value={form.account || ""} onChange={(e) => setForm((p) => ({ ...p, account: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Tipo</Label><Input placeholder="Corrente / Poupança" value={form.accountType || ""} onChange={(e) => setForm((p) => ({ ...p, accountType: e.target.value }))} /></div>
          </>
        );
      case "pix":
        return (
          <>
            <div className="space-y-2"><Label>Tipo de chave</Label><Input placeholder="CPF, E-mail, Telefone, Aleatória" value={form.pixKeyType || ""} onChange={(e) => setForm((p) => ({ ...p, pixKeyType: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Chave PIX</Label><Input value={form.pixKey || ""} onChange={(e) => setForm((p) => ({ ...p, pixKey: e.target.value }))} /></div>
          </>
        );
      case "international":
        return (
          <>
            <div className="space-y-2"><Label>Banco</Label><Input value={form.bankName || ""} onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))} /></div>
            <div className="space-y-2"><Label>IBAN</Label><Input value={form.iban || ""} onChange={(e) => setForm((p) => ({ ...p, iban: e.target.value }))} /></div>
            <div className="space-y-2"><Label>SWIFT/BIC</Label><Input value={form.swift || ""} onChange={(e) => setForm((p) => ({ ...p, swift: e.target.value }))} /></div>
          </>
        );
      case "digital":
        return (
          <>
            <div className="space-y-2"><Label>Provedor</Label><Input placeholder="PagSeguro, PayPal, Mercado Pago..." value={form.provider || ""} onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))} /></div>
            <div className="space-y-2"><Label>E-mail / Identificador</Label><Input value={form.email || ""} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
          </>
        );
    }
  };

  return (
    <>
      <DashboardCard icon={Landmark} title="Dados Financeiros">
        <div className="mt-1">
          {defaultAcc ? (
            <>
              <Row label={accountTypeLabels[defaultAcc.type]} value={formatAccountSummary(defaultAcc)} />
              {defaultAcc.type === "bank" && defaultAcc.pixKey && (
                <Row label="Chave PIX" value={defaultAcc.pixKey} />
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada.</p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-xs h-7 w-full gap-1.5"
            onClick={() => { setListOpen(true); setDeleteMode(false); setSelectedForDelete(new Set()); }}
          >
            <Settings className="h-3 w-3" />
            Gerenciar contas
          </Button>
        </div>
      </DashboardCard>

      {/* Account list dialog */}
      <Dialog open={listOpen} onOpenChange={setListOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Minhas Contas</DialogTitle>
            <DialogDescription>Selecione a conta principal ou gerencie suas contas.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className={`rounded-md border p-3 cursor-pointer transition-colors ${
                  acc.isDefault ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}
                onClick={() => !deleteMode && handleSetDefault(acc.id)}
              >
                <div className="flex items-start gap-3">
                  {deleteMode ? (
                    <Checkbox
                      checked={selectedForDelete.has(acc.id)}
                      onCheckedChange={() => toggleDeleteSelection(acc.id)}
                      className="mt-0.5"
                      disabled={acc.isDefault}
                    />
                  ) : (
                    <div className={`mt-1 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      acc.isDefault ? "border-primary" : "border-muted-foreground/40"
                    }`}>
                      {acc.isDefault && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{acc.label}</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{accountTypeLabels[acc.type]}</Badge>
                      {acc.isDefault && (
                        <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          Padrão
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{formatAccountSummary(acc)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => { setAddOpen(true); setForm({}); setFormType("bank"); }}>
              <Plus className="h-4 w-4" />
              Adicionar conta
            </Button>
            {accounts.length > 1 && !deleteMode && (
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteMode(true)}>
                <Trash2 className="h-4 w-4" />
                Excluir contas
              </Button>
            )}
            {deleteMode && (
              <div className="flex gap-2 w-full">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setDeleteMode(false); setSelectedForDelete(new Set()); }}>Cancelar</Button>
                <Button variant="destructive" size="sm" className="flex-1" disabled={selectedForDelete.size === 0} onClick={() => setConfirmDeleteOpen(true)}>
                  Excluir ({selectedForDelete.size})
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add account dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Conta</DialogTitle>
            <DialogDescription>Escolha o tipo e preencha os dados.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de conta</Label>
              <Select value={formType} onValueChange={(v) => { setFormType(v as AccountType); setForm({}); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Dados Bancários</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="international">Conta Internacional</SelectItem>
                  <SelectItem value="digital">Carteira Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Apelido (opcional)</Label>
              <Input placeholder="Ex: Conta Principal" value={form.label || ""} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} />
            </div>
            {renderFormFields()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir {selectedForDelete.size} conta(s). Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

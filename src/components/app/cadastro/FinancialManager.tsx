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
import { Landmark, Plus, Trash2, Settings, Pencil, Info, AlertTriangle } from "lucide-react";

/* ── types ── */

export type AccountType = "bank" | "pix" | "international" | "digital";
export type AccountStatus = "pending" | "verified" | "rejected";

export interface FinancialAccount {
  id: string;
  type: AccountType;
  label: string;
  bank?: string;
  agency?: string;
  account?: string;
  accountType?: string;
  pixKey?: string;
  pixKeyType?: string;
  iban?: string;
  swift?: string;
  bankName?: string;
  provider?: string;
  email?: string;
  isDefault: boolean;
  status: AccountStatus;
}

const accountTypeLabels: Record<AccountType, string> = {
  bank: "Dados Bancários",
  pix: "PIX",
  international: "Conta Internacional",
  digital: "Carteira Digital",
};

const statusConfig: Record<AccountStatus, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "border-warning/40 text-warning bg-warning/10" },
  verified: { label: "Verificada", className: "border-emerald-500/40 text-emerald-600 bg-emerald-50" },
  rejected: { label: "Rejeitada", className: "border-destructive/40 text-destructive bg-destructive/10" },
};

function formatAccountSummary(acc: FinancialAccount): string {
  switch (acc.type) {
    case "bank":
      return [acc.bank, `Ag ${acc.agency}`, `Cc ${acc.account}`, acc.accountType].filter(Boolean).join(" · ");
    case "pix":
      return acc.pixKey || "—";
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
    <div className="flex flex-wrap gap-x-3 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground text-sm shrink-0">{label}</span>
      <span className="text-sm font-medium whitespace-nowrap min-w-0">{value}</span>
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [formType, setFormType] = useState<AccountType>("bank");
  const [form, setForm] = useState<Record<string, string>>({});

  const allSelectedForDelete = selectedForDelete.size > 0 && selectedForDelete.size >= accounts.length;
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

  const openAddDialog = () => {
    setEditingId(null);
    setForm({});
    setFormType("bank");
    setAddOpen(true);
  };

  const openEditDialog = (acc: FinancialAccount) => {
    setEditingId(acc.id);
    setFormType(acc.type);
    setForm({
      label: acc.label || "",
      bank: acc.bank || "",
      agency: acc.agency || "",
      account: acc.account || "",
      accountType: acc.accountType || "",
      pixKey: acc.pixKey || "",
      pixKeyType: acc.pixKeyType || "",
      iban: acc.iban || "",
      swift: acc.swift || "",
      bankName: acc.bankName || "",
      provider: acc.provider || "",
      email: acc.email || "",
    });
    setAddOpen(true);
  };

  const MAX_ACCOUNTS = 5;
  const isAtLimit = !editingId && accounts.length >= MAX_ACCOUNTS;

  const isFormValid = (): boolean => {
    switch (formType) {
      case "pix": return !!(form.pixKey?.trim());
      case "bank": return !!(form.bank?.trim() && form.agency?.trim() && form.account?.trim());
      case "international": return !!(form.iban?.trim() || form.swift?.trim());
      case "digital": return !!(form.provider?.trim() && form.email?.trim());
      default: return false;
    }
  };

  const handleSave = () => {
    if (!isFormValid()) return;
    if (editingId) {
      onChange(accounts.map((a) => a.id === editingId ? {
        ...a,
        type: formType,
        label: form.label || accountTypeLabels[formType],
        bank: form.bank, agency: form.agency, account: form.account, accountType: form.accountType,
        pixKey: form.pixKey, pixKeyType: form.pixKeyType,
        iban: form.iban, swift: form.swift, bankName: form.bankName,
        provider: form.provider, email: form.email,
      } : a));
    } else {
      const newAcc: FinancialAccount = {
        id: crypto.randomUUID(),
        type: formType,
        label: form.label || accountTypeLabels[formType],
        bank: form.bank, agency: form.agency, account: form.account, accountType: form.accountType,
        pixKey: form.pixKey, pixKeyType: form.pixKeyType,
        iban: form.iban, swift: form.swift, bankName: form.bankName,
        provider: form.provider, email: form.email,
        isDefault: accounts.length === 0,
        status: "pending",
      };
      onChange([...accounts, newAcc]);
    }
    setForm({});
    setEditingId(null);
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
            <div className="space-y-2"><Label>Tipo (opcional)</Label><Input placeholder="Corrente / Poupança" value={form.accountType || ""} onChange={(e) => setForm((p) => ({ ...p, accountType: e.target.value }))} /></div>
          </>
        );
      case "pix":
        return (
          <>
            <div className="space-y-2"><Label>Chave PIX</Label><Input placeholder="CPF, e-mail, telefone ou chave aleatória" value={form.pixKey || ""} onChange={(e) => setForm((p) => ({ ...p, pixKey: e.target.value }))} /></div>
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
        <div className="mt-1 flex-1">
          {defaultAcc ? (
            <Row label={accountTypeLabels[defaultAcc.type]} value={formatAccountSummary(defaultAcc)} />
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada.</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 text-xs h-7 w-full gap-1.5"
          onClick={() => { setListOpen(true); setDeleteMode(false); setSelectedForDelete(new Set()); }}
        >
          <Settings className="h-3 w-3" />
          Gerenciar contas
        </Button>
      </DashboardCard>

      {/* Account list dialog */}
      <Dialog open={listOpen} onOpenChange={setListOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Minhas Contas</DialogTitle>
            <DialogDescription>Selecione a conta principal ou gerencie suas contas.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {accounts.map((acc) => {
              const st = statusConfig[acc.status];
              return (
                <div
                  key={acc.id}
                  className={`rounded-md border p-3 cursor-pointer transition-colors ${
                    !deleteMode && acc.isDefault ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    if (deleteMode) {
                      toggleDeleteSelection(acc.id);
                    } else {
                      handleSetDefault(acc.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {deleteMode ? (
                      <Checkbox
                        checked={selectedForDelete.has(acc.id)}
                        onCheckedChange={() => toggleDeleteSelection(acc.id)}
                        className="mt-0.5"
                      />
                    ) : (
                      <div className={`mt-1 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        acc.isDefault ? "border-primary" : "border-muted-foreground/40"
                      }`}>
                        {acc.isDefault && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{acc.label}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{accountTypeLabels[acc.type]}</Badge>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${st.className}`}>
                          {st.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatAccountSummary(acc)}</p>
                    </div>
                    {!deleteMode && (
                      <button
                        type="button"
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(acc);
                        }}
                        aria-label="Editar conta"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            {!deleteMode && (
              accounts.length >= MAX_ACCOUNTS ? (
                <div className="flex items-start gap-2 rounded-md border border-muted bg-muted/30 p-3">
                  <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Você atingiu o limite de {MAX_ACCOUNTS} contas. Para adicionar uma nova, exclua uma conta existente.
                  </p>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={openAddDialog}>
                  <Plus className="h-4 w-4" />
                  Adicionar conta
                </Button>
              )
            )}
            {accounts.length > 1 && !deleteMode && (
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteMode(true)}>
                <Trash2 className="h-4 w-4" />
                Excluir contas
              </Button>
            )}
            {deleteMode && (
              <div className="flex flex-col gap-2 w-full">
                {allSelectedForDelete && (
                  <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3">
                    <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-warning leading-relaxed">
                      Não é possível excluir todas as contas. É necessário manter pelo menos uma cadastrada. Para substituir a atual, adicione uma nova conta primeiro e depois exclua a anterior.
                    </p>
                  </div>
                )}
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setDeleteMode(false); setSelectedForDelete(new Set()); }}>Cancelar</Button>
                  <Button variant="destructive" size="sm" className="flex-1" disabled={selectedForDelete.size === 0 || allSelectedForDelete} onClick={() => setConfirmDeleteOpen(true)}>
                    Excluir ({selectedForDelete.size})
                  </Button>
                </div>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit account dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto" onKeyDown={(e) => { if (e.key === "Enter" && isFormValid()) { e.preventDefault(); handleSave(); } }}>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Conta" : "Nova Conta"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os dados da conta." : "Escolha o tipo e preencha os dados."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!editingId && (
              <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-3">
                <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A conta informada deve estar no nome do titular da franquia.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Tipo de conta</Label>
              <Select value={formType} onValueChange={(v) => { setFormType(v as AccountType); if (!editingId) setForm({}); }}>
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
            <Button onClick={handleSave} disabled={!isFormValid()}>Salvar</Button>
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

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getCountryCurrency } from "@/data/country-currencies";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { countries, getCountryName } from "@/data/countries";
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
import { MapPin, Plus, Trash2, Loader2, X, Pencil, AlertTriangle, Info } from "lucide-react";

/* ── types ── */

export interface Address {
  id: string;
  label: string;
  country: string;
  countryIso2: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  isDefault: boolean;
}

interface Props {
  addresses: Address[];
  onChange: (addresses: Address[]) => void;
  currentCountryIso2?: string;
  franchiseCurrency?: string;
  /** When true, only render dialogs (no summary/button). Use open/onOpenChange to control. */
  dialogOnly?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/* ── helpers ── */

const emptyAddress = (): Omit<Address, "id" | "isDefault"> => ({
  label: "",
  country: "",
  countryIso2: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
});

function formatAddress(a: Address): string {
  const parts = [a.street, a.number, a.complement, a.neighborhood, `${a.city} - ${a.state}`, a.zipCode, a.country].filter(Boolean);
  return parts.join(", ");
}

/* ── component ── */

export function AddressManager({ addresses, onChange, currentCountryIso2 = "BR", franchiseCurrency = "BRL", dialogOnly, open: externalOpen, onOpenChange }: Props) {
  const [listOpen, setListOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [form, setForm] = useState(emptyAddress());
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryList, setShowCountryList] = useState(false);
  const [showCountryField, setShowCountryField] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  // Controlled mode: sync external open state
  useEffect(() => {
    if (dialogOnly && externalOpen !== undefined) {
      setListOpen(externalOpen);
    }
  }, [dialogOnly, externalOpen]);

  const handleListOpenChange = (v: boolean) => {
    setListOpen(v);
    if (dialogOnly && onOpenChange) onOpenChange(v);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setShowCountryList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isBrazil = form.countryIso2 === "BR";

  // Currency validation
  const selectedCurrency = form.countryIso2 ? getCountryCurrency(form.countryIso2) : null;
  const isSameCurrency = selectedCurrency === franchiseCurrency;
  const isDifferentCurrency = form.countryIso2 && !isSameCurrency;

  const fetchCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setLoadingCep(true);
    setCepError("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const json = await res.json();
      if (json.erro) {
        setCepError("CEP não encontrado");
      } else {
        setForm((prev) => ({
          ...prev,
          street: json.logradouro || prev.street,
          neighborhood: json.bairro || prev.neighborhood,
          city: json.localidade || prev.city,
          state: json.uf || prev.state,
        }));
      }
    } catch {
      setCepError("Erro ao buscar CEP");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (val: string) => {
    const masked = val.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
    setForm((prev) => ({ ...prev, zipCode: masked }));
    if (masked.replace(/\D/g, "").length === 8 && isBrazil) fetchCep(masked);
  };

  const filteredCountries = countries.filter((c) =>
    getCountryName(c, "pt").toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectCountry = (iso2: string) => {
    const c = countries.find((x) => x.iso2 === iso2);
    if (c) {
      setForm((prev) => ({ ...prev, country: getCountryName(c, "pt"), countryIso2: iso2 }));
    }
    setShowCountryList(false);
    setCountrySearch("");
  };

  const clearCountry = () => {
    setForm((prev) => ({ ...prev, country: "", countryIso2: "" }));
    setCountrySearch("");
  };

  const openAddDialog = () => {
    setEditingId(null);
    // Pre-fill country from current franchise country
    const defaultCountry = countries.find((c) => c.iso2 === currentCountryIso2);
    const base = emptyAddress();
    if (defaultCountry) {
      base.country = getCountryName(defaultCountry, "pt");
      base.countryIso2 = currentCountryIso2;
    }
    setForm(base);
    setShowCountryField(false);
    setAddOpen(true);
  };

  const openEditDialog = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      country: addr.country,
      countryIso2: addr.countryIso2,
      zipCode: addr.zipCode,
      street: addr.street,
      number: addr.number,
      complement: addr.complement,
      neighborhood: addr.neighborhood,
      city: addr.city,
      state: addr.state,
    });
    setShowCountryField(addr.countryIso2 !== currentCountryIso2);
    setAddOpen(true);
  };

  const handleSaveAddress = () => {
    if (!form.street || !form.city || !form.country) return;
    if (editingId) {
      onChange(addresses.map((a) => a.id === editingId ? { ...a, ...form } : a));
    } else {
      const newAddr: Address = {
        ...form,
        id: crypto.randomUUID(),
        isDefault: addresses.length === 0,
      };
      onChange([...addresses, newAddr]);
    }
    setForm(emptyAddress());
    setEditingId(null);
    setAddOpen(false);
  };

  const handleSetDefault = (id: string) => {
    onChange(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
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
    const remaining = addresses.filter((a) => !selectedForDelete.has(a.id));
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    onChange(remaining);
    setSelectedForDelete(new Set());
    setDeleteMode(false);
    setConfirmDeleteOpen(false);
  };

  const MAX_ADDRESSES = 5;
  const allSelectedForDelete = selectedForDelete.size > 0 && selectedForDelete.size >= addresses.length;
  const defaultAddr = addresses.find((a) => a.isDefault);

  return (
    <>
      {/* Summary in card (hidden in dialogOnly mode) */}
      {!dialogOnly && (
        <>
          <div className="mt-1 flex-1">
            {defaultAddr && <p className="text-sm">{formatAddress(defaultAddr)}</p>}
            {!defaultAddr && <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-xs h-7 w-full"
            onClick={() => { setListOpen(true); setDeleteMode(false); setSelectedForDelete(new Set()); }}
          >
            <MapPin className="h-3 w-3 mr-1" />
            {defaultAddr ? "Escolher endereço" : "Adicionar endereço"}
          </Button>
        </>
      )}

      {/* Address list popup */}
      <Dialog open={listOpen} onOpenChange={handleListOpenChange}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Endereços</DialogTitle>
            <DialogDescription>Selecione o endereço principal ou gerencie seus endereços.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`rounded-md border p-3 cursor-pointer transition-colors ${
                  !deleteMode && addr.isDefault ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}
                onClick={() => {
                  if (deleteMode) {
                    toggleDeleteSelection(addr.id);
                  } else {
                    handleSetDefault(addr.id);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  {deleteMode ? (
                    <Checkbox
                      checked={selectedForDelete.has(addr.id)}
                      onCheckedChange={() => toggleDeleteSelection(addr.id)}
                      className="mt-0.5"
                    />
                  ) : (
                    <div className={`mt-1 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      addr.isDefault ? "border-primary" : "border-muted-foreground/40"
                    }`}>
                      {addr.isDefault && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {addr.label && <p className="text-sm font-semibold">{addr.label}</p>}
                    <p className="text-sm text-muted-foreground">{formatAddress(addr)}</p>
                  </div>
                  {!deleteMode && (
                    <button
                      type="button"
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(addr);
                      }}
                      aria-label="Editar endereço"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            {!deleteMode && (
              addresses.length >= MAX_ADDRESSES ? (
                <div className="flex items-start gap-2 rounded-md border border-muted bg-muted/30 p-3">
                  <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Você atingiu o limite de {MAX_ADDRESSES} endereços. Para adicionar um novo, exclua um endereço existente.
                  </p>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={openAddDialog}>
                  <Plus className="h-4 w-4" />
                  Adicionar endereço
                </Button>
              )
            )}
            {addresses.length > 1 && !deleteMode && (
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteMode(true)}>
                <Trash2 className="h-4 w-4" />
                Excluir endereços
              </Button>
            )}
            {deleteMode && (
              <div className="flex flex-col gap-2 w-full">
                {allSelectedForDelete && (
                  <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3">
                    <Info className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-warning leading-relaxed">
                      Não é possível excluir todos os endereços. É necessário manter pelo menos um cadastrado. Para substituir o atual, adicione um novo endereço primeiro e depois exclua o anterior.
                    </p>
                  </div>
                )}
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setDeleteMode(false); setSelectedForDelete(new Set()); }}>
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    disabled={selectedForDelete.size === 0 || allSelectedForDelete}
                    onClick={() => setConfirmDeleteOpen(true)}
                  >
                    Excluir selecionados ({selectedForDelete.size})
                  </Button>
                </div>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit address popup */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" onKeyDown={(e) => { if (e.key === "Enter" && form.street && form.city && form.country) { e.preventDefault(); handleSaveAddress(); } }}>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Endereço" : "Novo Endereço"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os dados do endereço." : "Preencha os dados do novo endereço."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Label */}
            <div className="space-y-2">
              <Label>Apelido (opcional)</Label>
              <Input placeholder="Ex: Casa, Trabalho" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} />
            </div>

            {/* Country (hidden by default, shown via "alterar país") */}
            {showCountryField && (
              <div className="space-y-2 relative" ref={countryRef}>
                <Label>País</Label>
                {form.country ? (
                  <div className="relative">
                    <Input value={form.country} readOnly className="pr-8" />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={clearCountry}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Input
                    placeholder="Buscar país..."
                    value={countrySearch}
                    onChange={(e) => { setCountrySearch(e.target.value); setShowCountryList(true); }}
                    onFocus={() => setShowCountryList(true)}
                  />
                )}
                {showCountryList && !form.country && (
                  <div className="absolute z-50 w-full bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                    {filteredCountries.map((c) => (
                      <button key={c.iso2} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-muted" onClick={() => selectCountry(c.iso2)}>
                        {getCountryName(c, "pt")}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Currency hint — same currency */}
            {form.countryIso2 && isSameCurrency && form.countryIso2 !== currentCountryIso2 && (
              <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3">
                <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-primary leading-relaxed">
                  Este país utiliza a mesma moeda da sua franquia. Custos de envio e possíveis tarifas de importação ou exportação podem variar de acordo com as políticas locais.
                </p>
              </div>
            )}

            {/* Currency hint — different currency (informational) */}
            {isDifferentCurrency && (
              <div className="flex items-start gap-2 rounded-md border border-yellow-500/40 bg-yellow-50 p-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700 leading-relaxed">
                  Este país utiliza uma moeda diferente da configurada na sua franquia. Ao realizar um novo pedido, verifique os custos e tarifas adicionais antes de concluir. Alguns produtos podem não estar disponíveis para o país selecionado.
                </p>
              </div>
            )}

            {/* CEP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{isBrazil ? "CEP" : "Código Postal"}</Label>
                {!showCountryField && (
                  <button
                    type="button"
                    className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                    onClick={() => setShowCountryField(true)}
                  >
                    Alterar país
                  </button>
                )}
              </div>
              <div className="relative">
                <Input placeholder={isBrazil ? "00000-000" : "Código postal"} value={form.zipCode} onChange={(e) => handleCepChange(e.target.value)} maxLength={9} />
                {loadingCep && <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
              </div>
              {cepError && <p className="text-sm text-destructive">{cepError}</p>}
            </div>

            {/* Address fields */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label>Rua / Logradouro</Label>
                <Input value={form.street} onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Número</Label>
                <Input value={form.number} onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input value={form.complement} onChange={(e) => setForm((p) => ({ ...p, complement: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Input value={form.neighborhood} onChange={(e) => setForm((p) => ({ ...p, neighborhood: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveAddress} disabled={!form.street || !form.city || !form.country}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir {selectedForDelete.size} endereço(s). Esta ação não pode ser desfeita.
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

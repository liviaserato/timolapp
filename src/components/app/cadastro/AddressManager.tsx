import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { MapPin, Plus, Trash2, Loader2, X } from "lucide-react";

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

export function AddressManager({ addresses, onChange }: Props) {
  const [listOpen, setListOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [form, setForm] = useState(emptyAddress());
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryList, setShowCountryList] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

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
    if (c) setForm((prev) => ({ ...prev, country: getCountryName(c, "pt"), countryIso2: iso2 }));
    setShowCountryList(false);
    setCountrySearch("");
  };

  const clearCountry = () => {
    setForm((prev) => ({ ...prev, country: "", countryIso2: "" }));
    setCountrySearch("");
  };

  const handleAddAddress = () => {
    if (!form.street || !form.city || !form.country) return;
    const newAddr: Address = {
      ...form,
      id: crypto.randomUUID(),
      isDefault: addresses.length === 0,
    };
    onChange([...addresses, newAddr]);
    setForm(emptyAddress());
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

  const defaultAddr = addresses.find((a) => a.isDefault);

  return (
    <>
      {/* Summary in card */}
      {defaultAddr && <p className="mt-1 text-sm">{formatAddress(defaultAddr)}</p>}
      {!defaultAddr && <p className="mt-1 text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>}
      <Button
        variant="outline"
        size="sm"
        className="mt-2 text-xs h-7 w-full"
        onClick={() => { setListOpen(true); setDeleteMode(false); setSelectedForDelete(new Set()); }}
      >
        <MapPin className="h-3 w-3 mr-1" />
        {defaultAddr ? "Trocar endereço" : "Adicionar endereço"}
      </Button>

      {/* Address list popup */}
      <Dialog open={listOpen} onOpenChange={setListOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meus Endereços</DialogTitle>
            <DialogDescription>Selecione o endereço principal ou gerencie seus endereços.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`rounded-md border p-3 cursor-pointer transition-colors ${
                  addr.isDefault ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}
                onClick={() => !deleteMode && handleSetDefault(addr.id)}
              >
                <div className="flex items-start gap-3">
                  {deleteMode ? (
                    <Checkbox
                      checked={selectedForDelete.has(addr.id)}
                      onCheckedChange={() => toggleDeleteSelection(addr.id)}
                      className="mt-0.5"
                      disabled={addr.isDefault}
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
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => { setAddOpen(true); }}>
              <Plus className="h-4 w-4" />
              Adicionar endereço
            </Button>
            {addresses.length > 1 && !deleteMode && (
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteMode(true)}>
                <Trash2 className="h-4 w-4" />
                Excluir endereços
              </Button>
            )}
            {deleteMode && (
              <div className="flex gap-2 w-full">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setDeleteMode(false); setSelectedForDelete(new Set()); }}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  disabled={selectedForDelete.size === 0}
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  Excluir selecionados ({selectedForDelete.size})
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add address popup */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Endereço</DialogTitle>
            <DialogDescription>Preencha os dados do novo endereço.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Label */}
            <div className="space-y-2">
              <Label>Apelido (opcional)</Label>
              <Input placeholder="Ex: Casa, Trabalho" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} />
            </div>

            {/* Country */}
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

            {/* CEP */}
            <div className="space-y-2">
              <Label>{isBrazil ? "CEP" : "Código Postal"}</Label>
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
            <Button onClick={handleAddAddress} disabled={!form.street || !form.city || !form.country}>Salvar</Button>
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

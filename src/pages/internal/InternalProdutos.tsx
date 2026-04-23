import { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Search, X, Plus, Package, ChevronLeft, ChevronRight,
  Upload, Trash2, Eye, Pencil, Copy,
  ChevronDown, Languages, ArrowUpDown, ArrowUp, ArrowDown,
  LayoutGrid, List,
} from "lucide-react";
import { categories, products as mockProducts, type Product, type Category } from "@/data/mock-products";
import { toast } from "sonner";
import { ProductCardUnified } from "@/components/app/pedidos/store/ProductCardUnified";


/* ── Constants ── */
const PAGE_SIZE_OPTIONS = [20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

const COUNTRIES = [
  { id: "BR", label: "Brasil", flag: "🇧🇷" },
  { id: "PY", label: "Paraguai", flag: "🇵🇾" },
  { id: "EU", label: "Europa", flag: "🇪🇺" },
  { id: "US", label: "EUA", flag: "🇺🇸" },
  { id: "CA", label: "Canadá", flag: "🇨🇦" },
];

const CURRENCIES = [
  { id: "BRL", label: "Real (R$)", symbol: "R$" },
  { id: "USD", label: "Dólar (US$)", symbol: "US$" },
  { id: "EUR", label: "Euro (€)", symbol: "€" },
];

const PRICE_TYPES = [
  { id: "consultor", label: "Consultor" },
  { id: "distribuidor", label: "Distribuidor" },
  { id: "cliente_final", label: "Cliente Final" },
];

const LANGUAGES = [
  { id: "pt", label: "Português", flag: "🇧🇷" },
  { id: "en", label: "English", flag: "🇺🇸" },
  { id: "es", label: "Español", flag: "🇪🇸" },
];

// Field labels translated per language (pt = base, en/es shown on the right column)
const FIELD_LABELS: Record<string, Record<string, string>> = {
  pt: {
    name: "Nome do produto",
    description: "Descrição",
    benefits: "Benefícios",
    instructions: "Instruções de uso",
    warranty: "Garantia",
    composition: "Composição",
    manufacturer: "Fabricante",
  },
  en: {
    name: "Product name",
    description: "Description",
    benefits: "Benefits",
    instructions: "Instructions for use",
    warranty: "Warranty",
    composition: "Composition",
    manufacturer: "Manufacturer",
  },
  es: {
    name: "Nombre del producto",
    description: "Descripción",
    benefits: "Beneficios",
    instructions: "Instrucciones de uso",
    warranty: "Garantía",
    composition: "Composición",
    manufacturer: "Fabricante",
  },
};

const ALWAYS_VISIBLE_FIELDS = [
  { key: "name", type: "input" as const },
  { key: "description", type: "textarea" as const },
];

const COLLAPSIBLE_FIELDS = [
  { key: "benefits", type: "textarea" as const },
  { key: "instructions", type: "textarea" as const },
  { key: "warranty", type: "textarea" as const },
  { key: "composition", type: "textarea" as const },
  { key: "manufacturer", type: "textarea" as const },
];

const ALL_ML_FIELDS = [...ALWAYS_VISIBLE_FIELDS, ...COLLAPSIBLE_FIELDS];

/* ── Synced-height textarea pair ──
 * Renders two textareas side-by-side and keeps both at the same height
 * (the max of their natural content heights). */
function SyncedTextareaPair({
  leftValue, rightValue,
  onLeftChange, onRightChange,
  leftPlaceholder, rightPlaceholder,
  minRows = 3,
}: {
  leftValue: string;
  rightValue: string;
  onLeftChange: (v: string) => void;
  onRightChange: (v: string) => void;
  leftPlaceholder?: string;
  rightPlaceholder?: string;
  minRows?: number;
}) {
  const leftRef = useRef<HTMLTextAreaElement>(null);
  const rightRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const l = leftRef.current;
    const r = rightRef.current;
    if (!l || !r) return;
    l.style.height = "auto";
    r.style.height = "auto";
    const max = Math.max(l.scrollHeight, r.scrollHeight);
    l.style.height = `${max}px`;
    r.style.height = `${max}px`;
  }, [leftValue, rightValue]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Textarea
        ref={leftRef}
        rows={minRows}
        value={leftValue}
        onChange={e => onLeftChange(e.target.value)}
        placeholder={leftPlaceholder}
        className="resize-none overflow-hidden"
      />
      <Textarea
        ref={rightRef}
        rows={minRows}
        value={rightValue}
        onChange={e => onRightChange(e.target.value)}
        placeholder={rightPlaceholder}
        className="resize-none overflow-hidden"
      />
    </div>
  );
}

/* ── Helpers ── */
function norm(s: string) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Splits a BRL formatted currency into symbol and amount, e.g. "R$ 1.234,56" → { symbol: "R$", amount: "1.234,56" } */
function splitCurrency(v: number) {
  const formatted = v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const match = formatted.match(/^(\D+)\s*(.+)$/);
  if (match) return { symbol: match[1].trim(), amount: match[2] };
  return { symbol: "R$", amount: formatted };
}

/** Deterministic stock info derived from product id (mock data has no real stock fields) */
function getStockInfo(p: Product) {
  // Hash the id for a stable pseudo-random number
  let h = 0;
  for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) >>> 0;
  const min = 5 + (h % 11);          // 5..15
  const max = 60 + ((h >> 4) % 81);   // 60..140
  const qty = p.inStock
    ? min + ((h >> 8) % Math.max(1, max - min + 1))
    : 0;
  const lowStock = p.inStock && qty <= min;
  // Sales last 30 days: 0 if out of stock, else pseudo-random 0..120
  const sales30d = p.inStock ? ((h >> 12) % 121) : 0;
  return { qty, min, max, lowStock, sales30d };
}

/* ── New Product Dialog ── */
interface NewProductDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

function NewProductDialog({ open, onOpenChange }: NewProductDialogProps) {
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [secondaryLang, setSecondaryLang] = useState<"en" | "es">("en");
  const [multilingualData, setMultilingualData] = useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {};
    LANGUAGES.forEach(l => {
      init[l.id] = {};
      ALL_ML_FIELDS.forEach(f => { init[l.id][f.key] = ""; });
    });
    return init;
  });

  const [points, setPoints] = useState("");

  const [collapsibleOpen, setCollapsibleOpen] = useState<Record<string, boolean>>({});
  const [visibleCountries, setVisibleCountries] = useState<string[]>(["BR"]);

  // Prices: { currency: { priceType: value } }
  const [prices, setPrices] = useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {};
    CURRENCIES.forEach(c => {
      init[c.id] = {};
      PRICE_TYPES.forEach(p => { init[c.id][p.id] = ""; });
    });
    return init;
  });
  

  const [activatable, setActivatable] = useState(false);
  const [activationDays, setActivationDays] = useState("30");

  const [pkgHeight, setPkgHeight] = useState("");
  const [pkgWidth, setPkgWidth] = useState("");
  const [pkgLength, setPkgLength] = useState("");
  const [pkgDiameter, setPkgDiameter] = useState("");
  const [pkgWeight, setPkgWeight] = useState("");

  const [mediaFiles, setMediaFiles] = useState<{ name: string; url: string }[]>([]);

  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  // Dirty check — any user-touched field
  const isDirty = useMemo(() => {
    if (sku.trim() || category || subcategory || points.trim() || activatable) return true;
    if (pkgHeight || pkgWidth || pkgLength || pkgDiameter || pkgWeight) return true;
    if (mediaFiles.length > 0) return true;
    if (visibleCountries.length !== 1 || visibleCountries[0] !== "BR") return true;
    for (const lang of Object.keys(multilingualData)) {
      for (const k of Object.keys(multilingualData[lang])) {
        if (multilingualData[lang][k].trim()) return true;
      }
    }
    for (const cur of Object.keys(prices)) {
      for (const pt of Object.keys(prices[cur])) {
        if (prices[cur][pt].trim()) return true;
      }
    }
    return false;
  }, [sku, category, subcategory, points, activatable, pkgHeight, pkgWidth, pkgLength, pkgDiameter, pkgWeight, mediaFiles, visibleCountries, multilingualData, prices]);

  const handleOpenChange = (next: boolean) => {
    if (!next && isDirty) {
      setConfirmCloseOpen(true);
      return;
    }
    onOpenChange(next);
  };


  const selectedCategory = categories.find(c => c.id === category);

  const updateML = (lang: string, field: string, value: string) => {
    setMultilingualData(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
  };

  const translateField = (lang: string, fieldKey: string) => {
    const ptValue = multilingualData.pt[fieldKey];
    if (!ptValue.trim()) { toast.error("Preencha o campo em Português primeiro"); return; }
    // Simulated translation — in production use AI translation API
    updateML(lang, fieldKey, ptValue + ` [${lang.toUpperCase()}]`);
    toast.success(`Campo traduzido para ${lang === "en" ? "Inglês" : "Espanhol"}`);
  };

  const toggleCollapsible = (key: string) => {
    setCollapsibleOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updatePrice = (currency: string, priceType: string, value: string) => {
    setPrices(prev => ({ ...prev, [currency]: { ...prev[currency], [priceType]: value } }));
  };

  const toggleCountry = (countryId: string) => {
    setVisibleCountries(prev =>
      prev.includes(countryId) ? prev.filter(c => c !== countryId) : [...prev, countryId]
    );
  };

  const handleMediaUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,video/*";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const newFiles = Array.from(files).map(f => ({
          name: f.name,
          url: URL.createObjectURL(f),
        }));
        setMediaFiles(prev => [...prev, ...newFiles]);
      }
    };
    input.click();
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!sku.trim()) { toast.error("SKU é obrigatório"); return; }
    if (!category) { toast.error("Categoria é obrigatória"); return; }
    if (!multilingualData.pt.name.trim()) { toast.error("Nome em Português é obrigatório"); return; }
    toast.success("Produto criado com sucesso");
    onOpenChange(false);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-bold text-primary">Novo Produto</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pt-2 px-6 pb-6">

            {/* ── SKU + Category + Subcategory ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Input value={sku} onChange={e => setSku(e.target.value)} placeholder="EX: PRD-001" />
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={category} onValueChange={v => { setCategory(v); setSubcategory(""); }}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategoria</Label>
                <Select value={subcategory} onValueChange={setSubcategory} disabled={!category}>
                  <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent>
                    {selectedCategory?.subcategories.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ── Activatable (under SKU) ── */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Produto ativável</Label>
                <Switch checked={activatable} onCheckedChange={setActivatable} className="scale-75" />
                <span className="text-sm text-muted-foreground">{activatable ? "Sim" : "Não"}</span>
              </div>
              {activatable && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">Por quantos dias?</Label>
                  <Input
                    type="number"
                    className="w-20 h-8"
                    value={activationDays}
                    onChange={e => setActivationDays(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* ── Multilingual Fields (PT base + secondary lang side-by-side) ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label className="text-sm font-semibold">Conteúdo Multilíngue</Label>
                <ToggleGroup
                  type="single"
                  value={secondaryLang}
                  onValueChange={(v) => v && setSecondaryLang(v as "en" | "es")}
                  className="h-7"
                >
                  <ToggleGroupItem value="en" className="h-7 px-2 text-xs gap-1">
                    <span>🇺🇸</span> English
                  </ToggleGroupItem>
                  <ToggleGroupItem value="es" className="h-7 px-2 text-xs gap-1">
                    <span>🇪🇸</span> Español
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Always visible fields */}
              <div className="space-y-3">
                {ALWAYS_VISIBLE_FIELDS.map(f => {
                  const ptLabel = FIELD_LABELS.pt[f.key];
                  const secLabel = FIELD_LABELS[secondaryLang][f.key];
                  return (
                    <div key={f.key} className="space-y-1">
                      <div className="grid grid-cols-2 gap-3">
                        <Label className="text-xs text-muted-foreground">
                          {ptLabel} {f.key === "name" && "*"}
                        </Label>
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs text-muted-foreground">{secLabel}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] text-muted-foreground hover:text-primary gap-1 px-2"
                            onClick={() => translateField(secondaryLang, f.key)}
                          >
                            <Languages className="h-3 w-3" /> Traduzir do PT
                          </Button>
                        </div>
                      </div>
                      {f.type === "input" ? (
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            value={multilingualData.pt[f.key]}
                            onChange={e => updateML("pt", f.key, e.target.value)}
                            placeholder={ptLabel}
                          />
                          <Input
                            value={multilingualData[secondaryLang][f.key]}
                            onChange={e => updateML(secondaryLang, f.key, e.target.value)}
                            placeholder={secLabel}
                          />
                        </div>
                      ) : (
                        <SyncedTextareaPair
                          leftValue={multilingualData.pt[f.key]}
                          rightValue={multilingualData[secondaryLang][f.key]}
                          onLeftChange={(v) => updateML("pt", f.key, v)}
                          onRightChange={(v) => updateML(secondaryLang, f.key, v)}
                          leftPlaceholder={ptLabel}
                          rightPlaceholder={secLabel}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Collapsible fields — shared open state per field key */}
              <div className="space-y-1">
                {COLLAPSIBLE_FIELDS.map(f => {
                  const ptLabel = FIELD_LABELS.pt[f.key];
                  const secLabel = FIELD_LABELS[secondaryLang][f.key];
                  const isOpen = collapsibleOpen[f.key] ?? false;
                  return (
                    <Collapsible
                      key={f.key}
                      open={isOpen}
                      onOpenChange={() => toggleCollapsible(f.key)}
                    >
                      <CollapsibleTrigger className="flex items-center gap-2 w-full py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
                        {ptLabel}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 pt-1">
                        <div className="grid grid-cols-2 gap-3">
                          <div />
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] text-muted-foreground hover:text-primary gap-1 px-2"
                              onClick={() => translateField(secondaryLang, f.key)}
                            >
                              <Languages className="h-3 w-3" /> Traduzir do PT
                            </Button>
                          </div>
                        </div>
                        <SyncedTextareaPair
                          leftValue={multilingualData.pt[f.key]}
                          rightValue={multilingualData[secondaryLang][f.key]}
                          onLeftChange={(v) => updateML("pt", f.key, v)}
                          onRightChange={(v) => updateML(secondaryLang, f.key, v)}
                          leftPlaceholder={ptLabel}
                          rightPlaceholder={secLabel}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </div>

            {/* ── Points ── */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Pontuação</Label>
              <div className="max-w-xs space-y-1">
                <Label className="text-xs text-muted-foreground">Pontos por produto</Label>
                <Input type="number" value={points} onChange={e => setPoints(e.target.value)} placeholder="0" />
                <p className="text-[10px] text-muted-foreground">1 ponto = 1 ponto Unilevel = 1 ponto Binário</p>
              </div>
            </div>

            {/* ── Country Visibility ── */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Visibilidade por País</Label>
              <div className="flex flex-wrap gap-4">
                {COUNTRIES.map(c => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={visibleCountries.includes(c.id)}
                      onCheckedChange={() => toggleCountry(c.id)}
                    />
                    <span className="text-sm">{c.flag} {c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Prices ── */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Preços</Label>
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Preço</th>
                      {CURRENCIES.map(c => (
                        <th key={c.id} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          {c.label.split(" ")[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PRICE_TYPES.map((p, idx) => (
                      <tr key={p.id} className={cn(idx > 0 && "border-t border-border")}>
                        <td className="px-3 py-2 text-xs font-medium text-foreground whitespace-nowrap">{p.label}</td>
                        {CURRENCIES.map(c => (
                          <td key={c.id} className="px-2 py-1.5">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{c.symbol}</span>
                              <Input
                                type="number"
                                step="0.01"
                                className="pl-9 h-8 text-sm"
                                value={prices[c.id][p.id]}
                                onChange={e => updatePrice(c.id, p.id, e.target.value)}
                                placeholder="0,00"
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


            {/* ── Package Dimensions ── */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Dimensões da Embalagem</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Altura (cm)</Label>
                  <Input type="number" step="0.1" value={pkgHeight} onChange={e => setPkgHeight(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Largura (cm)</Label>
                  <Input type="number" step="0.1" value={pkgWidth} onChange={e => setPkgWidth(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Comprimento (cm)</Label>
                  <Input type="number" step="0.1" value={pkgLength} onChange={e => setPkgLength(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Diâmetro (cm)</Label>
                  <Input type="number" step="0.1" value={pkgDiameter} onChange={e => setPkgDiameter(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Peso (g)</Label>
                  <Input type="number" step="1" value={pkgWeight} onChange={e => setPkgWeight(e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>

            {/* ── Media Upload ── */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Mídias</Label>
              <div
                className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
                onClick={handleMediaUpload}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Clique para fazer upload de imagens ou vídeos</p>
                <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WebP, MP4 — máx. 20MB cada</p>
              </div>
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {mediaFiles.map((file, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-border">
                      <img src={file.url} alt={file.name} className="w-full h-20 object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); removeMedia(i); }}
                          className="p-1 bg-destructive rounded-full"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive-foreground" />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate px-1 py-0.5">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Actions ── */}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>

    <AlertDialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
          <AlertDialogDescription>
            Você fez alterações que ainda não foram salvas.
            <br />
            Deseja realmente sair? As alterações serão perdidas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continuar editando</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => { setConfirmCloseOpen(false); onOpenChange(false); }}
          >
            Sair sem salvar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}


/* ══════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════ */
export default function InternalProdutos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | "">("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | "">("");
  const [onlyActivatable, setOnlyActivatable] = useState(false);
  const [showInStock, setShowInStock] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"neutral" | "asc" | "desc">("neutral");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  const categoryObj = categories.find(c => c.id === selectedCategory);
  const subcategories = categoryObj?.subcategories ?? [];

  /* Filter */
  const filtered = useMemo(() => {
    const list = mockProducts.filter(p => {
      if (searchTerm) {
        const q = norm(searchTerm);
        const matchName = norm(p.name).includes(q);
        const matchId = norm(p.id).includes(q);
        if (!matchName && !matchId) return false;
      }
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedSubcategory && p.subcategory !== selectedSubcategory) return false;
      if (onlyActivatable && !p.activatable) return false;
      // Stock filter: at least one of the two pills must be on (UI guarantees that)
      if (p.inStock && !showInStock) return false;
      if (!p.inStock && !showOutOfStock) return false;
      return true;
    });

    if (sortDir === "neutral") return list;
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name, "pt-BR");
      else if (sortBy === "price") cmp = a.price - b.price;
      else if (sortBy === "sku") cmp = a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: "base" });
      else if (sortBy === "availability") cmp = (a.inStock === b.inStock) ? 0 : (a.inStock ? -1 : 1);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [searchTerm, selectedCategory, selectedSubcategory, onlyActivatable, showInStock, showOutOfStock, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* Stock counts (respect search/category filters but ignore the pills themselves) */
  const stockCounts = useMemo(() => {
    const base = mockProducts.filter(p => {
      if (searchTerm) {
        const q = norm(searchTerm);
        if (!norm(p.name).includes(q) && !norm(p.id).includes(q)) return false;
      }
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedSubcategory && p.subcategory !== selectedSubcategory) return false;
      if (onlyActivatable && !p.activatable) return false;
      return true;
    });
    return {
      inStock: base.filter(p => p.inStock).length,
      outOfStock: base.filter(p => !p.inStock).length,
    };
  }, [searchTerm, selectedCategory, selectedSubcategory, onlyActivatable]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setOnlyActivatable(false);
    setShowInStock(true);
    setShowOutOfStock(true);
    setPage(1);
  };

  const hasFilters = !!searchTerm || !!selectedCategory || !!selectedSubcategory || onlyActivatable;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Produtos</h1>
          <p className="text-sm text-muted-foreground">Gerencie o catálogo de produtos</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <fieldset className="relative rounded-[10px] border border-border bg-card p-4 shadow-sm">
        <legend className="flex items-center gap-2 px-1 text-base font-bold text-primary">
          <Search className="h-5 w-5 shrink-0" />
          <span className="shrink-0">Busca</span>
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-4">
          {/* Left column: search + toggle */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Buscar produto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                  placeholder="Digite o nome ou código..."
                  className="pl-9 pr-9 h-8"
                />
                {searchTerm && (
                  <button
                    onClick={() => { setSearchTerm(""); setPage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={onlyActivatable} onCheckedChange={v => { setOnlyActivatable(v); setPage(1); }} className="scale-75 origin-left" />
              <span className="text-xs text-muted-foreground">Apenas produtos ativáveis</span>
            </div>
          </div>

          {/* Right column: categories + subcategories */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Categorias</Label>
              <ToggleGroup
                type="single"
                value={selectedCategory}
                onValueChange={(v) => { setSelectedCategory(v || ""); setSelectedSubcategory(""); setPage(1); }}
                className="flex flex-wrap justify-start gap-1"
              >
                {categories.map(c => {
                  const hasProducts = onlyActivatable
                    ? mockProducts.some(p => p.category === c.id && p.activatable)
                    : true;
                  return (
                    <ToggleGroupItem
                      key={c.id}
                      value={c.id}
                      disabled={!hasProducts}
                      className="text-xs px-3 h-8 rounded-md border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {c.name}
                    </ToggleGroupItem>
                  );
                })}
              </ToggleGroup>
            </div>

            {selectedCategory && subcategories.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Subcategorias</Label>
                <ToggleGroup
                  type="single"
                  value={selectedSubcategory}
                  onValueChange={(v) => { setSelectedSubcategory(v || ""); setPage(1); }}
                  className="flex flex-wrap justify-start gap-1"
                >
                  {subcategories.map(s => {
                    const hasProducts = onlyActivatable
                      ? mockProducts.some(p => p.category === selectedCategory && p.subcategory === s && p.activatable)
                      : true;
                    return (
                      <ToggleGroupItem
                        key={s}
                        value={s}
                        disabled={!hasProducts}
                        className="text-xs px-3 py-1 h-7 rounded-md border data-[state=on]:bg-primary/80 data-[state=on]:text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {s}
                      </ToggleGroupItem>
                    );
                  })}
                </ToggleGroup>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row: clear filters */}
        {hasFilters && (
          <div className="flex items-center justify-end mt-3">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={clearFilters}>
              <X className="h-3 w-3" />
              Limpar filtros
            </Button>
          </div>
        )}
      </fieldset>

      {/* Results */}
      {filtered.length === 0 && hasFilters ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Utilize os filtros acima para buscar produtos</p>
        </div>
      ) : (
        <>
          {/* Results context header — same pattern as Cadastros */}
          <div className="space-y-1.5 px-1">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              {/* Title + count (wraps internally on very narrow screens) */}
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="font-semibold text-foreground text-lg whitespace-nowrap">{hasFilters ? "Resultado da Busca" : "Catálogo Completo"}</h2>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  ({filtered.length} {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"})
                </span>
              </div>

              {/* Right cluster: stock pills + sort. On mobile, takes full width with each item flex-1 */}
              <div className="flex flex-nowrap items-center justify-end gap-1 sm:gap-2 ml-auto min-w-0 w-full sm:w-auto">
                {/* Stock pills — mobile: only dot + count; sm+: full label */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button
                    onClick={() => { if (showInStock && !showOutOfStock) return; setShowInStock(v => !v); setPage(1); }}
                    title={showInStock ? `${stockCounts.inStock} em estoque` : "Mostrar em estoque"}
                    aria-label={showInStock ? `${stockCounts.inStock} em estoque` : "Mostrar em estoque"}
                    className={cn(
                      "inline-flex items-center justify-center gap-1 rounded-full px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-medium transition-all border whitespace-nowrap",
                      showInStock
                        ? "bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm"
                        : "bg-transparent text-emerald-600/70 border-transparent hover:bg-emerald-50 hover:border-emerald-200"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", showInStock ? "bg-emerald-500" : "bg-emerald-400/50")} />
                    {showInStock ? `${stockCounts.inStock}` : ""}
                    <span className="hidden sm:inline">{showInStock ? " em estoque" : "em estoque"}</span>
                  </button>
                  <button
                    onClick={() => { if (showOutOfStock && !showInStock) return; setShowOutOfStock(v => !v); setPage(1); }}
                    title={showOutOfStock ? `${stockCounts.outOfStock} sem estoque` : "Mostrar sem estoque"}
                    aria-label={showOutOfStock ? `${stockCounts.outOfStock} sem estoque` : "Mostrar sem estoque"}
                    className={cn(
                      "inline-flex items-center justify-center gap-1 rounded-full px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-medium transition-all border whitespace-nowrap",
                      showOutOfStock
                        ? "bg-red-100 text-red-700 border-red-300 shadow-sm"
                        : "bg-transparent text-red-500/70 border-transparent hover:bg-red-50 hover:border-red-200"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", showOutOfStock ? "bg-red-500" : "bg-red-400/50")} />
                    {showOutOfStock ? `${stockCounts.outOfStock}` : ""}
                    <span className="hidden sm:inline">{showOutOfStock ? " sem estoque" : "sem estoque"}</span>
                  </button>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-0.5 flex-1 sm:flex-initial sm:shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-dashed rounded-r-none shrink-0"
                    onClick={() => setSortDir(d => d === "neutral" ? "asc" : d === "asc" ? "desc" : "asc")}
                    title={sortDir === "neutral" ? "Ordenação padrão" : sortDir === "asc" ? "Ascendente" : "Descendente"}
                  >
                    {sortDir === "neutral"
                      ? <ArrowUpDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      : sortDir === "asc"
                        ? <ArrowUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        : <ArrowDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    }
                  </Button>
                  <Select
                    value={sortBy}
                    onValueChange={v => {
                      setSortBy(v);
                      if (sortDir === "neutral") setSortDir("asc");
                    }}
                  >
                    <SelectTrigger className="h-7 sm:h-8 text-[11px] sm:text-xs w-full sm:w-auto sm:min-w-[130px] px-2 border-dashed rounded-l-none">
                      {sortDir === "neutral"
                        ? <span className="text-muted-foreground">Classificar</span>
                        : <SelectValue placeholder="Classificar" />
                      }
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nome</SelectItem>
                      <SelectItem value="price">Valor</SelectItem>
                      <SelectItem value="sku">SKU</SelectItem>
                      <SelectItem value="availability">Disponibilidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View mode toggle (Cards / List) */}
                <div className="flex rounded-md border border-input overflow-hidden h-7 sm:h-8 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    className={cn(
                      "px-2 transition-colors",
                      viewMode === "cards"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-accent"
                    )}
                    title="Visualização em cards"
                    aria-label="Visualização em cards"
                  >
                    <LayoutGrid className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "px-2 transition-colors",
                      viewMode === "list"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-accent"
                    )}
                    title="Visualização em lista"
                    aria-label="Visualização em lista"
                  >
                    <List className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map(p => (
                <ProductCardUnified key={p.id} product={p} mode="staff" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              {/* ── Mobile (< sm): stacked rows, no horizontal scroll ── */}
              <div className="sm:hidden divide-y divide-border">
                {paginated.map((p) => {
                  const stock = getStockInfo(p);
                  const statusColor = !p.inStock
                    ? "bg-red-500"
                    : stock.lowStock
                    ? "bg-amber-500"
                    : "bg-emerald-500";
                  const statusLabel = !p.inStock
                    ? "Sem estoque"
                    : stock.lowStock
                    ? "Estoque baixo"
                    : "Em estoque";
                  const price = splitCurrency(p.price);
                  return (
                    <div
                      key={p.id}
                      className="group relative px-3 py-2.5 hover:bg-primary/10 transition-colors"
                    >
                      {/* Line 1: status dot + code + name */}
                      <div className="flex items-center gap-2 pr-9">
                        <span
                          className={cn("h-2 w-2 rounded-full shrink-0", statusColor)}
                          title={statusLabel}
                          aria-label={statusLabel}
                        />
                        <span className="font-mono text-xs text-muted-foreground shrink-0">
                          {p.id.toUpperCase()}
                        </span>
                        <span className="font-medium text-foreground text-sm truncate">
                          {p.name}
                        </span>
                      </div>
                      {/* Line 2: pontos + valor */}
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          <span className="opacity-70">Pontos:</span>{" "}
                          <span className="tabular-nums text-foreground">{p.pointsUnilevel ?? "—"}</span>
                        </span>
                        <span>
                          <span className="opacity-70">Valor:</span>{" "}
                          <span className="tabular-nums text-foreground">{price.symbol} {price.amount}</span>
                        </span>
                      </div>
                      {/* Line 3: estoque + mínimo + máximo */}
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          <span className="opacity-70">Estoque:</span>{" "}
                          <span className={cn(
                            "tabular-nums font-medium",
                            !p.inStock && "text-red-600",
                            stock.lowStock && "text-amber-600",
                            p.inStock && !stock.lowStock && "text-foreground",
                          )}>{stock.qty}</span>
                        </span>
                        <span>
                          <span className="opacity-70">Mín:</span>{" "}
                          <span className="tabular-nums text-foreground">{stock.min}</span>
                        </span>
                        <span>
                          <span className="opacity-70">Máx:</span>{" "}
                          <span className="tabular-nums text-foreground">{stock.max}</span>
                        </span>
                      </div>
                      {/* Edit (icon-only) */}
                      <button
                        type="button"
                        onClick={() => toast.info(`Editar ${p.name}`)}
                        title={`Editar ${p.name}`}
                        aria-label={`Editar ${p.name}`}
                        className="absolute top-2 right-2 inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-accent transition-opacity"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* ── sm and above: table layout, no horizontal scroll ── */}
              <div className="hidden sm:block">
                <table className="w-full text-sm table-fixed">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr className="text-left">
                      <th className="px-1.5 lg:px-3 py-2 font-medium whitespace-nowrap text-xs lg:text-sm w-[78px] lg:w-[92px]">Código</th>
                      <th className="px-1.5 lg:px-3 py-2 font-medium text-xs lg:text-sm">Produto</th>
                      <th className="px-1 lg:px-3 py-2 font-medium text-center whitespace-nowrap text-xs lg:text-sm w-[56px] lg:w-[70px] hidden lg:table-cell">Pontos</th>
                      <th className="pl-1 lg:pl-3 pr-8 lg:pr-12 py-2 font-medium text-right whitespace-nowrap text-xs lg:text-sm w-[110px] lg:w-[140px] hidden lg:table-cell" colSpan={2}>Valor</th>
                      <th className="px-1 lg:px-3 py-2 font-medium text-center whitespace-nowrap text-xs lg:text-sm w-[64px] lg:w-[80px]">Estoque</th>
                      <th className="px-1 lg:px-3 py-2 font-medium text-center whitespace-nowrap text-xs lg:text-sm w-[56px] lg:w-[70px]">Mínimo</th>
                      <th className="px-1 lg:px-3 py-2 font-medium text-center whitespace-nowrap text-xs lg:text-sm w-[56px] lg:w-[70px]">Máximo</th>
                      <th className="px-1 lg:px-3 py-2 font-medium text-center whitespace-nowrap text-xs lg:text-sm w-[64px] lg:w-[90px]">Vendas 30d</th>
                      <th className="px-1 lg:px-2 py-2 font-medium whitespace-nowrap w-[36px] lg:w-[90px]" aria-label="Ações" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((p) => {
                      const stock = getStockInfo(p);
                      const statusColor = !p.inStock
                        ? "bg-red-500"
                        : stock.lowStock
                        ? "bg-amber-500"
                        : "bg-emerald-500";
                      const statusLabel = !p.inStock
                        ? "Sem estoque"
                        : stock.lowStock
                        ? "Estoque baixo"
                        : "Em estoque";
                      const price = splitCurrency(p.price);
                      return (
                        <tr key={p.id} className="group border-t border-border hover:bg-primary/10 transition-colors">
                          <td className="px-1.5 lg:px-3 py-2 font-mono text-[11px] lg:text-xs text-muted-foreground whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 lg:gap-2">
                              <span
                                className={cn("h-2 w-2 rounded-full shrink-0", statusColor)}
                                title={statusLabel}
                                aria-label={statusLabel}
                              />
                              {p.id.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-1.5 lg:px-3 py-2 min-w-0">
                            <div
                              className="font-medium text-foreground truncate text-xs lg:text-sm"
                              title={p.name}
                            >
                              {p.name}
                            </div>
                          </td>
                          <td className="px-1 lg:px-3 py-2 text-center tabular-nums text-muted-foreground text-xs lg:text-sm hidden lg:table-cell">
                            {p.pointsUnilevel ?? "—"}
                          </td>
                          <td className="pl-1 lg:pl-3 pr-0.5 lg:pr-1 py-2 text-right whitespace-nowrap text-xs lg:text-sm hidden lg:table-cell">{price.symbol}</td>
                          <td className="pl-0.5 lg:pl-1 pr-4 lg:pr-6 py-2 text-right tabular-nums whitespace-nowrap text-xs lg:text-sm hidden lg:table-cell">{price.amount}</td>
                          <td className={cn(
                            "px-1 lg:px-3 py-2 text-center font-medium tabular-nums whitespace-nowrap text-xs lg:text-sm",
                            !p.inStock && "text-red-600",
                            stock.lowStock && "text-amber-600",
                          )}>
                            {stock.qty}
                          </td>
                          <td className="px-1 lg:px-3 py-2 text-center tabular-nums text-muted-foreground text-xs lg:text-sm">{stock.min}</td>
                          <td className="px-1 lg:px-3 py-2 text-center tabular-nums text-muted-foreground text-xs lg:text-sm">{stock.max}</td>
                          <td className="px-1 lg:px-3 py-2 text-center tabular-nums text-muted-foreground text-xs lg:text-sm">{stock.sales30d}</td>
                          <td className="px-1 lg:px-2 py-1 text-right whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-1.5 lg:px-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                              onClick={() => toast.info(`Editar ${p.name}`)}
                              title={`Editar ${p.name}`}
                              aria-label={`Editar ${p.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5 lg:mr-1" />
                              <span className="hidden lg:inline">Editar</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination + page size */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {filtered.length > 20 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Itens por página</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
                >
                  <SelectTrigger className="h-8 w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

        </>
      )}

      <NewProductDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}


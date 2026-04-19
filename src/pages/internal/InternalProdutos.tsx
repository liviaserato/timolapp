import { useState, useMemo } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Search, X, Plus, Package, ChevronLeft, ChevronRight,
  Upload, Trash2, Eye, Pencil, Copy,
  ChevronDown, Languages, ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react";
import { categories, products as mockProducts, type Product, type Category } from "@/data/mock-products";
import { toast } from "sonner";
import { ProductCardUnified } from "@/components/app/pedidos/store/ProductCardUnified";

/* ── Constants ── */
const ITEMS_PER_PAGE = 12;

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

const ALWAYS_VISIBLE_FIELDS = [
  { key: "name", label: "Nome do produto", type: "input" as const },
  { key: "description", label: "Descrição", type: "textarea" as const },
];

const COLLAPSIBLE_FIELDS = [
  { key: "benefits", label: "Benefícios", type: "textarea" as const },
  { key: "instructions", label: "Instruções de uso", type: "textarea" as const },
  { key: "warranty", label: "Garantia", type: "textarea" as const },
  { key: "composition", label: "Composição", type: "textarea" as const },
  { key: "manufacturer", label: "Fabricante", type: "textarea" as const },
];

const ALL_ML_FIELDS = [...ALWAYS_VISIBLE_FIELDS, ...COLLAPSIBLE_FIELDS];

/* ── Helpers ── */
function norm(s: string) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
  const [langTab, setLangTab] = useState("pt");
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
  const [priceCurrencyTab, setPriceCurrencyTab] = useState("BRL");

  const [activatable, setActivatable] = useState(false);
  const [activationDays, setActivationDays] = useState("30");

  const [pkgHeight, setPkgHeight] = useState("");
  const [pkgWidth, setPkgWidth] = useState("");
  const [pkgLength, setPkgLength] = useState("");
  const [pkgDiameter, setPkgDiameter] = useState("");
  const [pkgWeight, setPkgWeight] = useState("");

  const [mediaFiles, setMediaFiles] = useState<{ name: string; url: string }[]>([]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
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

            {/* ── Multilingual Fields ── */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Conteúdo Multilíngue</Label>
              <Tabs value={langTab} onValueChange={setLangTab}>
                <TabsList className="h-8">
                  {LANGUAGES.map(l => (
                    <TabsTrigger key={l.id} value={l.id} className="text-xs gap-1">
                      <span>{l.flag}</span> {l.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {LANGUAGES.map(l => (
                  <TabsContent key={l.id} value={l.id} className="space-y-3 mt-3">
                    {/* Always visible: name + description */}
                    {ALWAYS_VISIBLE_FIELDS.map(f => (
                      <div key={f.key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">
                            {f.label} {f.key === "name" && l.id === "pt" && "*"}
                          </Label>
                          {l.id !== "pt" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] text-muted-foreground hover:text-primary gap-1 px-2"
                              onClick={() => translateField(l.id, f.key)}
                            >
                              <Languages className="h-3 w-3" /> Traduzir do PT
                            </Button>
                          )}
                        </div>
                        {f.type === "input" ? (
                          <Input
                            value={multilingualData[l.id][f.key]}
                            onChange={e => updateML(l.id, f.key, e.target.value)}
                            placeholder={f.label}
                          />
                        ) : (
                          <Textarea
                            value={multilingualData[l.id][f.key]}
                            onChange={e => updateML(l.id, f.key, e.target.value)}
                            placeholder={f.label}
                            rows={3}
                          />
                        )}
                      </div>
                    ))}

                    {/* Collapsible fields */}
                    {COLLAPSIBLE_FIELDS.map(f => (
                      <Collapsible
                        key={f.key}
                        open={collapsibleOpen[`${l.id}-${f.key}`] ?? false}
                        onOpenChange={() => toggleCollapsible(`${l.id}-${f.key}`)}
                      >
                        <CollapsibleTrigger className="flex items-center gap-2 w-full py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", collapsibleOpen[`${l.id}-${f.key}`] && "rotate-180")} />
                          {f.label}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 pt-1">
                          {l.id !== "pt" && (
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] text-muted-foreground hover:text-primary gap-1 px-2"
                                onClick={() => translateField(l.id, f.key)}
                              >
                                <Languages className="h-3 w-3" /> Traduzir do PT
                              </Button>
                            </div>
                          )}
                          <Textarea
                            value={multilingualData[l.id][f.key]}
                            onChange={e => updateML(l.id, f.key, e.target.value)}
                            placeholder={f.label}
                            rows={3}
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
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
              <Tabs value={priceCurrencyTab} onValueChange={setPriceCurrencyTab}>
                <TabsList className="h-8">
                  {CURRENCIES.map(c => (
                    <TabsTrigger key={c.id} value={c.id} className="text-xs">{c.label}</TabsTrigger>
                  ))}
                </TabsList>
                {CURRENCIES.map(c => (
                  <TabsContent key={c.id} value={c.id} className="mt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {PRICE_TYPES.map(p => (
                        <div key={p.id} className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{p.label}</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{c.symbol}</span>
                            <Input
                              type="number"
                              step="0.01"
                              className="pl-10"
                              value={prices[c.id][p.id]}
                              onChange={e => updatePrice(c.id, p.id, e.target.value)}
                              placeholder="0,00"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* ── Activatable ── */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Produto Ativável</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={activatable} onCheckedChange={setActivatable} />
                  <span className="text-sm text-muted-foreground">{activatable ? "Sim" : "Não"}</span>
                </div>
                {activatable && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Por quantos dias?</Label>
                    <Input
                      type="number"
                      className="w-20"
                      value={activationDays}
                      onChange={e => setActivationDays(e.target.value)}
                    />
                  </div>
                )}
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
              <Button onClick={handleSave}>Salvar Produto</Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
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
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"neutral" | "asc" | "desc">("neutral");

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
      if (onlyInStock && !p.inStock) return false;
      return true;
    });

    if (sortDir === "neutral") return list;
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name, "pt-BR");
      else if (sortBy === "price") cmp = a.price - b.price;
      else if (sortBy === "sku") cmp = a.id.localeCompare(b.id);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [searchTerm, selectedCategory, selectedSubcategory, onlyActivatable, onlyInStock, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setOnlyActivatable(false);
    setOnlyInStock(false);
    setPage(1);
  };

  const hasFilters = !!searchTerm || !!selectedCategory || !!selectedSubcategory || onlyActivatable || onlyInStock;

  /** Build dynamic filter description (excluding "apenas ativáveis") */
  const filterDescription = useMemo(() => {
    const parts: string[] = [];
    if (searchTerm.trim()) parts.push(`Busca: "${searchTerm.trim()}"`);
    if (selectedCategory) {
      const cat = categories.find(c => c.id === selectedCategory);
      if (cat) parts.push(`Categoria: ${cat.name}`);
    }
    if (selectedSubcategory) parts.push(`Subcategoria: ${selectedSubcategory}`);
    if (onlyInStock) parts.push("Apenas em estoque");
    return parts;
  }, [searchTerm, selectedCategory, selectedSubcategory, onlyInStock]);

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
                  className="pl-9 pr-9"
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
              <Switch checked={onlyActivatable} onCheckedChange={v => { setOnlyActivatable(v); setPage(1); }} />
              <span className="text-xs text-muted-foreground">Apenas produtos ativáveis</span>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={onlyInStock} onCheckedChange={v => { setOnlyInStock(v); setPage(1); }} />
              <span className="text-xs text-muted-foreground">Apenas produtos em estoque</span>
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
                      className="text-xs px-3 py-1 h-8 rounded-md border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
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
          <div className="flex items-center justify-end mt-3 pt-3 border-t border-border">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground text-lg">Resultado da Busca</h2>
                <span className="text-xs text-muted-foreground">
                  ({filtered.length} {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"})
                </span>
              </div>
              {/* Sort */}
              <div className="flex items-center gap-0.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-dashed rounded-r-none"
                  onClick={() => setSortDir(d => d === "neutral" ? "asc" : d === "asc" ? "desc" : "asc")}
                  title={sortDir === "neutral" ? "Ordenação padrão" : sortDir === "asc" ? "Ascendente" : "Descendente"}
                >
                  {sortDir === "neutral"
                    ? <ArrowUpDown className="h-3.5 w-3.5" />
                    : sortDir === "asc"
                      ? <ArrowUp className="h-3.5 w-3.5" />
                      : <ArrowDown className="h-3.5 w-3.5" />
                  }
                </Button>
                <Select value={sortBy} onValueChange={v => setSortBy(v)}>
                  <SelectTrigger className="h-8 text-xs w-auto min-w-[130px] border-dashed rounded-l-none">
                    <span>Classificar</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="price">Valor</SelectItem>
                    <SelectItem value="sku">SKU</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {filterDescription.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {filterDescription.join("  ·  ")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map(p => (
              <ProductCardUnified key={p.id} product={p} mode="staff" />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
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
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <NewProductDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}


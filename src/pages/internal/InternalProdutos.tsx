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
import {
  Search, X, Plus, Package, ChevronLeft, ChevronRight,
  Image as ImageIcon, Upload, Trash2, Eye, Pencil, Copy,
} from "lucide-react";
import { categories, products as mockProducts, type Product, type Category } from "@/data/mock-products";
import { toast } from "sonner";

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

const MULTILINGUAL_FIELDS = [
  { key: "name", label: "Nome do produto", type: "input" as const },
  { key: "description", label: "Descrição", type: "textarea" as const },
  { key: "benefits", label: "Benefícios", type: "textarea" as const },
  { key: "instructions", label: "Instruções de uso", type: "textarea" as const },
  { key: "warranty", label: "Garantia", type: "textarea" as const },
  { key: "composition", label: "Composição", type: "textarea" as const },
  { key: "manufacturer", label: "Fabricante", type: "textarea" as const },
];

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
      MULTILINGUAL_FIELDS.forEach(f => { init[l.id][f.key] = ""; });
    });
    return init;
  });

  const [pointsUnilevel, setPointsUnilevel] = useState("");
  const [pointsBinary, setPointsBinary] = useState("");
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

  const [mediaFiles, setMediaFiles] = useState<{ name: string; url: string }[]>([]);

  const selectedCategory = categories.find(c => c.id === category);

  const updateML = (lang: string, field: string, value: string) => {
    setMultilingualData(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
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
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-bold text-primary">Novo Produto</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
          <div className="space-y-6 pt-2">

            {/* ── SKU + Category + Subcategory ── */}
            <div className="grid grid-cols-3 gap-4">
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
                    {MULTILINGUAL_FIELDS.map(f => (
                      <div key={f.key} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {f.label} {f.key === "name" && l.id === "pt" && "*"}
                        </Label>
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
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* ── Points ── */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Pontuação</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Pontos Unilevel</Label>
                  <Input type="number" value={pointsUnilevel} onChange={e => setPointsUnilevel(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Pontos Binário</Label>
                  <Input type="number" value={pointsBinary} onChange={e => setPointsBinary(e.target.value)} placeholder="0" />
                </div>
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
                    <div className="grid grid-cols-3 gap-4">
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
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const categoryObj = categories.find(c => c.id === selectedCategory);
  const subcategories = categoryObj?.subcategories ?? [];

  /* Filter */
  const filtered = useMemo(() => {
    return mockProducts.filter(p => {
      if (searchTerm) {
        const q = norm(searchTerm);
        const matchName = norm(p.name).includes(q);
        const matchId = norm(p.id).includes(q);
        if (!matchName && !matchId) return false;
      }
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedSubcategory && p.subcategory !== selectedSubcategory) return false;
      return true;
    });
  }, [searchTerm, selectedCategory, selectedSubcategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setPage(1);
  };

  const hasFilters = !!searchTerm || !!selectedCategory || !!selectedSubcategory;

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
      <div className="rounded-[10px] border border-border bg-card p-4 shadow-sm">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Buscar por nome ou código..."
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

          {/* Categories */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Categorias</Label>
            <ToggleGroup
              type="single"
              value={selectedCategory}
              onValueChange={(v) => { setSelectedCategory(v || ""); setSelectedSubcategory(""); setPage(1); }}
              className="flex flex-wrap justify-start gap-1"
            >
              {categories.map(c => (
                <ToggleGroupItem
                  key={c.id}
                  value={c.id}
                  className="text-xs px-3 py-1 h-8 rounded-full border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {c.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Subcategories */}
          {selectedCategory && subcategories.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Subcategorias</Label>
              <ToggleGroup
                type="single"
                value={selectedSubcategory}
                onValueChange={(v) => { setSelectedSubcategory(v || ""); setPage(1); }}
                className="flex flex-wrap justify-start gap-1"
              >
                {subcategories.map(s => (
                  <ToggleGroupItem
                    key={s}
                    value={s}
                    className="text-xs px-3 py-1 h-7 rounded-full border data-[state=on]:bg-primary/80 data-[state=on]:text-primary-foreground"
                  >
                    {s}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}

          {hasFilters && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">{filtered.length} produto(s) encontrado(s)</span>
              <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </DashboardCard>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map(p => (
              <ProductListCard key={p.id} product={p} />
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


/* ── Product Card ── */
function ProductListCard({ product: p }: { product: Product }) {
  return (
    <DashboardCard className="p-0 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image placeholder */}
      <div className="h-32 bg-muted/30 flex items-center justify-center">
        {p.image ? (
          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-10 w-10 text-muted-foreground/20" />
        )}
      </div>

      <div className="p-3 space-y-2">
        {/* Category badge */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            {categories.find(c => c.id === p.category)?.name ?? p.category}
          </span>
          <span className="text-[10px] text-muted-foreground">{p.subcategory}</span>
        </div>

        {/* Name */}
        <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{p.name}</p>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-primary">{formatCurrency(p.price)}</span>
          {p.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">{formatCurrency(p.oldPrice)}</span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
          <span>SKU: {p.id}</span>
          <div className="flex items-center gap-2">
            {p.pointsUnilevel != null && <span>U: {p.pointsUnilevel}</span>}
            {p.pointsBinary != null && <span>B: {p.pointsBinary}</span>}
          </div>
          <div className="flex items-center gap-1">
            {p.activatable && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Ativável</span>}
            <span className={cn(
              "text-[9px] px-1.5 py-0.5 rounded",
              p.inStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            )}>
              {p.inStock ? "Em estoque" : "Indisponível"}
            </span>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

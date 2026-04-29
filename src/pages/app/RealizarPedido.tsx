import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

import { useIsMobile } from "@/hooks/use-mobile";

import { categories, products } from "@/data/mock-products";
import { useCart } from "@/hooks/useCart";
import { ProductCardUnified } from "@/components/app/pedidos/store/ProductCardUnified";
import { ProductCardHorizontal } from "@/components/app/pedidos/store/ProductCardHorizontal";
import { CartDrawer } from "@/components/app/pedidos/store/CartDrawer";

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const mockBanners = [
  { id: 1, title: "🔥 Combo Mega com 30% OFF", subtitle: "Válido até 31/03", bg: "from-primary/90 to-primary/60" },
  { id: 2, title: "🚀 Lançamento Linha Premium", subtitle: "Novos produtos disponíveis", bg: "from-emerald-600/80 to-emerald-500/60" },
  { id: 3, title: "🎁 Compre 3, Leve 4", subtitle: "Promoção exclusiva para franqueados", bg: "from-amber-600/80 to-amber-500/60" },
];

export default function RealizarPedido() {
  const navigate = useNavigate();
  const cart = useCart();
  const isMobile = useIsMobile();

  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const layout = isMobile ? "list" : "grid";

  const activeCategory = categories.find((c) => c.id === selectedCategory);
  const subcategories = activeCategory?.subcategories ?? [];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "todos" && p.category !== selectedCategory) return false;
      if (selectedSubcategory !== "todos" && p.subcategory !== selectedSubcategory) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.subcategory.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [selectedCategory, selectedSubcategory, searchTerm]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory("todos");
    setSearchTerm("");
  };

  const handleAddToCart = (productId: string, name: string, price: number, qty: number, selections: Record<string, string>) => {
    cart.addItem(productId, name, price, qty, selections);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/app/pedidos")} className="text-primary hover:text-primary/80 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Realizar Pedido</h1>
            <p className="text-sm text-muted-foreground">Escolha seus produtos e adicione ao carrinho</p>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                searchRef.current?.select();
              }
            }}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(""); searchRef.current?.focus(); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="mb-2">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleCategoryChange("todos")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors",
              selectedCategory === "todos"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory chips */}
      {selectedCategory !== "todos" && subcategories.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedSubcategory("todos")}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap border transition-colors",
                selectedSubcategory === "todos"
                  ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                  : "text-muted-foreground border-border hover:border-primary/30"
              )}
            >
              Todos
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={cn(
                  "px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap border transition-colors",
                  selectedSubcategory === sub
                    ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                    : "text-muted-foreground border-border hover:border-primary/30"
                )}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Products grid */}
      <div className="flex-1 overflow-y-auto pb-20">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <Search className="h-10 w-10 opacity-30" />
            <p className="text-sm">Nenhum produto encontrado</p>
          </div>
        ) : (
          layout === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((product) => (
                <ProductCardUnified
                  key={product.id}
                  product={product}
                  mode="franchisee"
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((product) => (
                <ProductCardHorizontal
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Floating cart button */}
      <button
        onClick={() => setCartOpen(true)}
        className={cn(
          "fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 rounded-full px-5 py-3 shadow-lg transition-all",
          "bg-[hsl(var(--app-sidebar))] text-primary-foreground hover:opacity-95",
          cart.totalItems > 0 && "animate-in fade-in slide-in-from-bottom-2"
        )}
      >
        <ShoppingCart className="h-5 w-5" />
        {cart.totalItems > 0 && (
          <>
            <span className="text-sm font-bold">{cart.totalItems}</span>
            <span className="text-xs opacity-80">·</span>
            <span className="text-sm font-semibold">{formatCurrency(cart.totalPrice)}</span>
          </>
        )}
      </button>

      {/* Cart drawer */}
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cart.items}
        totalPrice={cart.totalPrice}
        totalItems={cart.totalItems}
        onUpdateQty={cart.updateQty}
        onRemoveItem={cart.removeItem}
        onClearCart={cart.clearCart}
      />
    </div>
  );
}

import { useState, useRef } from "react";
import { Plus, Minus, ShoppingCart, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/mock-products";
import type { CartItemSelection } from "@/hooks/useCart";
import { ProductDetailDialog } from "./ProductDetailDialog";

import comboMegaImg from "@/assets/produto-combo-mega.png";
import comboMiniImg from "@/assets/produto-combo-mini.png";
import produtosSeparadosImg from "@/assets/produtos-separados.png";
import loaderImg from "@/assets/produtos-loader-transparent.png";

const productImages: Record<string, string> = {
  "Combo Mega": comboMegaImg,
  "Combo Mini": comboMiniImg,
  "Produtos Separados": produtosSeparadosImg,
  "Loader Transparente": loaderImg,
};

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface ProductCardHorizontalProps {
  product: Product;
  onAddToCart: (productId: string, name: string, price: number, qty: number, selections: CartItemSelection) => void;
}

export function ProductCardHorizontal({ product, onAddToCart }: ProductCardHorizontalProps) {
  const [qty, setQty] = useState(1);
  const [selections, setSelections] = useState<CartItemSelection>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [justAdded, setJustAdded] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const addTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const img = productImages[product.name];

  const handleAdd = () => {
    if (product.variations && product.variations.length > 0) {
      const missing = product.variations
        .filter((v) => !selections[v.type])
        .map((v) => v.label);
      if (missing.length > 0) {
        setErrors(missing);
        return;
      }
    }
    setErrors([]);
    onAddToCart(product.id, product.name, product.price, qty, { ...selections });
    setQty(1);
    setSelections({});
    setJustAdded(true);
    clearTimeout(addTimerRef.current);
    addTimerRef.current = setTimeout(() => setJustAdded(false), 1500);
  };

  const handleSelectVariation = (type: string, opt: string) => {
    setSelections((s) => ({ ...s, [type]: opt }));
    setErrors((prev) => {
      const variation = product.variations?.find((v) => v.type === type);
      if (variation) return prev.filter((e) => e !== variation.label);
      return prev;
    });
  };

  const hasVariations = product.variations && product.variations.length > 0;

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-md",
        !product.inStock && "opacity-60"
      )}
    >
      {/* Row 1: Image (col1) + Info (col2) – clickable */}
      <div className="flex flex-1 cursor-pointer" onClick={() => setDetailOpen(true)}>
        {/* Col 1 – Image */}
        <div className="relative shrink-0 w-28 sm:w-36 bg-muted/30 flex items-center justify-center p-2">
          {img ? (
            <img src={img} alt={product.name} className="h-24 w-24 sm:h-28 sm:w-28 object-contain" />
          ) : (
            <div className="h-24 w-24 rounded-lg bg-muted/50 flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}
          {product.oldPrice && (
            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
              {Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
            </span>
          )}
          {!product.inStock && (
            <span className="absolute top-2 left-2 bg-muted-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded">
              Indisponível
            </span>
          )}
        </div>

        {/* Col 2 – Product info */}
        <div className="flex flex-col flex-1 min-w-0 p-3 gap-1">
          <div className="flex items-center justify-between gap-1.5">
            <p className="text-xs text-muted-foreground truncate">{product.subcategory}</p>
            {product.activatable && (
              <span className="shrink-0 rounded-full bg-primary/10 border border-primary/30 text-primary text-[9px] font-bold px-1.5 py-0.5 leading-none">
                Ativável
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-foreground leading-tight">{product.name}</h3>
          <p className="text-[11px] text-muted-foreground line-clamp-2 min-h-[2lh]">
            {product.description || "\u00A0"}
          </p>
          <div className="flex items-baseline gap-1.5">
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatCurrency(product.oldPrice)}</span>
            )}
            <span className="text-base font-bold text-primary">{formatCurrency(product.price)}</span>
          </div>
          {(product.pointsUnilevel || product.pointsBinary) && (
            <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-2 py-1">
              <Star className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium text-foreground leading-relaxed">
                {product.pointsUnilevel && <span>{product.pointsUnilevel} pts Unilevel</span>}
                {product.pointsUnilevel && product.pointsBinary && <span> · </span>}
                {product.pointsBinary && <span>{product.pointsBinary} pts Binário</span>}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Variations (only if they exist) */}
      {hasVariations && (
        <div className="px-3 pb-2 pt-1.5 border-t border-border/50">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {product.variations!.map((variation) => {
              const hasError = errors.includes(variation.label);
              return (
                <div key={variation.type} className="min-w-0">
                  <p
                    className={cn(
                      "text-[11px] font-medium mb-0.5",
                      hasError ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {variation.label}
                    {hasError && <span className="ml-1 font-normal">— selecione</span>}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {variation.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSelectVariation(variation.type, opt)}
                        className={cn(
                          "px-2 py-0.5 text-[11px] rounded border transition-colors",
                          selections[variation.type] === opt
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : hasError
                              ? "border-destructive/50 text-muted-foreground hover:border-destructive"
                              : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Row 3: Qty (col1 width) + Add button (col2 width) – always at bottom */}
      <div className="mt-auto flex">
        {/* Qty – same width as image column */}
        <div className="shrink-0 w-28 sm:w-36 flex items-center justify-center px-2 pb-3 pt-1.5">
          <div
            className={cn(
              "flex items-center border border-border rounded w-full justify-center",
              !product.inStock && "opacity-40 pointer-events-none"
            )}
          >
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={!product.inStock}
              className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-xs font-semibold text-foreground">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              disabled={!product.inStock}
              className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Add button – same width as info column */}
        <div className="flex-1 min-w-0 flex items-center px-3 pb-3 pt-1.5">
          <Button
            size="sm"
            className={cn(
              "w-full gap-1 text-[11px] h-7 transition-colors",
              justAdded && "bg-green-600 hover:bg-green-600 text-white"
            )}
            disabled={!product.inStock || justAdded}
            onClick={handleAdd}
          >
            {justAdded ? (
              <>
                <Check className="h-3 w-3 shrink-0" />
                <span className="truncate">Adicionado</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-3 w-3 shrink-0" />
                <span className="truncate">Adicionar</span>
              </>
            )}
          </Button>
        </div>
      </div>
      <ProductDetailDialog product={product} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}

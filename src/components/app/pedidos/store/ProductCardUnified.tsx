import { useState, useRef } from "react";
import { Plus, Minus, ShoppingCart, Check, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { categories, type Product } from "@/data/mock-products";
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

export type ProductCardMode = "franchisee" | "staff";

interface ProductCardUnifiedProps {
  product: Product;
  mode?: ProductCardMode;
  /** Required for franchisee mode */
  onAddToCart?: (
    productId: string,
    name: string,
    price: number,
    qty: number,
    selections: CartItemSelection
  ) => void;
}

export function ProductCardUnified({
  product,
  mode = "franchisee",
  onAddToCart,
}: ProductCardUnifiedProps) {
  const [qty, setQty] = useState(1);
  const [selections, setSelections] = useState<CartItemSelection>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [justAdded, setJustAdded] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const addTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const img = productImages[product.name] ?? product.image;
  const categoryName =
    categories.find((c) => c.id === product.category)?.name ?? product.category;

  const handleAdd = () => {
    if (!onAddToCart) return;
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

  const totalPoints = product.pointsUnilevel ?? product.pointsBinary;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border border-border bg-card overflow-visible transition-shadow hover:shadow-md",
        !product.inStock && mode === "franchisee" && "opacity-60"
      )}
    >
      {/* Activatable ribbon (staff style) — overflows on the right */}
      {product.activatable && (
        <div className="absolute top-[13px] -right-[6px] z-10 flex flex-col items-end pointer-events-none">
          <span
            className="text-[9px] font-bold uppercase tracking-wide text-white pr-2 pl-3 py-[3px]"
            style={{
              background: "#16a34a",
              clipPath: "polygon(6px 0, 100% 0, 100% 100%, 6px 100%, 0 50%)",
            }}
          >
            Ativável
          </span>
          <div
            className="w-[6px] h-[6px]"
            style={{
              background: "#15803d",
              clipPath: "polygon(0 0, 100% 0, 0 100%)",
            }}
          />
        </div>
      )}

      {/* Clickable area: image + info */}
      <div className="cursor-pointer rounded-t-lg overflow-hidden" onClick={() => setDetailOpen(true)}>
        {/* Image */}
        <div className="relative h-36 bg-muted/30 flex items-center justify-center">
          {img ? (
            <img src={img} alt={product.name} className="h-28 w-28 object-contain" />
          ) : (
            <div className="h-28 w-28 rounded-lg bg-muted/50 flex items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}
          {product.oldPrice && (
            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
              {Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 pb-0 space-y-2">
          {/* Category + Subcategory */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">
              {categoryName}
            </span>
            <span className="text-[10px] text-muted-foreground">{product.subcategory}</span>
          </div>

          {/* Name */}
          <h3 className="text-sm font-bold text-foreground leading-tight">{product.name}</h3>

          {/* Description */}
          <p
            className="text-[11px] text-muted-foreground line-clamp-2 leading-normal"
            style={{ minHeight: "calc(2 * 1.5 * 11px)" }}
          >
            {product.description || "\u00A0"}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
            <span className="text-base font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
          </div>

          {/* Points (plain text, no highlight) */}
          {totalPoints != null && (
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">{totalPoints}</span> pontos
            </p>
          )}
        </div>
      </div>

      {/* Variations + interactive footer */}
      <div className="flex flex-col flex-1 p-3 pt-2 gap-2">
        {product.variations && product.variations.length > 0 && (
          <div className="space-y-1.5">
            {product.variations.map((variation) => {
              const hasError = errors.includes(variation.label);
              return (
                <div key={variation.type}>
                  <p
                    className={cn(
                      "text-[11px] font-medium mb-1",
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
                        disabled={mode === "staff"}
                        className={cn(
                          "px-2 py-0.5 text-[11px] rounded border transition-colors",
                          selections[variation.type] === opt
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : hasError
                              ? "border-destructive/50 text-muted-foreground hover:border-destructive"
                              : "border-border text-muted-foreground hover:border-primary/50",
                          mode === "staff" && "cursor-default opacity-90 hover:border-border"
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
        )}

        {/* Footer row — same dimensions for both modes */}
        <div className="mt-auto pt-2 flex items-center gap-1.5">
          {mode === "franchisee" ? (
            <>
              <div
                className={cn(
                  "flex items-center border border-border rounded shrink-0",
                  !product.inStock && "opacity-40 pointer-events-none"
                )}
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={!product.inStock}
                  className="h-7 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-xs font-semibold text-foreground">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  disabled={!product.inStock}
                  className="h-7 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <Button
                size="sm"
                className={cn(
                  "flex-1 min-w-0 gap-1 text-[11px] h-7 px-2 transition-colors",
                  justAdded && "bg-green-600 hover:bg-green-600 text-white"
                )}
                disabled={!product.inStock || justAdded}
                onClick={handleAdd}
              >
                {justAdded ? (
                  <>
                    <Check className="h-3 w-3 shrink-0" />
                    <span className="truncate hidden sm:inline">Adicionado</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 shrink-0 sm:hidden" />
                    <ShoppingCart className="h-3 w-3 shrink-0" />
                    <span className="truncate hidden sm:inline">Adicionar</span>
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* SKU — same width as qty control (h-7, w-[68px]) */}
              <div className="flex items-center justify-center h-7 px-2 border border-border rounded shrink-0 bg-muted/30">
                <span className="text-[10px] font-medium text-muted-foreground truncate">
                  SKU: <span className="text-foreground font-semibold">{product.id}</span>
                </span>
              </div>
              {/* Stock tag — fills the rest, same height */}
              <div
                className={cn(
                  "flex-1 min-w-0 flex items-center justify-center h-7 px-2 rounded text-[11px] font-semibold",
                  product.inStock
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-destructive/10 text-destructive border border-destructive/30"
                )}
              >
                {product.inStock ? "Em estoque" : "Indisponível"}
              </div>
            </>
          )}
        </div>
      </div>

      <ProductDetailDialog product={product} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}

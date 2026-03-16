import { useState } from "react";
import { Plus, Minus, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/mock-products";
import type { CartItemSelection } from "@/hooks/useCart";

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

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, name: string, price: number, qty: number, selections: CartItemSelection) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [qty, setQty] = useState(1);
  const [selections, setSelections] = useState<CartItemSelection>(() => {
    const initial: CartItemSelection = {};
    product.variations?.forEach((v) => {
      initial[v.type] = v.options[0];
    });
    return initial;
  });

  const img = productImages[product.name];

  const handleAdd = () => {
    onAddToCart(product.id, product.name, product.price, qty, { ...selections });
    setQty(1);
  };

  return (
    <div className={cn(
      "flex flex-col rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-md @container",
      !product.inStock && "opacity-60"
    )}>
      {/* Image */}
      <div className="relative h-36 bg-muted/30 flex items-center justify-center">
        {img ? (
          <img src={img} alt={product.name} className="h-28 w-28 object-contain" />
        ) : (
          <div className="h-28 w-28 rounded-lg bg-muted/50 flex items-center justify-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
        {product.oldPrice && (
          <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
            {Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
          </span>
        )}
        {!product.inStock && (
          <span className="absolute top-2 right-2 bg-muted-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded">
            Indisponível
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <div>
          <p className="text-xs text-muted-foreground">{product.subcategory}</p>
          <h3 className="text-sm font-bold text-foreground leading-tight">{product.name}</h3>
          {product.description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">{formatCurrency(product.oldPrice)}</span>
          )}
          <span className="text-base font-bold text-primary">{formatCurrency(product.price)}</span>
        </div>

        {/* Points */}
        {(product.pointsUnilevel || product.pointsBinary) && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground flex-wrap">
            <Star className="h-3 w-3 text-warning shrink-0" />
            {product.pointsUnilevel && <span>{product.pointsUnilevel} pontos Unilevel</span>}
            {product.pointsUnilevel && product.pointsBinary && <span>·</span>}
            {product.pointsBinary && <span>{product.pointsBinary} pontos Binário</span>}
          </div>
        )}

        {/* Variations */}
        {product.variations && product.variations.length > 0 && (
          <div className="space-y-1.5">
            {product.variations.map((variation) => (
              <div key={variation.type}>
                <p className="text-[11px] font-medium text-muted-foreground mb-1">{variation.label}</p>
                <div className="flex flex-wrap gap-1">
                  {variation.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelections((s) => ({ ...s, [variation.type]: opt }))}
                      className={cn(
                        "px-2 py-0.5 text-[11px] rounded border transition-colors",
                        selections[variation.type] === opt
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quantity + Add */}
        <div className="mt-auto pt-2 flex items-center gap-1.5">
          <div className={cn("flex items-center border border-border rounded shrink-0", !product.inStock && "opacity-40 pointer-events-none")}>
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
            className="flex-1 min-w-0 gap-1 text-[11px] h-7 px-2"
            disabled={!product.inStock}
            onClick={handleAdd}
          >
            <Plus className="h-3 w-3 shrink-0 sm:hidden" />
            <ShoppingCart className="h-3 w-3 shrink-0" />
            <span className="truncate hidden sm:inline">Adicionar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

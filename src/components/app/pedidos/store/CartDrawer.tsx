import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CartItem, CartItemSelection } from "@/hooks/useCart";

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  onUpdateQty: (productId: string, selections: CartItemSelection, qty: number) => void;
  onRemoveItem: (productId: string, selections: CartItemSelection) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  open,
  onOpenChange,
  items,
  totalPrice,
  totalItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-sm flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-primary">
            <ShoppingBag className="h-5 w-5" />
            Carrinho ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 opacity-30" />
            <p className="text-sm">Seu carrinho está vazio</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-3 py-2">
              {items.map((item, idx) => {
                const selectionStr = Object.values(item.selections).filter(Boolean).join(" · ");
                return (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      {selectionStr && (
                        <p className="text-[11px] text-muted-foreground">{selectionStr}</p>
                      )}
                      <p className="text-sm font-bold text-primary mt-0.5">
                        {formatCurrency(item.price * item.qty)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center border border-border rounded">
                        <button
                          onClick={() => onUpdateQty(item.productId, item.selections, item.qty - 1)}
                          className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">{item.qty}</span>
                        <button
                          onClick={() => onUpdateQty(item.productId, item.selections, item.qty + 1)}
                          className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.productId, item.selections)}
                        className="h-7 w-7 flex items-center justify-center text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border pt-3 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold text-foreground">{formatCurrency(totalPrice)}</span>
              </div>
              <Button className="w-full gap-2" size="lg">
                <ShoppingBag className="h-4 w-4" />
                Finalizar Pedido
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={onClearCart}
              >
                Limpar carrinho
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

import { useState, useCallback } from "react";

export interface CartItemSelection {
  [variationType: string]: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  selections: CartItemSelection;
}

function cartKey(productId: string, selections: CartItemSelection): string {
  const sorted = Object.entries(selections).sort(([a], [b]) => a.localeCompare(b));
  return `${productId}::${sorted.map(([k, v]) => `${k}=${v}`).join("|")}`;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback(
    (productId: string, name: string, price: number, qty: number, selections: CartItemSelection) => {
      setItems((prev) => {
        const key = cartKey(productId, selections);
        const idx = prev.findIndex((i) => cartKey(i.productId, i.selections) === key);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], qty: updated[idx].qty + qty };
          return updated;
        }
        return [...prev, { productId, name, price, qty, selections }];
      });
    },
    [],
  );

  const updateQty = useCallback((productId: string, selections: CartItemSelection, qty: number) => {
    setItems((prev) => {
      const key = cartKey(productId, selections);
      if (qty <= 0) return prev.filter((i) => cartKey(i.productId, i.selections) !== key);
      return prev.map((i) => (cartKey(i.productId, i.selections) === key ? { ...i, qty } : i));
    });
  }, []);

  const removeItem = useCallback((productId: string, selections: CartItemSelection) => {
    setItems((prev) => {
      const key = cartKey(productId, selections);
      return prev.filter((i) => cartKey(i.productId, i.selections) !== key);
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.qty, 0);

  return { items, addItem, updateQty, removeItem, clearCart, totalItems, totalPrice };
}

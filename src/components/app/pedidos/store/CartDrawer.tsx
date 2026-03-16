import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, Tag, Ticket, MapPin, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const navigate = useNavigate();

  const [showCoupon, setShowCoupon] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [showVoucher, setShowVoucher] = useState(false);
  const [voucher, setVoucher] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState("");

  const [cep, setCep] = useState("");
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [shippingLabel, setShippingLabel] = useState("");

  const totalDiscounts = couponDiscount + voucherDiscount;
  const shipping = shippingCost ?? 0;
  const grandTotal = Math.max(0, totalPrice - totalDiscounts + shipping);

  const handleApplyCoupon = () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    // Mock: simulate API call
    setTimeout(() => {
      const code = coupon.trim().toUpperCase();
      if (code === "TIMOL10") {
        setAppliedCoupon(code);
        setCouponDiscount(totalPrice * 0.1);
        setCouponError("");
      } else {
        setCouponError("Cupom inválido ou expirado");
      }
      setCouponLoading(false);
    }, 800);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCoupon("");
    setCouponError("");
  };

  const handleApplyVoucher = () => {
    if (!voucher.trim()) return;
    setVoucherLoading(true);
    setVoucherError("");
    setTimeout(() => {
      const code = voucher.trim().toUpperCase();
      if (code === "VOUCHER50") {
        setAppliedVoucher(code);
        setVoucherDiscount(50);
        setVoucherError("");
      } else {
        setVoucherError("Voucher inválido ou já utilizado");
      }
      setVoucherLoading(false);
    }, 800);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    setVoucher("");
    setVoucherError("");
  };

  const handleCalcShipping = () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setShippingError("CEP inválido");
      return;
    }
    setShippingLoading(true);
    setShippingError("");
    setTimeout(() => {
      setShippingCost(18.9);
      setShippingLabel("PAC · 5 a 8 dias úteis");
      setShippingError("");
      setShippingLoading(false);
    }, 1000);
  };

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return digits;
  };

  const handleFinalize = () => {
    onOpenChange(false);
    navigate("/app/pedidos/checkout", {
      state: {
        items,
        subtotal: totalPrice,
        coupon: appliedCoupon,
        couponDiscount,
        voucher: appliedVoucher,
        voucherDiscount,
        shippingCost,
        shippingLabel,
        cep: cep.replace(/\D/g, ""),
        grandTotal,
      },
    });
  };

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
            {/* Items */}
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

            {/* Coupon / Voucher / CEP */}
            <div className="border-t border-border pt-3 space-y-3 -mx-6 px-6">
              {/* Cupom */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-primary/5 rounded px-2.5 py-1.5">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1"><Tag className="h-3 w-3" />{appliedCoupon}</span>
                    <button onClick={handleRemoveCoupon} className="text-[11px] text-destructive hover:underline">Remover</button>
                  </div>
                ) : showCoupon ? (
                  <>
                    <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">
                      <Tag className="h-3 w-3" /> Cupom de desconto
                    </label>
                    <div className="flex gap-1.5">
                      <Input
                        value={coupon}
                        onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponError(""); }}
                        placeholder="Código do cupom"
                        className="h-8 text-xs flex-1"
                        autoFocus
                      />
                      <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={handleApplyCoupon} disabled={couponLoading || !coupon.trim()}>
                        {couponLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Aplicar"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => setShowCoupon(true)} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className="h-3 w-3" /> Adicionar cupom de desconto
                  </button>
                )}
              </div>

              {/* Voucher */}
              <div>
                {appliedVoucher ? (
                  <div className="flex items-center justify-between bg-primary/5 rounded px-2.5 py-1.5">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1"><Ticket className="h-3 w-3" />{appliedVoucher}</span>
                    <button onClick={handleRemoveVoucher} className="text-[11px] text-destructive hover:underline">Remover</button>
                  </div>
                ) : showVoucher ? (
                  <>
                    <button onClick={() => setShowVoucher(false)} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-1">
                      <ChevronUp className="h-3 w-3" /> Voucher
                    </button>
                )}
                {couponError && <p className="text-[11px] text-destructive mt-0.5">{couponError}</p>}
              </div>

              {/* Voucher */}
              <div>
                {appliedVoucher ? (
                  <div className="flex items-center justify-between bg-primary/5 rounded px-2.5 py-1.5">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1"><Ticket className="h-3 w-3" />{appliedVoucher}</span>
                    <button onClick={handleRemoveVoucher} className="text-[11px] text-destructive hover:underline">Remover</button>
                  </div>
                ) : showVoucher ? (
                  <>
                    <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">
                      <Ticket className="h-3 w-3" /> Voucher
                    </label>
                    <div className="flex gap-1.5">
                      <Input
                        value={voucher}
                        onChange={(e) => { setVoucher(e.target.value.toUpperCase()); setVoucherError(""); }}
                        placeholder="Código do voucher"
                        className="h-8 text-xs flex-1"
                        autoFocus
                      />
                      <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={handleApplyVoucher} disabled={voucherLoading || !voucher.trim()}>
                        {voucherLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Aplicar"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => setShowVoucher(true)} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className="h-3 w-3" /> Adicionar voucher
                  </button>
                )}
                {voucherError && <p className="text-[11px] text-destructive mt-0.5">{voucherError}</p>}
              </div>

              {/* CEP */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3" /> Calcular frete
                </label>
                <div className="flex gap-1.5">
                  <Input
                    value={cep}
                    onChange={(e) => { setCep(formatCep(e.target.value)); setShippingError(""); }}
                    placeholder="00000-000"
                    className="h-8 text-xs flex-1"
                    maxLength={9}
                  />
                  <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={handleCalcShipping} disabled={shippingLoading || cep.replace(/\D/g, "").length < 8}>
                    {shippingLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Calcular"}
                  </Button>
                </div>
                {shippingError && <p className="text-[11px] text-destructive mt-0.5">{shippingError}</p>}
                {shippingLabel && shippingCost !== null && (
                  <p className="text-[11px] text-muted-foreground mt-1">{shippingLabel}</p>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>Cupom ({appliedCoupon})</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>Voucher ({appliedVoucher})</span>
                  <span>-{formatCurrency(voucherDiscount)}</span>
                </div>
              )}
              {shippingCost !== null && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Frete</span>
                  <span>{shippingCost === 0 ? "Grátis" : formatCurrency(shippingCost)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-primary text-base">{formatCurrency(grandTotal)}</span>
              </div>

              <Button className="w-full gap-2" size="lg" onClick={handleFinalize}>
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

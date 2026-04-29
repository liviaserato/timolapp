import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, Tag, MapPin, Loader2, ChevronDown, ChevronUp, Package, Zap, Store, X, Check } from "lucide-react";
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
  const [shippingOptions, setShippingOptions] = useState<{ id: string; label: string; detail: string; cost: number; icon: React.ReactNode }[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [selectedPickupUnit, setSelectedPickupUnit] = useState<string | null>(null);
  const [pickupUnits, setPickupUnits] = useState<{ id: string; name: string; distanceKm?: number }[]>([]);
  const [pickupLoading, setPickupLoading] = useState(false);

  const shippingCost = shippingOptions.find(o => o.id === selectedShipping)?.cost ?? null;
  const shippingLabel = selectedShipping === "retirada" && selectedPickupUnit
    ? `Retirar na Timol - ${pickupUnits.find(u => u.id === selectedPickupUnit)?.name ?? ""}`
    : shippingOptions.find(o => o.id === selectedShipping)?.label ?? "";
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

  const handleCalcShipping = async () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setShippingError("CEP inválido");
      return;
    }
    setShippingLoading(true);
    setShippingError("");
    setShippingOptions([]);
    setSelectedShipping(null);
    setPickupUnits([]);
    setSelectedPickupUnit(null);

    // Fetch pickup distances in parallel with mock shipping delay
    const distancePromise = (async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/calculate-pickup-distances`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cep: cleanCep }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          return data.units as { id: string; name: string; distanceKm: number }[];
        }
      } catch (e) {
        console.error("Error fetching pickup distances:", e);
      }
      return null;
    })();

    // Mock shipping options (will be replaced with real API)
    await new Promise((r) => setTimeout(r, 1000));
    setShippingOptions([
      { id: "pac", label: "PAC", detail: "5 a 8 dias úteis", cost: 18.9, icon: <Package className="h-3.5 w-3.5" /> },
      { id: "sedex", label: "SEDEX", detail: "1 a 3 dias úteis", cost: 32.5, icon: <Zap className="h-3.5 w-3.5" /> },
      { id: "retirada", label: "Retirar na Timol", detail: "Escolha a unidade", cost: 0, icon: <Store className="h-3.5 w-3.5" /> },
    ]);
    setSelectedShipping("pac");
    setShippingLoading(false);

    // Resolve distances (may already be done or still loading)
    setPickupLoading(true);
    const units = await distancePromise;
    if (units) {
      setPickupUnits(units);
    } else {
      // Fallback without distances
      setPickupUnits([
        { id: "salvador", name: "Unidade Salvador" },
        { id: "sao-paulo", name: "Unidade São Paulo" },
        { id: "uberlandia", name: "Unidade Uberlândia" },
      ]);
    }
    setPickupLoading(false);
  };

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return digits;
  };

  const [finalizeError, setFinalizeError] = useState("");

  const handleFinalize = () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length < 8 || selectedShipping === null) {
      setFinalizeError(
        cleanCep.length < 8
          ? "Preencha o CEP e calcule o frete"
          : "Escolha uma forma de envio"
      );
      return;
    }
    if (selectedShipping === "retirada" && !selectedPickupUnit) {
      setFinalizeError("Escolha uma unidade para retirada");
      return;
    }
    setFinalizeError("");
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
        pickupUnit: selectedPickupUnit ? pickupUnits.find(u => u.id === selectedPickupUnit)?.name : null,
        cep: cleanCep,
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
                    <button onClick={() => { setShowCoupon(false); setCouponError(""); }} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-1">
                      <Tag className="h-3 w-3" /> Cupom de desconto <ChevronUp className="h-3 w-3" />
                    </button>
                    <form onSubmit={(e) => { e.preventDefault(); handleApplyCoupon(); }} className="flex gap-1.5">
                      <div className="relative flex-1">
                        <Input
                          value={coupon}
                          onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponError(""); }}
                          placeholder="Código do cupom"
                          className="h-8 text-xs pr-7"
                          autoFocus
                        />
                        {coupon && (
                          <button type="button" onClick={() => { setCoupon(""); setCouponError(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <Button type="submit" size="sm" variant="outline" className="h-8 text-xs px-3" disabled={couponLoading || !coupon.trim()}>
                        {couponLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Aplicar"}
                      </Button>
                    </form>
                  </>
                ) : (
                  <button onClick={() => setShowCoupon(true)} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <Tag className="h-3 w-3" /> Adicionar cupom de desconto <ChevronDown className="h-3 w-3" />
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
                    <button onClick={() => { setShowVoucher(false); setVoucherError(""); }} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-1">
                      <Ticket className="h-3 w-3" /> Voucher <ChevronUp className="h-3 w-3" />
                    </button>
                    <form onSubmit={(e) => { e.preventDefault(); handleApplyVoucher(); }} className="flex gap-1.5">
                      <div className="relative flex-1">
                        <Input
                          value={voucher}
                          onChange={(e) => { setVoucher(e.target.value.toUpperCase()); setVoucherError(""); }}
                          placeholder="Código do voucher"
                          className="h-8 text-xs pr-7"
                          autoFocus
                        />
                        {voucher && (
                          <button type="button" onClick={() => { setVoucher(""); setVoucherError(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <Button type="submit" size="sm" variant="outline" className="h-8 text-xs px-3" disabled={voucherLoading || !voucher.trim()}>
                        {voucherLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Aplicar"}
                      </Button>
                    </form>
                  </>
                ) : (
                  <button onClick={() => setShowVoucher(true)} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <Ticket className="h-3 w-3" /> Adicionar voucher <ChevronDown className="h-3 w-3" />
                  </button>
                )}
                {voucherError && <p className="text-[11px] text-destructive mt-0.5">{voucherError}</p>}
              </div>

              <Separator />

              {/* CEP */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3" /> Calcular frete
                </label>
                <form onSubmit={(e) => { e.preventDefault(); handleCalcShipping(); }} className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Input
                      value={cep}
                      onChange={(e) => { setCep(formatCep(e.target.value)); setShippingError(""); setShippingOptions([]); setSelectedShipping(null); setFinalizeError(""); }}
                      placeholder="00000-000"
                      className="h-8 text-xs pr-7"
                      maxLength={9}
                    />
                    {cep && (
                      <button type="button" onClick={() => { setCep(""); setShippingError(""); setShippingOptions([]); setSelectedShipping(null); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <Button type="submit" size="sm" variant="outline" className="h-8 text-xs px-3" disabled={shippingLoading || cep.replace(/\D/g, "").length < 8}>
                    {shippingLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Calcular"}
                  </Button>
                </form>
                {shippingError && <p className="text-[11px] text-destructive mt-0.5">{shippingError}</p>}
                {shippingOptions.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {shippingOptions.map((opt) => (
                      <div key={opt.id}>
                        <button
                          onClick={() => {
                            setSelectedShipping(opt.id);
                            if (opt.id !== "retirada") setSelectedPickupUnit(null);
                            setFinalizeError("");
                          }}
                          className={`w-full flex items-center gap-2 rounded border px-2.5 py-2 text-left transition-colors ${
                            selectedShipping === opt.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/30"
                          }`}
                        >
                          <span className={selectedShipping === opt.id ? "text-primary" : "text-muted-foreground"}>{opt.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className={`text-[11px] font-semibold ${selectedShipping === opt.id ? "text-primary" : "text-foreground"}`}>{opt.label}</span>
                            <span className="text-[10px] text-muted-foreground ml-1.5">{opt.detail}</span>
                          </div>
                          <span className={`text-[11px] font-bold ${selectedShipping === opt.id ? "text-primary" : "text-foreground"}`}>
                            {opt.cost === 0 ? "Grátis" : formatCurrency(opt.cost)}
                          </span>
                        </button>
                        {/* Pickup unit selector */}
                        {opt.id === "retirada" && selectedShipping === "retirada" && (
                          <div className="ml-5 mt-1 mb-0.5 space-y-1">
                            {pickupLoading ? (
                              <div className="flex items-center gap-2 px-2.5 py-1.5 text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span className="text-[11px]">Calculando distâncias...</span>
                              </div>
                            ) : pickupUnits.length > 0 ? (
                              pickupUnits.map((unit) => (
                                <button
                                  key={unit.id}
                                  onClick={() => { setSelectedPickupUnit(unit.id); setFinalizeError(""); }}
                                  className={`w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left transition-colors ${
                                    selectedPickupUnit === unit.id
                                      ? "bg-primary/10 text-primary"
                                      : "hover:bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {selectedPickupUnit === unit.id ? (
                                    <Check className="h-3 w-3 text-primary" />
                                  ) : (
                                    <Store className="h-3 w-3 opacity-40" />
                                  )}
                                  <span className={`text-[11px] flex-1 ${selectedPickupUnit === unit.id ? "font-semibold" : ""}`}>
                                    {unit.name}
                                  </span>
                                  {unit.distanceKm != null && (
                                    <span className={`text-[10px] ${selectedPickupUnit === unit.id ? "text-primary/70" : "text-muted-foreground"}`}>
                                      ~{unit.distanceKm.toLocaleString("pt-BR")}km
                                    </span>
                                  )}
                                </button>
                              ))
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className={cn("pt-3 space-y-2", (couponDiscount > 0 || voucherDiscount > 0 || shippingCost !== null) && "border-t border-border")}>
              {(couponDiscount > 0 || voucherDiscount > 0 || shippingCost !== null) && (
                <>
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
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-primary text-base">{formatCurrency(grandTotal)}</span>
              </div>

              {finalizeError && <p className="text-[11px] text-destructive text-center">{finalizeError}</p>}
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

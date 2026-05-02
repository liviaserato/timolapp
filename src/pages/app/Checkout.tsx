import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ShoppingBag,
  Truck,
  Check,
  Store,
  Package,
  MapPin,
  Loader2,
  X,
  Zap,
  CreditCard,
  Receipt,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { CartItem } from "@/hooks/useCart";
import { AddressManager, type Address } from "@/components/app/cadastro/AddressManager";
import { products as allProducts } from "@/data/mock-products";

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface CheckoutState {
  items: CartItem[];
  subtotal: number;
  grandTotal: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheckoutState | null;

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);

  // Itens locais (permite remoção sem mexer no carrinho global)
  const [localItems, setLocalItems] = useState<CartItem[]>(state?.items ?? []);
  useEffect(() => {
    if (state?.items) setLocalItems(state.items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveItem = (idx: number) => {
    setLocalItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Cupom
  const [showCoupon, setShowCoupon] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Frete (sem CEP - calculado a partir do endereço selecionado)
  const [shippingOptions, setShippingOptions] = useState<{ id: string; label: string; detail: string; cost: number; icon: React.ReactNode }[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [selectedPickupUnit, setSelectedPickupUnit] = useState<string | null>(null);
  const [pickupUnits, setPickupUnits] = useState<{ id: string; name: string; distanceKm?: number }[]>([]);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [showAllUnits, setShowAllUnits] = useState(false);

  // Mock pickup availability per unit (days for pickup readiness)
  const pickupAvailability: Record<string, { days: string; partial?: boolean }> = {
    "sao-paulo": { days: "Disponível em 1 dia útil" },
    "uberlandia": { days: "Disponível em 2 dias úteis" },
    "salvador": { days: "Disponível em 5 a 7 dias úteis", partial: true },
  };

  // Mock addresses from profile
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "addr-1",
      label: "Casa",
      country: "Brasil",
      countryIso2: "BR",
      zipCode: "01001-000",
      street: "Rua das Palmeiras",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      isDefault: true,
    },
  ]);
  const selectedAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  if (!state || !state.items || state.items.length === 0 || localItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-muted-foreground">Nenhum item no pedido.</p>
        <Button variant="outline" onClick={() => navigate("/app/pedidos/realizar")}>
          Voltar à loja
        </Button>
      </div>
    );
  }

  const items = localItems;
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  const shippingCost = shippingOptions.find(o => o.id === selectedShipping)?.cost ?? null;
  const shippingLabel = selectedShipping === "retirada" && selectedPickupUnit
    ? `Retirar na Timol - ${pickupUnits.find(u => u.id === selectedPickupUnit)?.name ?? ""}`
    : shippingOptions.find(o => o.id === selectedShipping)?.label ?? "";
  const pickupUnit = selectedPickupUnit ? pickupUnits.find(u => u.id === selectedPickupUnit)?.name ?? null : null;

  const grandTotal = Math.max(0, subtotal - couponDiscount + (shippingCost ?? 0));

  // Cupom handlers
  const handleApplyCoupon = () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setTimeout(() => {
      const code = coupon.trim().toUpperCase();
      if (code === "TIMOL10") {
        setAppliedCoupon(code);
        setCouponDiscount(subtotal * 0.1);
        setCouponError("");
        setShowCoupon(false);
      } else {
        setCouponError("Cupom inválido ou expirado");
      }
      setCouponLoading(false);
    }, 500);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCoupon("");
    setCouponError("");
    setShowCoupon(false);
  };

  const handleEditCoupon = () => {
    const code = appliedCoupon ?? "";
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCoupon(code);
    setCouponError("");
    setShowCoupon(true);
  };

  // Frete handlers
  const handleCalcShipping = async () => {
    if (!selectedAddress) return;
    const cleanCep = selectedAddress.zipCode.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    setShippingLoading(true);
    setShippingOptions([]);
    setSelectedShipping(null);
    setPickupUnits([]);
    setSelectedPickupUnit(null);

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

    await new Promise((r) => setTimeout(r, 600));
    setShippingOptions([
      { id: "pac", label: "PAC", detail: "5 a 8 dias úteis", cost: 18.9, icon: <Package className="h-3.5 w-3.5" /> },
      { id: "sedex", label: "SEDEX", detail: "1 a 3 dias úteis", cost: 32.5, icon: <Zap className="h-3.5 w-3.5" /> },
      { id: "retirada", label: "Retirar na Timol", detail: "Escolha a unidade", cost: 0, icon: <Store className="h-3.5 w-3.5" /> },
    ]);
    setSelectedShipping("pac");
    setShippingLoading(false);

    setPickupLoading(true);
    const units = await distancePromise;
    if (units) {
      setPickupUnits(units);
    } else {
      setPickupUnits([
        { id: "salvador", name: "Unidade Salvador" },
        { id: "sao-paulo", name: "Unidade São Paulo" },
        { id: "uberlandia", name: "Unidade Uberlândia" },
      ]);
    }
    setPickupLoading(false);
  };

  // Auto-calculate when address changes
  useEffect(() => {
    if (selectedAddress) {
      handleCalcShipping();
    } else {
      setShippingOptions([]);
      setSelectedShipping(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress?.id]);

  const handleGoToPayment = () => {
    if (selectedShipping === null) {
      toast.error("Calcule o frete antes de continuar");
      return;
    }
    if (selectedShipping === "retirada" && !selectedPickupUnit) {
      toast.error("Escolha uma unidade para retirada");
      return;
    }
    navigate("/app/pedidos/pagamento", {
      state: {
        items,
        subtotal,
        coupon: appliedCoupon,
        couponDiscount,
        shippingCost,
        shippingLabel,
        pickupUnit,
        grandTotal,
        cep: selectedAddress?.zipCode ?? "",
      },
    });
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="text-primary hover:text-primary/80 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Resumo do Pedido</h1>
            <p className="text-sm text-muted-foreground">Confirme os dados e finalize</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* COLUNA ESQUERDA — Itens do pedido */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Itens do Pedido ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {items.map((item, idx) => {
                const product = allProducts.find((p) => p.id === item.productId);
                const image = product?.image;
                const selStr = Object.values(item.selections).filter(Boolean).join(" · ");
                return (
                  <div
                    key={idx}
                    className="relative flex items-stretch gap-3 rounded-md border border-border p-2"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      aria-label={`Remover ${item.name}`}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-background border border-border text-muted-foreground hover:text-destructive hover:border-destructive flex items-center justify-center transition-colors shadow-sm"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {/* Imagem quadrada */}
                    <div className="w-16 h-16 shrink-0 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                      {image ? (
                        <img
                          src={image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground/40" />
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-normal px-1.5 py-0 h-4"
                          >
                            {item.qty} {item.qty === 1 ? "unidade" : "unidades"}
                          </Badge>
                        </div>
                        <span className="text-sm text-foreground whitespace-nowrap pr-3">
                          {formatCurrency(item.price * item.qty)}
                        </span>
                      </div>
                      {selStr && (
                        <p className="text-[11px] text-muted-foreground">{selStr}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* COLUNA DIREITA — Entrega + Resumo da compra empilhados */}
          <div className="flex flex-col gap-4 md:sticky md:top-0">
            {/* Entrega */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {selectedAddress ? (
                  <div className="rounded-md border border-border p-2.5">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0 text-xs text-foreground space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold">{selectedAddress.label || "Endereço"}</p>
                          <button
                            type="button"
                            onClick={() => setAddressDialogOpen(true)}
                            className="text-[11px] text-muted-foreground hover:text-primary underline-offset-2 hover:underline transition-colors"
                          >
                            Alterar
                          </button>
                        </div>
                        <p>
                          {selectedAddress.street}, {selectedAddress.number}
                          {selectedAddress.complement ? ` · ${selectedAddress.complement}` : ""}
                        </p>
                        <p className="text-muted-foreground">
                          {selectedAddress.neighborhood} · {selectedAddress.city} – {selectedAddress.state}
                        </p>
                        <p className="text-muted-foreground">CEP {selectedAddress.zipCode}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground text-center py-3">
                      Nenhum endereço cadastrado.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-7"
                      onClick={() => setAddressDialogOpen(true)}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Adicionar endereço
                    </Button>
                  </div>
                )}

                {selectedAddress && (
                  <div className="mt-3 space-y-2">
                    {shippingLoading ? (
                      <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-[11px]">Calculando opções de entrega...</span>
                      </div>
                    ) : (
                      <>
                        <Select
                          value={selectedShipping ?? undefined}
                          onValueChange={(v) => {
                            setSelectedShipping(v);
                            if (v !== "retirada") setSelectedPickupUnit(null);
                          }}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Selecione a forma de entrega" />
                          </SelectTrigger>
                          <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                            {shippingOptions.map((opt) => (
                              <SelectItem key={opt.id} value={opt.id} className="text-xs pr-6 [&>span:last-child]:w-full">
                                <div className="flex items-center gap-2 w-full">
                                  <span className="text-muted-foreground">{opt.icon}</span>
                                  <span className="font-semibold">{opt.label}</span>
                                  <span className="text-[10px] text-muted-foreground">{opt.detail}</span>
                                  <span className="ml-auto pl-3 font-semibold">
                                    {opt.cost === 0 ? "Grátis" : formatCurrency(opt.cost)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selectedShipping === "retirada" && (
                          <div className="rounded-md border border-border p-2 space-y-1">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground px-1">
                              Selecione a unidade
                            </p>
                            {pickupLoading ? (
                              <div className="flex items-center gap-2 px-2.5 py-1.5 text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span className="text-[11px]">Calculando distâncias...</span>
                              </div>
                            ) : pickupUnits.length > 0 ? (
                              pickupUnits.map((unit) => (
                                <button
                                  key={unit.id}
                                  onClick={() => setSelectedPickupUnit(unit.id)}
                                  className={cn(
                                    "w-full flex items-center gap-2 rounded px-2 py-1.5 text-left transition-colors",
                                    selectedPickupUnit === unit.id
                                      ? "bg-primary/10 text-primary"
                                      : "hover:bg-muted text-muted-foreground"
                                  )}
                                >
                                  {selectedPickupUnit === unit.id ? (
                                    <Check className="h-3 w-3 text-primary" />
                                  ) : (
                                    <Store className="h-3 w-3 opacity-40" />
                                  )}
                                  <span className={cn("text-[11px] flex-1", selectedPickupUnit === unit.id && "font-semibold")}>
                                    {unit.name}
                                  </span>
                                  {unit.distanceKm != null && (
                                    <span className={cn("text-[10px]", selectedPickupUnit === unit.id ? "text-primary/70" : "text-muted-foreground")}>
                                      ~{unit.distanceKm.toLocaleString("pt-BR")}km
                                    </span>
                                  )}
                                </button>
                              ))
                            ) : null}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo da compra */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Resumo da compra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                {/* Produtos */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Produtos</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {/* Frete */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Frete</span>
                  <span>
                    {shippingCost === null
                      ? "—"
                      : shippingCost === 0
                        ? "Grátis"
                        : formatCurrency(shippingCost)}
                  </span>
                </div>

                {/* Cupom */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5 flex-wrap">
                      Cupom
                      {appliedCoupon && (
                        <>
                          <span className="text-foreground font-medium">{appliedCoupon}</span>
                          <span className="text-green-600 font-medium">-{formatCurrency(couponDiscount)}</span>
                        </>
                      )}
                    </span>
                    {appliedCoupon ? (
                      <span className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleEditCoupon}
                          className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                        >
                          Editar
                        </button>
                        <span className="text-muted-foreground/40">·</span>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Remover
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCoupon((v) => !v);
                          if (showCoupon) {
                            setCoupon("");
                            setCouponError("");
                          }
                        }}
                        className="text-[11px] text-primary hover:underline"
                      >
                        {showCoupon ? "Cancelar" : "Adicionar cupom"}
                      </button>
                    )}
                  </div>

                  {showCoupon && !appliedCoupon && (
                    <div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleApplyCoupon();
                        }}
                        className="flex gap-1.5"
                      >
                        <div className="relative flex-1">
                          <Input
                            value={coupon}
                            onChange={(e) => {
                              setCoupon(e.target.value.toUpperCase());
                              setCouponError("");
                            }}
                            placeholder="Código do cupom"
                            className="h-8 text-xs pr-7"
                            autoFocus
                          />
                          {coupon && (
                            <button
                              type="button"
                              onClick={() => {
                                setCoupon("");
                                setCouponError("");
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs px-3 w-20 shrink-0"
                          disabled={couponLoading || !coupon.trim()}
                        >
                          {couponLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Aplicar"}
                        </Button>
                      </form>
                      {couponError && (
                        <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Total — encerra aqui */}
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Botão Efetuar pagamento */}
            <Button className="w-full gap-2" size="lg" onClick={handleGoToPayment}>
              <CreditCard className="h-5 w-5" />
              Efetuar Pagamento
            </Button>
          </div>
        </div>

        {/* AddressManager dialog (controlled) */}
        <AddressManager
          addresses={addresses}
          onChange={setAddresses}
          currentCountryIso2="BR"
          franchiseCurrency="BRL"
          dialogOnly
          open={addressDialogOpen}
          onOpenChange={setAddressDialogOpen}
        />
      </div>
    </div>
  );
}

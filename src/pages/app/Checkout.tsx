import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  CreditCard,
  Building2,
  QrCode,
  ShoppingBag,
  Truck,
  Check,
  Edit2,
  Store,
  Package,
  MapPinned,
  Wallet,
  Tag,
  MapPin,
  Loader2,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CartItem } from "@/hooks/useCart";
import { AddressManager, type Address } from "@/components/app/cadastro/AddressManager";
import { Receipt } from "lucide-react";

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
  const isMobile = useIsMobile();

  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);

  // Mock wallet balance
  const walletBalance = 250.00;
  const [walletInput, setWalletInput] = useState("");
  const [walletApplied, setWalletApplied] = useState(0);
  const [walletError, setWalletError] = useState("");

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

  if (!state || !state.items || state.items.length === 0) {
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

  const { items, subtotal } = state;

  const shippingCost = shippingOptions.find(o => o.id === selectedShipping)?.cost ?? null;
  const shippingLabel = selectedShipping === "retirada" && selectedPickupUnit
    ? `Retirar na Timol - ${pickupUnits.find(u => u.id === selectedPickupUnit)?.name ?? ""}`
    : shippingOptions.find(o => o.id === selectedShipping)?.label ?? "";
  const pickupUnit = selectedPickupUnit ? pickupUnits.find(u => u.id === selectedPickupUnit)?.name ?? null : null;
  const isPickup = !!pickupUnit;

  const grandTotal = Math.max(0, subtotal - couponDiscount + (shippingCost ?? 0));

  const pixDiscount = paymentMethod === "pix" ? grandTotal * 0.05 : 0;
  const finalTotal = Math.max(0, grandTotal - pixDiscount - walletApplied);

  const totalBeforeWallet = grandTotal - pixDiscount;

  // Mask: digits only -> "R$ 0,00"
  const formatWalletInput = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    const num = parseInt(digits, 10) / 100;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const parseWalletInput = (masked: string): number => {
    const digits = masked.replace(/\D/g, "");
    if (!digits) return 0;
    return parseInt(digits, 10) / 100;
  };

  const handleApplyWallet = () => {
    const value = parseWalletInput(walletInput);
    if (value <= 0) {
      setWalletError("Informe um valor válido");
      return;
    }
    if (value > walletBalance) {
      setWalletError("Valor maior que o disponível");
      return;
    }
    if (value > totalBeforeWallet) {
      setWalletError("Valor maior que o total do pedido");
      return;
    }
    setWalletError("");
    setWalletApplied(value);
  };

  const handleRemoveWallet = () => {
    setWalletApplied(0);
    setWalletInput("");
    setWalletError("");
  };

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
        finalTotal,
        paymentMethod,
        pixDiscount,
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

      <div className="flex-1 overflow-y-auto space-y-4 pb-6">
        {/* Items summary */}
        <Card>
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Itens do Pedido ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {items.map((item, idx) => {
              const selStr = Object.values(item.selections).filter(Boolean).join(" · ");
              return (
                 <div key={idx} className="flex justify-between items-start text-sm gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      <span>{item.name}</span>
                      {selStr && (
                        <span className="text-[11px] text-muted-foreground font-normal"> ({selStr})</span>
                      )}
                      <span className="font-normal"> x {item.qty}</span>
                    </p>
                  </div>
                  <span className="font-semibold text-foreground ml-3 whitespace-nowrap">
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Entrega + Resumo da compra (2 colunas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {/* Entrega (esquerda) */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Endereço selecionado */}
              {selectedAddress ? (
                <div className="space-y-2">
                  <div className="rounded-md border border-border p-2.5">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0 text-xs text-foreground space-y-0.5">
                        {selectedAddress.label && (
                          <p className="font-semibold">{selectedAddress.label}</p>
                        )}
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-7 text-muted-foreground"
                    onClick={() => setAddressDialogOpen(true)}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Alterar endereço
                  </Button>
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

              {/* Opções de entrega */}
              {selectedAddress && (
                <div className="mt-3 space-y-1.5">
                  {shippingLoading ? (
                    <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-[11px]">Calculando opções de entrega...</span>
                    </div>
                  ) : (
                    shippingOptions.map((opt) => (
                      <div key={opt.id}>
                        <button
                          onClick={() => {
                            setSelectedShipping(opt.id);
                            if (opt.id !== "retirada") setSelectedPickupUnit(null);
                          }}
                          className={cn(
                            "w-full flex items-center gap-2 rounded border px-2.5 py-2 text-left transition-colors",
                            selectedShipping === opt.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/30"
                          )}
                        >
                          <span className={selectedShipping === opt.id ? "text-primary" : "text-muted-foreground"}>{opt.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className={cn("text-[11px] font-semibold", selectedShipping === opt.id ? "text-primary" : "text-foreground")}>{opt.label}</span>
                            <span className="text-[10px] text-muted-foreground ml-1.5">{opt.detail}</span>
                          </div>
                          <span className={cn("text-[11px] font-bold", selectedShipping === opt.id ? "text-primary" : "text-foreground")}>
                            {opt.cost === 0 ? "Grátis" : formatCurrency(opt.cost)}
                          </span>
                        </button>
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
                                  onClick={() => setSelectedPickupUnit(unit.id)}
                                  className={cn(
                                    "w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left transition-colors",
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
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo da compra (direita) */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Resumo da compra
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-2 pt-4">
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
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Remover
                    </button>
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

              {/* Total destacado */}
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span
                  className={cn(
                    "font-bold text-primary",
                    pixDiscount > 0 || walletApplied > 0 ? "text-base" : "text-2xl"
                  )}
                >
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              {(pixDiscount > 0 || walletApplied > 0) && (
                <>
                  <Separator />
                  {walletApplied > 0 && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Saldo carteira</span>
                      <span>-{formatCurrency(walletApplied)}</span>
                    </div>
                  )}
                  {pixDiscount > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Desconto PIX (5%)</span>
                      <span>-{formatCurrency(pixDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-sm font-semibold text-foreground">Total a pagar</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Saldo em carteira
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                Disponível: <span className="font-semibold text-foreground">{formatCurrency(walletBalance - walletApplied)}</span>
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {walletApplied > 0 ? (
              <div className="flex items-center justify-between bg-primary/5 rounded px-3 py-2">
                <span className="text-xs text-foreground">
                  Aplicado: <span className="font-bold text-primary">{formatCurrency(walletApplied)}</span>
                </span>
                <button onClick={handleRemoveWallet} className="text-[11px] text-destructive hover:underline">
                  Remover
                </button>
              </div>
            ) : (
              <>
                <form
                  onSubmit={(e) => { e.preventDefault(); handleApplyWallet(); }}
                  className="flex gap-1.5"
                >
                  <Input
                    value={walletInput}
                    onChange={(e) => {
                      setWalletInput(formatWalletInput(e.target.value));
                      setWalletError("");
                    }}
                    placeholder="R$ 0,00"
                    inputMode="numeric"
                    className="h-8 text-xs flex-1"
                    disabled={walletBalance <= 0}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs px-3 w-20 shrink-0"
                    disabled={!walletInput.trim() || walletBalance <= 0}
                  >
                    Confirmar
                  </Button>
                </form>
                {walletError && (
                  <p className="text-[11px] text-destructive mt-1">{walletError}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment method */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Forma de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
              {/* PIX */}
              <label
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                  paymentMethod === "pix" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                )}
              >
                <RadioGroupItem value="pix" id="pix" />
                <QrCode className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">PIX</p>
                  <p className="text-[11px] text-green-600 font-medium">5% de desconto</p>
                </div>
                <span className="text-sm font-bold text-primary">{formatCurrency(Math.max(0, grandTotal * 0.95 - walletApplied))}</span>
              </label>

              {/* Boleto */}
              <label
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                  paymentMethod === "boleto" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                )}
              >
                <RadioGroupItem value="boleto" id="boleto" />
                <Building2 className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Boleto Bancário</p>
                  <p className="text-[11px] text-muted-foreground">Vencimento em 3 dias</p>
                </div>
                <span className="text-sm font-bold text-foreground">{formatCurrency(Math.max(0, grandTotal - walletApplied))}</span>
              </label>

              {/* Credit card */}
              <label
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                  paymentMethod === "credit" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                )}
              >
                <RadioGroupItem value="credit" id="credit" />
                <CreditCard className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Cartão de Crédito</p>
                  <p className="text-[11px] text-muted-foreground">Até 12x sem juros</p>
                </div>
                <span className="text-sm font-bold text-foreground">{formatCurrency(Math.max(0, grandTotal - walletApplied))}</span>
              </label>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Confirm */}
        <Button className="w-full gap-2" size="lg" onClick={handleGoToPayment}>
          <CreditCard className="h-5 w-5" />
          Efetuar Pagamento
        </Button>
      </div>
    </div>
  );
}

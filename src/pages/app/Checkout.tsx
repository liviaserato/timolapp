import { useState } from "react";
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

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface CheckoutState {
  items: CartItem[];
  subtotal: number;
  coupon: string | null;
  couponDiscount: number;
  shippingCost: number | null;
  shippingLabel: string;
  pickupUnit: string | null;
  cep: string;
  grandTotal: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheckoutState | null;
  const isMobile = useIsMobile();

  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [editingAddress, setEditingAddress] = useState(false);

  // Mock wallet balance
  const walletBalance = 250.00;
  const [walletInput, setWalletInput] = useState("");
  const [walletApplied, setWalletApplied] = useState(0);
  const [walletError, setWalletError] = useState("");

  // Mock address from profile
  const [address, setAddress] = useState({
    street: "Rua das Palmeiras",
    number: "123",
    complement: "Apto 45",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    cep: state?.cep || "01001-000",
  });

  const [editAddress, setEditAddress] = useState({ ...address });

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

  const { items, subtotal, coupon, couponDiscount, shippingCost, shippingLabel, pickupUnit, grandTotal } = state;

  const isPickup = !!pickupUnit;

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

  const handleSaveAddress = () => {
    // Validate required fields
    const required = ["street", "number", "neighborhood", "city", "state", "cep"] as const;
    const hasEmpty = required.some((f) => !editAddress[f].trim());
    if (hasEmpty) {
      toast.error("Preencha todos os campos obrigatórios do endereço");
      return;
    }
    setAddress({ ...editAddress });
    setEditingAddress(false);
  };

  const handleGoToPayment = () => {
    navigate("/app/pedidos/pagamento", {
      state: {
        items,
        subtotal,
        coupon,
        couponDiscount,
        shippingCost,
        shippingLabel,
        pickupUnit,
        grandTotal,
        finalTotal,
        paymentMethod,
        pixDiscount,
        cep: address.cep,
      },
    });
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Itens do Pedido ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((item, idx) => {
              const selStr = Object.values(item.selections).filter(Boolean).join(" · ");
              return (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.qty}x {item.name}</p>
                    {selStr && <p className="text-[11px] text-muted-foreground">{selStr}</p>}
                  </div>
                  <span className="font-semibold text-foreground ml-3 whitespace-nowrap">
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Order totals */}
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal - couponDiscount)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Cupom ({coupon})</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}
            {shippingCost !== null && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Frete</span>
                <span>{shippingCost === 0 ? "Grátis" : formatCurrency(shippingCost)}</span>
              </div>
            )}
            {pixDiscount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Desconto PIX (5%)</span>
                <span>-{formatCurrency(pixDiscount)}</span>
              </div>
            )}
            {walletApplied > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Saldo carteira</span>
                <span>-{formatCurrency(walletApplied)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(finalTotal)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Wallet balance */}
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
              <form
                onSubmit={(e) => { e.preventDefault(); handleApplyWallet(); }}
                className="flex gap-1.5"
              >
                <Input
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value.replace(/[^0-9.,]/g, ""))}
                  placeholder="Quanto deseja usar?"
                  inputMode="decimal"
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
            )}
          </CardContent>
        </Card>

        {/* Address / Pickup */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                {isPickup ? (
                  <>
                    <MapPinned className="h-4 w-4" />
                    Endereço de Retirada
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4" />
                    Endereço de Entrega
                  </>
                )}
              </CardTitle>
              {!isPickup && !editingAddress && (
                <button onClick={() => { setEditAddress({ ...address }); setEditingAddress(true); }} className="text-primary hover:underline text-xs flex items-center gap-1">
                  <Edit2 className="h-3 w-3" /> Alterar
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isPickup ? (
              <div className="text-sm text-foreground space-y-1.5">
                <p className="font-medium flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-primary" />
                  {pickupUnit}
                </p>
                <p className="text-xs text-muted-foreground">
                  O endereço completo da unidade será disponibilizado após a aprovação do pedido.
                </p>
              </div>
            ) : editingAddress ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={editAddress.street}
                    onChange={(e) => setEditAddress({ ...editAddress, street: e.target.value })}
                    placeholder="Rua *"
                    className="col-span-2 h-8 text-xs"
                  />
                  <Input
                    value={editAddress.number}
                    onChange={(e) => setEditAddress({ ...editAddress, number: e.target.value })}
                    placeholder="Nº *"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={editAddress.complement}
                    onChange={(e) => setEditAddress({ ...editAddress, complement: e.target.value })}
                    placeholder="Complemento"
                    className="col-span-2 h-8 text-xs"
                  />
                  <Input
                    value={editAddress.neighborhood}
                    onChange={(e) => setEditAddress({ ...editAddress, neighborhood: e.target.value })}
                    placeholder="Bairro *"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={editAddress.city}
                    onChange={(e) => setEditAddress({ ...editAddress, city: e.target.value })}
                    placeholder="Cidade *"
                    className="col-span-2 h-8 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={editAddress.state}
                      onChange={(e) => setEditAddress({ ...editAddress, state: e.target.value })}
                      placeholder="UF *"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={editAddress.cep}
                      onChange={(e) => setEditAddress({ ...editAddress, cep: e.target.value })}
                      placeholder="CEP *"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="text-xs h-8" onClick={handleSaveAddress}>Salvar</Button>
                  <Button size="sm" variant="ghost" className="text-xs h-8" onClick={() => setEditingAddress(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-foreground space-y-0.5">
                <p>{address.street}, {address.number}{address.complement ? ` · ${address.complement}` : ""}</p>
                <p>{address.neighborhood} · {address.city} – {address.state}</p>
                <p>CEP {address.cep}</p>
                {shippingLabel && (
                  <p className="text-xs text-primary mt-5 flex items-center gap-1">
                    <Package className="h-3 w-3" /> {shippingLabel} · Prazo estimado: 5 a 10 dias úteis
                  </p>
                )}
              </div>
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
                <span className="text-sm font-bold text-primary">{formatCurrency(grandTotal * 0.95)}</span>
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
                <span className="text-sm font-bold text-foreground">{formatCurrency(grandTotal)}</span>
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
                <span className="text-sm font-bold text-foreground">{formatCurrency(grandTotal)}</span>
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

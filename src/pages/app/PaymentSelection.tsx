import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Receipt,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  Check,
  X,
  Loader2,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { CartItem } from "@/hooks/useCart";

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface PaymentSelectionState {
  items: CartItem[];
  subtotal: number;
  coupon: string | null;
  couponDiscount: number;
  shippingCost: number | null;
  shippingLabel: string;
  pickupUnit: string | null;
  grandTotal: number;
  cep: string;
}

type PayMethodId = "pix" | "boleto" | "credit" | "wallet";

interface AppliedMethod {
  id: PayMethodId;
  amount: number;
}

const WALLET_BALANCE = 250.0;

const METHODS: { id: PayMethodId; label: string; icon: React.ReactNode; helper: string }[] = [
  { id: "pix", label: "PIX", icon: <QrCode className="h-5 w-5" />, helper: "5% de desconto" },
  { id: "boleto", label: "Boleto Bancário", icon: <Building2 className="h-5 w-5" />, helper: "Vencimento em 3 dias" },
  { id: "credit", label: "Cartão de Crédito", icon: <CreditCard className="h-5 w-5" />, helper: "Até 12x sem juros" },
];

const WALLET_META = { id: "wallet" as PayMethodId, label: "Saldo em carteira", icon: <Wallet className="h-5 w-5" /> };

export default function PaymentSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PaymentSelectionState | null;

  const [multiMode, setMultiMode] = useState(false);
  const [singleMethod, setSingleMethod] = useState<PayMethodId | null>(null);
  const [applied, setApplied] = useState<AppliedMethod[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeMethod, setActiveMethod] = useState<PayMethodId | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [amountError, setAmountError] = useState("");
  const [loading, setLoading] = useState(false);

  // Wallet (independent — lives inside Resumo da compra)
  const [walletAmount, setWalletAmount] = useState(0);
  const [walletEditing, setWalletEditing] = useState(false);
  const [walletInput, setWalletInput] = useState("");
  const [walletError, setWalletError] = useState("");

  if (!state || !state.items?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-muted-foreground">Dados do pedido não encontrados.</p>
        <Button variant="outline" onClick={() => navigate("/app/pedidos/realizar")}>
          Voltar à loja
        </Button>
      </div>
    );
  }

  const { items, subtotal, couponDiscount, coupon, shippingCost, grandTotal } = state;
  const itemsCount = items.reduce((s, it) => s + (it.qty ?? 1), 0);

  // Wallet reduces the amount to pay via other methods
  const remainingAfterWallet = Math.max(0, grandTotal - walletAmount);
  const walletAvailable = WALLET_BALANCE - walletAmount;

  const totalApplied = applied.reduce((s, m) => s + m.amount, 0);
  const remaining = Math.max(0, remainingAfterWallet - totalApplied);
  const isFullyPaid = remaining < 0.01;

  // Mask R$
  const formatMoneyInput = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    const num = parseInt(digits, 10) / 100;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };
  const parseMoneyInput = (masked: string) => {
    const digits = masked.replace(/\D/g, "");
    if (!digits) return 0;
    return parseInt(digits, 10) / 100;
  };

  const availableMethods = useMemo(
    () => METHODS.filter((m) => !applied.some((a) => a.id === m.id)),
    [applied]
  );

  const openMethodPicker = () => {
    setPickerOpen(true);
    setActiveMethod(null);
    setAmountInput("");
    setAmountError("");
  };

  const handleSelectMethod = (id: PayMethodId) => {
    setActiveMethod(id);
    setAmountInput(formatMoneyInput(String(Math.round(remaining * 100))));
    setAmountError("");
  };

  const handleConfirmAmount = () => {
    if (!activeMethod) return;
    const value = parseMoneyInput(amountInput);
    if (value <= 0) {
      setAmountError("Informe um valor válido");
      return;
    }
    if (value > remaining + 0.001) {
      setAmountError("Valor maior que o restante do pedido");
      return;
    }
    setApplied((prev) => [...prev, { id: activeMethod, amount: value }]);
    setPickerOpen(false);
    setActiveMethod(null);
    setAmountInput("");
    setAmountError("");
  };

  const handleRemoveApplied = (id: PayMethodId) => {
    setApplied((prev) => prev.filter((m) => m.id !== id));
  };

  // Wallet handlers
  const openWalletEditor = () => {
    setWalletEditing(true);
    const def = walletAmount > 0 ? walletAmount : Math.min(grandTotal, WALLET_BALANCE);
    setWalletInput(formatMoneyInput(String(Math.round(def * 100))));
    setWalletError("");
  };
  const confirmWallet = () => {
    const value = parseMoneyInput(walletInput);
    if (value < 0) {
      setWalletError("Informe um valor válido");
      return;
    }
    if (value > WALLET_BALANCE + 0.001) {
      setWalletError("Valor maior que o saldo disponível");
      return;
    }
    if (value > grandTotal + 0.001) {
      setWalletError("Valor maior que o total do pedido");
      return;
    }
    setWalletAmount(value);
    setWalletEditing(false);
    setWalletError("");
  };
  const removeWallet = () => {
    setWalletAmount(0);
    setWalletEditing(false);
    setWalletError("");
  };

  // Effective payment: wallet always counted; rest comes from singleMethod (covers remainingAfterWallet) or multi-mode applied list
  const nonWalletNeeded = remainingAfterWallet;
  const effectiveNonWallet: AppliedMethod[] = multiMode
    ? applied
    : nonWalletNeeded < 0.01
      ? []
      : singleMethod
        ? [{ id: singleMethod, amount: nonWalletNeeded }]
        : [];
  const effectiveNonWalletTotal = effectiveNonWallet.reduce((s, m) => s + m.amount, 0);
  const effectiveFullyPaid = walletAmount + effectiveNonWalletTotal >= grandTotal - 0.01;
  const effectiveApplied: AppliedMethod[] =
    walletAmount > 0
      ? [{ id: "wallet", amount: walletAmount }, ...effectiveNonWallet]
      : effectiveNonWallet;
  const effectiveUsedWallet = walletAmount;

  const handleConfirmPayment = async () => {
    if (!effectiveFullyPaid) {
      toast.error(multiMode ? "Adicione formas de pagamento até cobrir o total" : "Selecione uma forma de pagamento");
      return;
    }
    setLoading(true);

    // If only wallet is used, treat as confirmed instantly (mock)
    const nonWallet = effectiveApplied.filter((m) => m.id !== "wallet");

    if (nonWallet.length === 0) {
      navigate("/app/pedidos/pagamento/processar", {
        state: {
          ...state,
          finalTotal: grandTotal,
          paymentMethod: "wallet",
          pixDiscount: 0,
          walletApplied: effectiveUsedWallet,
          appliedMethods: effectiveApplied,
        },
      });
      return;
    }

    const primary = nonWallet[0].id;
    const primaryAmount = nonWallet[0].amount;
    const pixDiscount = primary === "pix" ? primaryAmount * 0.05 : 0;
    const finalTotal = Math.max(0, grandTotal - pixDiscount);

    navigate("/app/pedidos/pagamento/processar", {
      state: {
        ...state,
        finalTotal,
        paymentMethod: primary,
        pixDiscount,
        walletApplied: effectiveUsedWallet,
        appliedMethods: effectiveApplied,
      },
    });
  };

  const methodLabel = (id: PayMethodId) => METHODS.find((m) => m.id === id)?.label ?? id;
  const methodIcon = (id: PayMethodId) => METHODS.find((m) => m.id === id)?.icon;

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="text-primary hover:text-primary/80 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Pagamento</h1>
            <p className="text-sm text-muted-foreground">Escolha como deseja pagar</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-stretch">
          {/* COLUNA ESQUERDA — Resumo da compra */}
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Resumo da compra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Produtos ({itemsCount})</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
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
              {coupon && couponDiscount > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    Cupom <span className="text-foreground font-medium">{coupon}</span>
                  </span>
                  <span className="text-green-600 font-medium">-{formatCurrency(couponDiscount)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-base font-semibold text-foreground">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              {/* Mini-card: Saldo em carteira */}
              <div className="pt-2">
                {!walletEditing ? (
                  <button
                    type="button"
                    onClick={openWalletEditor}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                      walletAmount > 0
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    <span className="text-primary">{WALLET_META.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{WALLET_META.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Disponível: <span className="font-semibold text-foreground">{formatCurrency(walletAvailable)}</span>
                      </p>
                    </div>
                    {walletAmount > 0 && (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          -{formatCurrency(walletAmount)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeWallet();
                          }}
                          aria-label="Remover saldo em carteira"
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </button>
                ) : (
                  <div className="relative space-y-2 rounded-lg border border-primary bg-primary/5 p-3">
                    <button
                      type="button"
                      onClick={() => {
                        setWalletEditing(false);
                        setWalletError("");
                      }}
                      aria-label="Fechar"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-2 text-sm pr-6">
                      <span className="text-primary">{WALLET_META.icon}</span>
                      <span className="font-medium text-foreground">{WALLET_META.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Disponível: <span className="font-semibold text-foreground">{formatCurrency(WALLET_BALANCE)}</span>
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        confirmWallet();
                      }}
                      className="flex gap-1.5"
                    >
                      <div className="relative flex-1">
                        <Input
                          value={walletInput}
                          onChange={(e) => {
                            setWalletInput(formatMoneyInput(e.target.value));
                            setWalletError("");
                          }}
                          placeholder="R$ 0,00"
                          inputMode="numeric"
                          className="h-8 text-xs pr-7"
                          autoFocus
                        />
                        {walletInput && (
                          <button
                            type="button"
                            onClick={() => {
                              setWalletInput("");
                              setWalletError("");
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
                        disabled={!walletInput.trim()}
                      >
                        Confirmar
                      </Button>
                    </form>
                    {walletError && (
                      <p className="text-[11px] text-destructive flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {walletError}
                      </p>
                    )}
                  </div>
                )}
                {walletAmount > 0 && remainingAfterWallet > 0 && !walletEditing && (
                  <div className="mt-3 flex justify-between items-baseline px-1">
                    <span className="text-sm font-semibold text-foreground">Valor restante</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(remainingAfterWallet)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* COLUNA DIREITA — Forma de pagamento + botão */}
          <div className="flex flex-col gap-4 h-full">
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Forma de pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {remainingAfterWallet < 0.01 ? (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-foreground flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Pedido totalmente coberto pelo saldo em carteira.
                  </div>
                ) : !multiMode ? (
                  <>
                    {/* Single-method: list all options exposed */}
                    <div className="space-y-2">
                      {METHODS.map((m) => {
                        const selected = singleMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSingleMethod(m.id)}
                            className={cn(
                              "w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                              selected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50 hover:bg-primary/5"
                            )}
                          >
                            <span className="text-primary">{m.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{m.label}</p>
                              <p className="text-[11px] text-muted-foreground">{m.helper}</p>
                            </div>
                            {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Discrete toggle for multi-method */}
                    <button
                      type="button"
                      onClick={() => {
                        setMultiMode(true);
                        setSingleMethod(null);
                      }}
                      className="w-full text-[11px] text-muted-foreground hover:text-primary underline-offset-2 hover:underline transition-colors pt-1"
                    >
                      Quero usar mais de uma forma de pagamento
                    </button>
                  </>
                ) : (
                  <>
                    {/* Multi-method mode */}
                    {applied.length > 0 && (
                      <div className="space-y-2">
                        {applied.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3"
                          >
                            <span className="text-primary">{methodIcon(m.id)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{methodLabel(m.id)}</p>
                              <p className="text-[11px] text-muted-foreground">{formatCurrency(m.amount)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveApplied(m.id)}
                              aria-label={`Remover ${methodLabel(m.id)}`}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isFullyPaid && (
                      <>
                        {!pickerOpen ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full text-xs h-9 text-muted-foreground border-dashed"
                            onClick={openMethodPicker}
                            disabled={availableMethods.length === 0}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {applied.length === 0 ? "Adicionar forma de pagamento" : "Adicionar outra forma de pagamento"}
                          </Button>
                        ) : (
                          <div className="space-y-2 rounded-lg border border-border p-3">
                            {!activeMethod ? (
                              <>
                                <p className="text-[11px] text-muted-foreground mb-1">Escolha uma forma de pagamento</p>
                                <div className="space-y-1.5">
                                  {availableMethods.map((m) => (
                                    <button
                                      key={m.id}
                                      type="button"
                                      onClick={() => handleSelectMethod(m.id)}
                                      className="w-full flex items-center gap-3 rounded border border-border p-2.5 text-left hover:border-primary/50 hover:bg-primary/5 transition-colors"
                                    >
                                      <span className="text-primary">{m.icon}</span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{m.label}</p>
                                        <p className="text-[11px] text-muted-foreground">{m.helper}</p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                                <div className="pt-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs h-7"
                                    onClick={() => setPickerOpen(false)}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-primary">{methodIcon(activeMethod)}</span>
                                  <span className="font-medium text-foreground">{methodLabel(activeMethod)}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                  Restante a pagar: <span className="font-semibold text-foreground">{formatCurrency(remaining)}</span>
                                </p>
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    handleConfirmAmount();
                                  }}
                                  className="flex gap-1.5"
                                >
                                  <div className="relative flex-1">
                                    <Input
                                      value={amountInput}
                                      onChange={(e) => {
                                        setAmountInput(formatMoneyInput(e.target.value));
                                        setAmountError("");
                                      }}
                                      placeholder="R$ 0,00"
                                      inputMode="numeric"
                                      className="h-8 text-xs pr-7"
                                      autoFocus
                                    />
                                    {amountInput && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAmountInput("");
                                          setAmountError("");
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
                                    disabled={!amountInput.trim()}
                                  >
                                    Confirmar
                                  </Button>
                                </form>
                                {amountError && (
                                  <p className="text-[11px] text-destructive flex items-center gap-1">
                                    <X className="h-3 w-3" />
                                    {amountError}
                                  </p>
                                )}
                                <div className="pt-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs h-7"
                                    onClick={() => {
                                      setActiveMethod(null);
                                      setAmountInput("");
                                      setAmountError("");
                                    }}
                                  >
                                    Voltar
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Status */}
                    <div className="text-[11px] text-muted-foreground border-t border-border pt-2 flex justify-between">
                      <span>Restante</span>
                      <span className={cn("font-semibold", isFullyPaid ? "text-green-600" : "text-foreground")}>
                        {isFullyPaid ? (
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Total coberto
                          </span>
                        ) : (
                          formatCurrency(remaining)
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMultiMode(false);
                        setApplied([]);
                        setPickerOpen(false);
                        setActiveMethod(null);
                      }}
                      className="w-full text-[11px] text-muted-foreground hover:text-primary underline-offset-2 hover:underline transition-colors pt-1"
                    >
                      Usar uma única forma de pagamento
                    </button>
                  </>
                )}
              </CardContent>
            </Card>

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleConfirmPayment}
              disabled={!effectiveFullyPaid || loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
              {loading ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

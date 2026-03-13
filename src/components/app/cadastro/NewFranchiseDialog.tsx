import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield, TrendingUp, Crown, Gem, Check,
  QrCode, CreditCard, Eye, EyeOff, Copy, ChevronLeft, Building2,
  Plus, AlertTriangle, X, Loader2, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { FullScreenTimolLoader } from "@/components/ui/full-screen-timol-loader";
import { openWhatsAppLink } from "@/lib/whatsapp";
import { validateCoupon, type DiscountPreview } from "@/lib/api/coupons";
import { useFranchise } from "@/contexts/FranchiseContext";
import { ContractScreen } from "@/components/screens/ContractScreen";

import timolLogo from "@/assets/favicon-timol-azul-escuro.svg";
import franquiaBronze from "@/assets/franquia-bronze.svg";
import franquiaPrata from "@/assets/franquia-prata.svg";
import franquiaOuro from "@/assets/franquia-ouro.svg";
import franquiaPlatina from "@/assets/franquia-platina.svg";
import comboMegaImg from "@/assets/produto-combo-mega.png";
import comboMiniImg from "@/assets/produto-combo-mini.png";
import visaIcon from "@/assets/credit-card-visa.svg";
import masterIcon from "@/assets/credit-card-master.svg";
import amexIcon from "@/assets/credit-card-amex.svg";
import eloIcon from "@/assets/credit-card-elo.svg";
import dinersIcon from "@/assets/credit-card-diners.svg";
import discoverIcon from "@/assets/credit-card-discover.svg";
import whatsappIcon from "@/assets/icon-logo-whatsapp.svg";

/* ── Franchise data ── */

interface FranchisePlan {
  id: string;
  name: string;
  icon: typeof Shield;
  image: string;
  binaryBonus: string;
  benefits: string[];
  products: { name: string; image: string }[];
  highlight: string;
  installmentPrice: number;
  installments: number;
}

const franchisePlans: FranchisePlan[] = [
  {
    id: "bronze", name: "Bronze", icon: Shield, image: franquiaBronze,
    binaryBonus: "8%", installmentPrice: 160, installments: 12,
    benefits: [
      "Entrada ideal para começar com baixo risco",
      "Bônus Binário de 8%",
      "Acesso ao escritório digital e treinamentos",
      "Permissão para vender como consultor",
    ],
    products: [{ name: "Combo Mega", image: comboMegaImg }],
    highlight: "Comece com segurança e valide o modelo na prática.",
  },
  {
    id: "silver", name: "Prata", icon: TrendingUp, image: franquiaPrata,
    binaryBonus: "16%", installmentPrice: 260, installments: 12,
    benefits: [
      "Tudo do Bronze + mais crescimento",
      "Bônus Binário de 16%",
      "Qualificação como distribuidor e líder",
      "Descontos maiores em produtos",
    ],
    products: [{ name: "Combo Mega", image: comboMegaImg }],
    highlight: "Saia do teste e comece a ganhar escala.",
  },
  {
    id: "gold", name: "Ouro", icon: Crown, image: franquiaOuro,
    binaryBonus: "24%", installmentPrice: 380, installments: 12,
    benefits: [
      "Tudo do Prata",
      "Bônus Binário de 24%",
      "Qualificações Rubi e Esmeralda",
      "Premiações e viagens",
    ],
    products: [{ name: "Combo Mega", image: comboMegaImg }, { name: "Combo Mini", image: comboMiniImg }],
    highlight: "O ponto onde o jogo realmente começa.",
  },
  {
    id: "platinum", name: "Platina", icon: Gem, image: franquiaPlatina,
    binaryBonus: "32% a 60%", installmentPrice: 675, installments: 12,
    benefits: [
      "Tudo do Ouro",
      "Bônus Binário de 32% a 60%",
      "Único nível que permite chegar a Diamante",
      "Maior potencial de ganhos recorrentes",
    ],
    products: [{ name: "Combo Mega", image: comboMegaImg }, { name: "Combo Mini", image: comboMiniImg }],
    highlight: "Jogue no nível máximo do plano.",
  },
];

const planLabels: Record<string, string> = { bronze: "Bronze", silver: "Prata", gold: "Ouro", platinum: "Platina" };

/* ── Payment helpers ── */

const PIX_DISCOUNT = 0.05;
const STRIPE_PUBLISHABLE_KEY = "pk_live_51RlasdFteIQdimMI2ZGm9VfZ7KDmY1jUJxTqe0IdTaigPV0S6L97Yj0TGySaEzZ7De96cCS2qVNayXybUogpnFlz00VeYyJ5ZR";
const PIX_CODE = "00020126580014BR.GOV.BCB.PIX0136timol-pix-key@timol.com.br5204000053039865802BR5913TIMOL SISTEMA6009SAO PAULO62070503***6304ABCD";

function detectCardBrand(number: string): string {
  const clean = number.replace(/\s/g, "");
  if (/^4/.test(clean)) return "visa";
  if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return "mastercard";
  if (/^3[47]/.test(clean)) return "amex";
  if (/^(4011|4312|4389|4514|4573|5041|5067|5090|6277|6362|6363|650|6516|6550)/.test(clean)) return "elo";
  if (/^(36|38|30[0-5])/.test(clean)) return "diners";
  if (/^6011|^65|^644|^645|^646|^647|^648|^649/.test(clean)) return "discover";
  return "";
}

const brandIcon: Record<string, string> = {
  visa: visaIcon, mastercard: masterIcon, amex: amexIcon,
  elo: eloIcon, diners: dinersIcon, discover: discoverIcon,
};

function getInstallmentOptions(price: number) {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => ({
    n, value: price / n, hasInterest: false,
  }));
}

const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
};

function splitPrice(price: number, locale: string): { integer: string; decimal: string } {
  const formatted = price.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sep = locale === "en-US" ? "." : ",";
  const idx = formatted.lastIndexOf(sep);
  if (idx === -1) return { integer: formatted, decimal: "00" };
  return { integer: formatted.slice(0, idx), decimal: formatted.slice(idx + 1) };
}

function ConfirmRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center border-b border-border/40 py-1 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

/* ── Mock coupon validation for TESTE ── */

const MOCK_COUPONS: Record<string, number> = {
  TESTE: 10,
};

/* ── Props ── */

interface SponsorOption {
  franchiseId: string;
  planCode: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userFranchises: SponsorOption[];
  isBrazilian?: boolean;
  userName?: string;
  userEmail?: string;
}

type Step = "intro" | "select" | "summary" | "payment" | "confirmation";
type PaymentMethod = "pix" | "credit-card";

// Mock Banco Timol balance — will come from API later
const MOCK_BANCO_BALANCE = 450.0;

export function NewFranchiseDialog({
  open, onOpenChange, userFranchises,
  isBrazilian = true, userName = "", userEmail = "",
}: Props) {
  const { addProfile } = useFranchise();

  const [step, setStep] = useState<Step>("intro");
  const [sponsorId, setSponsorId] = useState<string>(userFranchises[0]?.franchiseId ?? "");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Summary step state
  const [contractAccepted, setContractAccepted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState<DiscountPreview | null>(null);
  const [couponError, setCouponError] = useState("");
  const [balanceToUse, setBalanceToUse] = useState("");
  const bancoBalance = MOCK_BANCO_BALANCE;
  const [isContractOpen, setIsContractOpen] = useState(false);

  // Payment step state
  const [method, setMethod] = useState<PaymentMethod>(isBrazilian ? "pix" : "credit-card");
  const [installments, setInstallments] = useState("1");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pixCopied, setPixCopied] = useState(false);
  const [showInPersonPopup, setShowInPersonPopup] = useState(false);
  const [generatedFranchiseId, setGeneratedFranchiseId] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<{
    method: string; cardLast4?: string; installments?: number; amount: number; balanceUsed?: number;
  } | null>(null);

  const selectedFranchise = franchisePlans.find((f) => f.id === selectedPlan);
  const price = selectedFranchise ? selectedFranchise.installmentPrice * selectedFranchise.installments : 0;

  // Compute effective price after coupon and balance
  const couponAmount = couponDiscount?.discountAmount ?? 0;
  const parsedBalance = Math.min(Math.max(parseFloat(balanceToUse.replace(",", ".")) || 0, 0), bancoBalance, Math.max(price - couponAmount, 0));
  const priceAfterDeductions = Math.max(price - couponAmount - parsedBalance, 0);
  const isPixDiscount = method === "pix" && priceAfterDeductions > 0;
  const discountedPrice = isPixDiscount ? priceAfterDeductions * (1 - PIX_DISCOUNT) : priceAfterDeductions;
  const formatPrice = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const brand = detectCardBrand(cardNumber);
  const installmentOptions = getInstallmentOptions(priceAfterDeductions > 0 ? priceAfterDeductions : price);
  const hasMultipleIds = userFranchises.length > 1;

  const handleClose = (v: boolean) => {
    if (!v) {
      setStep("intro");
      setSponsorId(userFranchises[0]?.franchiseId ?? "");
      setSelectedPlan(null);
      setMethod(isBrazilian ? "pix" : "credit-card");
      setCardNumber(""); setCardName(""); setCardExpiry(""); setCardCvv("");
      setErrors({}); setPaymentResult(null); setGeneratedFranchiseId(null);
      setContractAccepted(false); setCouponCode(""); setCouponDiscount(null); setCouponError("");
      setBalanceToUse(""); setIsContractOpen(false);
    }
    onOpenChange(v);
  };

  const handleConfirmIntro = () => setStep("select");

  const handleContinueToSummary = () => {
    if (!selectedPlan) return;
    setStep("summary");
  };

  const handleContinueToPayment = () => {
    if (!contractAccepted) return;
    // If price is fully covered by balance/coupon, skip payment
    if (priceAfterDeductions <= 0) {
      handleFinalizeWithBalance();
      return;
    }
    setStep("payment");
  };

  const handleFinalizeWithBalance = async () => {
    setLoading(true);
    try {
      // TODO: Call API to create franchise with balance-only payment
      const mockNewId = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedFranchiseId(mockNewId);
      addProfile({
        franchiseId: mockNewId,
        name: `${userName} - ID ${mockNewId}`,
        planCode: selectedPlan ?? undefined,
      });
      setPaymentResult({
        method: "saldo",
        amount: 0,
        balanceUsed: parsedBalance + couponAmount,
      });
      setStep("confirmation");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim() || !selectedPlan) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponDiscount(null);

    const code = couponCode.trim().toUpperCase();

    // Check mock coupons first
    if (MOCK_COUPONS[code] !== undefined) {
      const discountAmount = MOCK_COUPONS[code];
      setCouponDiscount({
        discountType: "fixed",
        value: discountAmount,
        discountAmount,
        finalAmount: price - discountAmount,
        currencyCode: "BRL",
      });
      setCouponLoading(false);
      return;
    }

    try {
      const res = await validateCoupon({
        couponCode: code,
        scope: "franchisePurchase",
        franchiseTypeCode: selectedPlan,
        amount: price,
        currencyCode: "BRL",
      });
      if (res.isValid && res.discountPreview) {
        setCouponDiscount(res.discountPreview);
      } else {
        setCouponError(res.reasonCode === "expired" ? "Cupom expirado" : res.reasonCode === "not_found" ? "Cupom não encontrado" : "Cupom inválido");
      }
    } catch {
      setCouponError("Erro ao validar cupom");
    } finally {
      setCouponLoading(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (method === "credit-card") {
      if (cardNumber.replace(/\s/g, "").length < 16) e.cardNumber = "Número do cartão inválido";
      if (!cardName.trim()) e.cardName = "Informe o titular";
      if (cardExpiry.length < 5) {
        e.cardExpiry = "Validade inválida";
      } else {
        const [mm, yy] = cardExpiry.split("/").map(Number);
        const now = new Date();
        if (yy < now.getFullYear() % 100 || (yy === now.getFullYear() % 100 && mm < now.getMonth() + 1)) {
          e.cardExpiry = "Cartão vencido";
        }
      }
      if (cardCvv.length < 3) e.cardCvv = "CVV inválido";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePayment = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      if (method === "credit-card") {
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
          "create-checkout",
          {
            body: {
              price: priceAfterDeductions,
              currency: "brl",
              customerEmail: userEmail,
              franchiseTypeCode: selectedPlan,
              sponsorFranchiseId: sponsorId,
              installments: parseInt(installments),
              customerName: userName,
              isNewFranchise: true,
              balanceUsed: parsedBalance,
              couponCode: couponDiscount ? couponCode : undefined,
            },
          }
        );

        if (checkoutError || !checkoutData?.clientSecret) {
          setErrors({ general: "Erro ao processar pagamento. Tente novamente." });
          setLoading(false);
          return;
        }

        const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
        if (!stripe) {
          setErrors({ general: "Erro ao carregar gateway de pagamento." });
          setLoading(false);
          return;
        }

        const [expMonth, expYear] = cardExpiry.split("/").map(Number);
        const cardNumberClean = cardNumber.replace(/\s/g, "");

        const { error: stripeError } = await stripe.confirmCardPayment(
          checkoutData.clientSecret,
          {
            payment_method: {
              card: {
                number: cardNumberClean,
                exp_month: expMonth,
                exp_year: 2000 + expYear,
                cvc: cardCvv,
              } as any,
              billing_details: { name: cardName, email: userEmail },
            },
          }
        );

        setLoading(false);

        if (stripeError) {
          setErrors({ general: stripeError.message || "Erro no pagamento." });
          return;
        }

        const mockNewId = String(Math.floor(100000 + Math.random() * 900000));
        setGeneratedFranchiseId(mockNewId);
        addProfile({
          franchiseId: mockNewId,
          name: `${userName} - ID ${mockNewId}`,
          planCode: selectedPlan ?? undefined,
        });

        setPaymentResult({
          method: "credit-card",
          cardLast4: cardNumberClean.slice(-4),
          installments: parseInt(installments),
          amount: priceAfterDeductions,
          balanceUsed: parsedBalance > 0 ? parsedBalance : undefined,
        });
        setStep("confirmation");
      } else {
        // PIX
        setLoading(false);
        const mockNewId = String(Math.floor(100000 + Math.random() * 900000));
        setGeneratedFranchiseId(mockNewId);
        addProfile({
          franchiseId: mockNewId,
          name: `${userName} - ID ${mockNewId}`,
          planCode: selectedPlan ?? undefined,
        });
        setPaymentResult({
          method: "pix",
          amount: discountedPrice,
          balanceUsed: parsedBalance > 0 ? parsedBalance : undefined,
        });
        setStep("confirmation");
      }
    } catch {
      setErrors({ general: "Erro inesperado. Tente novamente." });
      setLoading(false);
    }
  };

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CODE);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    } catch {}
  };

  // Format balance input to always show ,00
  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d.,]/g, "").replace(",", ".");
    setBalanceToUse(val);
  };

  const handleBalanceBlur = () => {
    if (!balanceToUse) return;
    const num = parseFloat(balanceToUse.replace(",", "."));
    if (isNaN(num)) { setBalanceToUse(""); return; }
    setBalanceToUse(num.toFixed(2).replace(".", ","));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={cn(
          "max-h-[90vh] overflow-y-auto",
          step === "intro" ? "max-w-sm" : step === "select" ? "max-w-4xl" : "max-w-md"
        )}>
          {/* ── STEP 0: Intro ── */}
          {step === "intro" && (
            <>
              <DialogHeader className="text-center">
                <div className="mx-auto mb-2">
                  <img src={timolLogo} alt="Timol" className="h-10 w-10 mx-auto" />
                </div>
                <DialogTitle className="text-xl text-center">Adquirir Nova Franquia</DialogTitle>
                <DialogDescription className="text-center text-sm leading-relaxed mt-2">
                  Sabia que você pode ter mais de uma franquia Timol?
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-1">
                <div className="bg-primary/5 rounded-lg p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    Expandir sua rede com uma nova franquia é uma excelente estratégia para
                    <strong> multiplicar seus ganhos</strong>!
                  </p>
                </div>

                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <strong className="text-sm text-warning">Importante</strong>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    O patrocinador da nova franquia será<br />obrigatoriamente um de seus IDs existentes.
                  </p>
                </div>

                {hasMultipleIds && (
                  <div className="space-y-2 text-center">
                    <Label className="text-sm font-medium">
                      Qual ID será o patrocinador da nova franquia?
                    </Label>
                    <Select value={sponsorId} onValueChange={setSponsorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ID patrocinador" />
                      </SelectTrigger>
                      <SelectContent>
                        {userFranchises.map((uf) => (
                          <SelectItem key={uf.franchiseId} value={uf.franchiseId}>
                            ID {uf.franchiseId} — {planLabels[uf.planCode] || uf.planCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!hasMultipleIds && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-md p-3">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>
                      Seu ID patrocinador será <strong className="text-foreground">ID {sponsorId}</strong> — {planLabels[userFranchises[0]?.planCode] || ""}
                    </span>
                  </div>
                )}

                <p className="text-sm text-center text-foreground font-medium pt-1">
                  Está pronto para adquirir sua nova franquia?
                </p>
              </div>

              <div className="flex gap-3 mt-3">
                <Button variant="outline" className="flex-1" onClick={() => handleClose(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleConfirmIntro}>
                  Confirmar
                </Button>
              </div>
            </>
          )}

          {/* ── STEP 1: Select Plan ── */}
          {step === "select" && (
            <>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep("intro")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Voltar"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <DialogTitle className="text-xl">Escolha sua Franquia</DialogTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1 pl-7">
                Patrocinador: <strong className="text-foreground">ID {sponsorId}</strong>. Selecione qual franquia faz mais sentido para você.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 mt-2">
                {franchisePlans.map((f) => {
                  const isSelected = selectedPlan === f.id;
                  const Icon = f.icon;
                  const total = f.installmentPrice * f.installments;
                  const cashPrice = total * 0.95;
                  const { integer, decimal } = splitPrice(f.installmentPrice, "pt-BR");
                  const cashFormatted = cashPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                  return (
                    <div
                      key={f.id}
                      className={cn(
                        "relative rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col w-full",
                        isSelected
                          ? "border-yellow-500 bg-[#FEFAD2] ring-2 ring-yellow-400 shadow-lg scale-[1.02]"
                          : "border-border bg-card hover:shadow-md hover:scale-[1.01]"
                      )}
                      onClick={() => setSelectedPlan(f.id)}
                    >
                      {isSelected && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                          <Badge className="bg-yellow-500 text-white border-0 text-xs px-3 py-1 shadow-md whitespace-nowrap cursor-default pointer-events-none hover:bg-yellow-500">
                            Selecionado
                          </Badge>
                        </div>
                      )}

                      <div className={cn(
                        "flex items-center justify-between px-4 pt-5 pb-3 rounded-t-[calc(0.5rem-2px)]",
                        isSelected ? "bg-[#FEFAD2]" : "bg-primary/5"
                      )}>
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className={cn(
                            "h-7 w-7 flex-shrink-0",
                            isSelected ? "text-yellow-800" : "text-primary/60"
                          )} />
                          <div className="flex flex-col min-w-0">
                            <span className={cn(
                              "text-xs font-medium uppercase tracking-wider leading-tight",
                              isSelected ? "text-yellow-800" : "text-primary/60"
                            )}>
                              Franquia
                            </span>
                            <h3 className={cn(
                              "text-xl font-extrabold leading-tight uppercase",
                              isSelected ? "text-yellow-900" : "text-foreground"
                            )}>{f.name}</h3>
                          </div>
                        </div>
                        <div className="flex flex-col items-end min-w-0 text-right">
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-[11px] text-muted-foreground font-medium">12x</span>
                            <span className="text-[11px] text-muted-foreground font-medium">R$</span>
                            <span className="text-3xl font-extrabold text-foreground leading-none tracking-tight">
                              {integer}
                            </span>
                            <span className="text-sm font-bold text-foreground -translate-y-2">
                              ,{decimal}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            à vista: R$ {cashFormatted}
                          </p>
                        </div>
                      </div>

                      <Separator className={isSelected ? "bg-yellow-500" : ""} />

                      <div className="px-4 pt-3 pb-2">
                        <div className="flex flex-col gap-2">
                          {f.benefits.map((b, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <Check className={cn(
                                "h-4 w-4 mt-0.5 flex-shrink-0",
                                isSelected ? "text-yellow-600" : "text-primary/60"
                              )} />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-auto">
                        <Separator className={cn("mx-4 w-auto", isSelected ? "bg-yellow-400/60" : "bg-border/40")} />
                      </div>
                      <div className="px-4 pt-3 pb-2">
                        <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">Produtos inclusos</p>
                        <div className="flex items-center gap-6">
                          {f.products.map((p, i) => {
                            const parts = p.name.split(" ");
                            return (
                              <div key={i} className="flex items-center gap-2">
                                <img src={p.image} alt={p.name} className="h-12 w-12 object-contain flex-shrink-0" />
                                <div className="flex flex-col leading-tight">
                                  <span className="text-xs font-medium text-muted-foreground">{parts[0]}</span>
                                  <span className="text-sm font-semibold text-foreground">{parts.slice(1).join(" ")}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-auto">
                        <Separator className={isSelected ? "bg-yellow-500" : ""} />
                        <div className={cn(
                          "px-4 py-3 rounded-b-[calc(0.5rem-2px)]",
                          isSelected ? "bg-[#FEFAD2]" : "bg-muted/20"
                        )}>
                          <p className={cn(
                            "text-sm font-semibold italic text-center",
                            isSelected ? "text-yellow-700" : "text-primary/70"
                          )}>
                            "{f.highlight}"
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white rounded-full p-0.5">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setStep("intro")}>Voltar</Button>
                <Button onClick={handleContinueToSummary} disabled={!selectedPlan}>
                  Continuar
                </Button>
              </div>
            </>
          )}

          {/* ── STEP 2: Summary ── */}
          {step === "summary" && selectedFranchise && (
            <>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setStep("select"); setContractAccepted(false); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Voltar"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <DialogTitle className="text-xl">Resumo da Compra</DialogTitle>
              </div>
              <p className="text-sm text-muted-foreground text-left mt-1 pl-7">
                Confira os detalhes antes de prosseguir.
              </p>

              <div className="space-y-4 mt-2">
                {/* Order details */}
                <div className="bg-primary/5 rounded-xl p-4 space-y-1.5 text-sm">
                  <ConfirmRow label="Patrocinador" value={`ID ${sponsorId}`} />
                  <ConfirmRow label="Franquia" value={selectedFranchise.name} />
                  <ConfirmRow
                    label="Valor"
                    value={
                      couponAmount > 0 ? (
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground relative">
                          <span className="relative inline-block">
                              {formatPrice(price)}
                              <span className="absolute left-0 right-0 top-1/2 h-[2px] bg-green-500 -rotate-6" />
                            </span>
                          </span>
                          <br />
                          <span className="font-bold">{formatPrice(price - couponAmount)}</span>
                        </div>
                      ) : (
                        <span className="font-bold">{formatPrice(price)}</span>
                      )
                    }
                  />
                </div>

                {/* Coupon */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Cupom de desconto</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite o cupom"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        if (couponDiscount) { setCouponDiscount(null); setCouponError(""); }
                      }}
                      className="flex-1"
                      disabled={!!couponDiscount}
                    />
                    {couponDiscount ? (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => { setCouponDiscount(null); setCouponCode(""); setCouponError(""); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={handleValidateCoupon}
                        disabled={!couponCode.trim() || couponLoading}
                      >
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
                      </Button>
                    )}
                  </div>
                  {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                  {couponDiscount && (
                    <p className="text-xs text-green-600 font-medium">
                      Desconto aplicado: {formatPrice(couponDiscount.discountAmount)}
                    </p>
                  )}
                </div>

                {/* Banco Timol balance */}
                {bancoBalance > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Usar saldo do Banco Timol</Label>
                      <span className="text-sm text-muted-foreground">Disponível {formatPrice(bancoBalance)}</span>
                    </div>
                    <div className="relative">
                      <Input
                        placeholder="0,00"
                        value={balanceToUse}
                        onChange={handleBalanceChange}
                        onBlur={handleBalanceBlur}
                        className="pr-9"
                      />
                      {balanceToUse && (
                        <button
                          type="button"
                          onClick={() => setBalanceToUse("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {parseFloat(balanceToUse.replace(",", ".")) > bancoBalance && (
                      <p className="text-xs text-destructive">Valor acima do saldo disponível</p>
                    )}
                  </div>
                )}

                {/* Total breakdown */}
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(price - couponAmount)}</span>
                  </div>
                  {parsedBalance > 0 && (
                    <>
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Saldo utilizado</span>
                        <span>({formatPrice(parsedBalance)})</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-base">
                        <span>Valor restante a pagar</span>
                        <span className="text-primary">{formatPrice(priceAfterDeductions)}</span>
                      </div>
                    </>
                  )}
                </div>
                {priceAfterDeductions <= 0 && (parsedBalance > 0 || couponAmount > 0) && (
                  <p className="text-xs text-green-600 text-center font-medium">
                    Compra coberta pelo saldo e/ou cupom!
                  </p>
                )}

                {/* Contract checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <Checkbox
                    id="contract-accept"
                    checked={contractAccepted}
                    onCheckedChange={(v) => setContractAccepted(v === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="contract-accept" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    Li e aceito o{" "}
                    <button
                      type="button"
                      className="text-primary underline underline-offset-2 hover:no-underline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsContractOpen(true);
                      }}
                    >
                      Contrato de Franquia
                    </button>{" "}
                    e os termos de uso da plataforma Timol.
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => { setStep("select"); setContractAccepted(false); }}>
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleContinueToPayment}
                  disabled={!contractAccepted}
                >
                  {priceAfterDeductions <= 0 ? "Finalizar" : "Ir para pagamento"}
                </Button>
              </div>
            </>
          )}

          {/* ── STEP 3: Payment ── */}
          {step === "payment" && selectedFranchise && (
            <>
              <div className="relative pt-1">
                <button
                  type="button"
                  onClick={() => setStep("summary")}
                  className="absolute left-0 top-1 z-10 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Voltar"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <DialogHeader className="text-center px-8">
                  <DialogTitle className="text-xl">Pagamento</DialogTitle>
                  <DialogDescription className="text-center">
                    Nova franquia {selectedFranchise.name} — Patrocinador: ID {sponsorId}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="text-center space-y-1 mt-2">
                <p className="text-sm font-medium text-foreground">
                  Franquia {selectedFranchise.name}
                </p>
                {parsedBalance > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Saldo aplicado: {formatPrice(parsedBalance)} · Restante:
                  </p>
                )}
                <p className="text-3xl font-extrabold text-foreground tracking-tight">
                  {formatPrice(discountedPrice)}
                </p>
                {isPixDiscount && priceAfterDeductions !== discountedPrice && (
                  <p className="text-sm line-through text-muted-foreground">{formatPrice(priceAfterDeductions)}</p>
                )}
              </div>

              {isBrazilian && (
                <div className="grid grid-cols-2 gap-3 mt-3" role="tablist">
                  <button
                    role="tab"
                    aria-selected={method === "pix"}
                    onClick={() => setMethod("pix")}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                      method === "pix" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
                    )}
                  >
                    <QrCode className="h-7 w-7" />
                    <span className="font-semibold text-sm">PIX</span>
                  </button>
                  <button
                    role="tab"
                    aria-selected={method === "credit-card"}
                    onClick={() => setMethod("credit-card")}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                      method === "credit-card" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
                    )}
                  >
                    <CreditCard className="h-7 w-7" />
                    <span className="font-semibold text-sm">Cartão</span>
                  </button>
                </div>
              )}

              {method === "pix" && isBrazilian && (
                <Card className="mt-3">
                  <CardContent className="pt-4 space-y-3 text-center">
                    <div className="mx-auto w-40 h-40 bg-muted rounded-xl flex items-center justify-center">
                      <QrCode className="h-24 w-24 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Escaneie o QR Code ou copie o código abaixo</p>
                    <div className="relative bg-muted rounded p-2 text-xs font-mono break-all select-all pr-10">
                      {PIX_CODE}
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="absolute right-2 top-2 p-1 rounded hover:bg-accent transition-colors"
                        title="Copiar"
                      >
                        {pixCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                      </button>
                    </div>
                    <p className="text-xs text-green-600 font-medium">O código expira em 30 minutos</p>
                    <button
                      type="button"
                      onClick={() => setShowInPersonPopup(true)}
                      className="mt-2 flex items-center gap-1.5 mx-auto text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      Pagar presencialmente no banco ou lotérica
                    </button>
                  </CardContent>
                </Card>
              )}

              {method === "credit-card" && (
                <Card className="mt-3">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Dados do cartão</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {errors.general && (
                      <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                        {errors.general}
                      </div>
                    )}

                    <div className="space-y-1">
                      <Label>Número do cartão</Label>
                      <div className="relative">
                        <Input
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCard(e.target.value))}
                          maxLength={19}
                          className="pr-28"
                        />
                        {brand && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                            <img src={brandIcon[brand]} alt={brand} className="h-5" />
                          </div>
                        )}
                      </div>
                      {errors.cardNumber && <p className="text-xs text-destructive">{errors.cardNumber}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label>Nome no cartão</Label>
                      <Input
                        placeholder="NOME COMO ESTÁ NO CARTÃO"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        maxLength={60}
                      />
                      {errors.cardName && <p className="text-xs text-destructive">{errors.cardName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Validade</Label>
                        <Input
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          maxLength={5}
                        />
                        {errors.cardExpiry && <p className="text-xs text-destructive">{errors.cardExpiry}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label>CVV</Label>
                        <div className="relative">
                          <Input
                            placeholder="000"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            maxLength={4}
                            type={showCvv ? "text" : "password"}
                            className="pr-9"
                          />
                          <button
                            type="button"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowCvv(!showCvv)}
                            tabIndex={-1}
                          >
                            {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.cardCvv && <p className="text-xs text-destructive">{errors.cardCvv}</p>}
                      </div>
                    </div>

                    {isBrazilian && (
                      <div className="space-y-1">
                        <Label>Parcelas</Label>
                        <Select value={installments} onValueChange={setInstallments}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {installmentOptions.map(({ n, value }) => (
                              <SelectItem key={n} value={String(n)}>
                                {n === 1
                                  ? `À vista — ${formatPrice(priceAfterDeductions)}`
                                  : `${n}× ${formatPrice(value)} (sem juros)`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="mt-4">
                <Button onClick={handlePayment} disabled={loading} className="w-full">
                  {method === "pix" ? "Confirmar PIX" : "Pagar"}
                </Button>
              </div>
            </>
          )}

          {/* ── STEP 4: Confirmation ── */}
          {step === "confirmation" && selectedFranchise && (paymentResult || priceAfterDeductions <= 0) && (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-primary">Nova franquia adquirida!</h2>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Sua nova franquia {selectedFranchise.name} foi criada com sucesso.
                {generatedFranchiseId && (
                  <>
                    {" "}Seu novo ID é <strong className="text-foreground">{generatedFranchiseId}</strong>.
                  </>
                )}
              </p>

              <div className="w-full bg-primary/5 rounded-xl p-4 space-y-2 text-sm text-left">
                {generatedFranchiseId && <ConfirmRow label="Novo ID" value={generatedFranchiseId} />}
                <ConfirmRow label="Franquia" value={selectedFranchise.name} />
                <ConfirmRow label="Patrocinador" value={`ID ${sponsorId}`} />
                <ConfirmRow label="Valor da franquia" value={formatPrice(price)} />
                {couponAmount > 0 && (
                  <ConfirmRow label="Desconto cupom" value={`-${formatPrice(couponAmount)}`} />
                )}
                {paymentResult?.balanceUsed && paymentResult.balanceUsed > 0 && (
                  <ConfirmRow label="Saldo Banco Timol" value={`-${formatPrice(paymentResult.balanceUsed)}`} />
                )}
                <Separator className="my-1" />
                {paymentResult?.method === "credit-card" && paymentResult.cardLast4 && (
                  <>
                    <ConfirmRow label="Cartão" value={`•••• ${paymentResult.cardLast4}`} />
                    <ConfirmRow label="Valor no cartão" value={formatPrice(paymentResult.amount)} />
                    {paymentResult.installments && paymentResult.installments > 1 && (
                      <ConfirmRow
                        label="Parcelas"
                        value={`${paymentResult.installments}× ${formatPrice(paymentResult.amount / paymentResult.installments)}`}
                      />
                    )}
                  </>
                )}
                {paymentResult?.method === "pix" && (
                  <ConfirmRow label="Pago via PIX" value={formatPrice(paymentResult.amount)} />
                )}
                {paymentResult?.method === "saldo" && (
                  <ConfirmRow label="Método" value="Saldo + Cupom" />
                )}
              </div>

              <div className="w-full bg-muted/50 rounded-lg border border-border/60 p-3 text-center">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sua nova franquia já está disponível! Acesse ela no <strong className="text-foreground">cabeçalho</strong>, 
                  clicando na <strong className="text-foreground">setinha de seleção de IDs</strong> abaixo do seu nome.
                </p>
              </div>

              <Button onClick={() => handleClose(false)} className="w-full max-w-[200px]">
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contract modal */}
      {isContractOpen && <ContractScreen mode="modal" onClose={() => setIsContractOpen(false)} />}

      {/* In-person payment dialog */}
      <Dialog open={showInPersonPopup} onOpenChange={setShowInPersonPopup}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Pagamento Presencial</DialogTitle>
            <DialogDescription className="text-sm">
              Para pagar presencialmente, entre em contato com nosso suporte via WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              const msg = `Olá, meu nome é ${userName}, estou adquirindo uma nova franquia ${selectedFranchise?.name ?? ""} (patrocinador ID ${sponsorId}), no valor de ${formatPrice(discountedPrice)}. Gostaria de pagar presencialmente no banco, como fazer?`;
              openWhatsAppLink(msg);
              setShowInPersonPopup(false);
            }}
            className="w-full gap-2"
          >
            <img src={whatsappIcon} alt="WhatsApp" className="h-4 w-4" />
            Falar com suporte
          </Button>
        </DialogContent>
      </Dialog>

      {loading && (
        <FullScreenTimolLoader
          title="Processando pagamento..."
          hint="Aguarde enquanto geramos sua nova franquia."
        />
      )}
    </>
  );
}

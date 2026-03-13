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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield, TrendingUp, Crown, Gem, Check, Rocket,
  QrCode, CreditCard, Eye, EyeOff, Copy, ChevronLeft, Building2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { FullScreenTimolLoader } from "@/components/ui/full-screen-timol-loader";
import { openWhatsAppLink } from "@/lib/whatsapp";

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

const planOrder = ["bronze", "silver", "gold", "platinum"];
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

/* ── Props ── */

interface UpgradeFranchiseOption {
  franchiseId: string;
  planCode: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentPlanCode: string;
  franchiseId: string;
  userFranchises?: UpgradeFranchiseOption[];
  isBrazilian?: boolean;
  userName?: string;
  userEmail?: string;
}

type Step = "intro" | "select" | "payment" | "confirmation";
type PaymentMethod = "pix" | "credit-card";

export function UpgradeDialog({
  open, onOpenChange, currentPlanCode, franchiseId,
  userFranchises = [],
  isBrazilian = true, userName = "", userEmail = "",
}: Props) {
  const [step, setStep] = useState<Step>("intro");
  const [upgradeTargetId, setUpgradeTargetId] = useState<string>(franchiseId);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
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
  const [paymentResult, setPaymentResult] = useState<{
    method: string; cardLast4?: string; installments?: number; amount: number;
  } | null>(null);

  // Determine the plan code for the selected upgrade target
  const targetFranchise = userFranchises.find((f) => f.franchiseId === upgradeTargetId);
  const effectivePlanCode = targetFranchise?.planCode ?? currentPlanCode;
  const currentPlanIdx = planOrder.indexOf(effectivePlanCode);
  const upgradeOptions = franchisePlans.filter((_, i) => i > currentPlanIdx);
  const selectedFranchise = franchisePlans.find((f) => f.id === selectedPlan);

  // Eligible franchises for upgrade (not platinum)
  const eligibleFranchises = userFranchises.filter((f) => f.planCode !== "platinum");
  const hasMultipleEligible = eligibleFranchises.length > 1;

  const price = selectedFranchise ? selectedFranchise.installmentPrice * selectedFranchise.installments : 0;
  const isPixDiscount = method === "pix";
  const discountedPrice = isPixDiscount ? price * (1 - PIX_DISCOUNT) : price;

  const formatPrice = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const brand = detectCardBrand(cardNumber);
  const installmentOptions = getInstallmentOptions(price);

  const handleClose = (v: boolean) => {
    if (!v) {
      setStep("intro");
      setUpgradeTargetId(franchiseId);
      setSelectedPlan(null);
      setMethod(isBrazilian ? "pix" : "credit-card");
      setCardNumber(""); setCardName(""); setCardExpiry(""); setCardCvv("");
      setErrors({}); setPaymentResult(null);
    }
    onOpenChange(v);
  };

  const handleConfirmIntro = () => {
    setSelectedPlan(null);
    setStep("select");
  };

  const handleContinueToPayment = () => {
    if (!selectedPlan) return;
    setStep("payment");
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
              price,
              currency: "brl",
              customerEmail: userEmail,
              franchiseTypeCode: selectedPlan,
              franchiseId: upgradeTargetId,
              installments: parseInt(installments),
              customerName: userName,
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

        setPaymentResult({
          method: "credit-card",
          cardLast4: cardNumberClean.slice(-4),
          installments: parseInt(installments),
          amount: price,
        });
        setStep("confirmation");
      } else {
        // PIX
        setLoading(false);
        setPaymentResult({ method: "pix", amount: discountedPrice });
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

  const isMaxPlan = effectivePlanCode === "platinum";

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
                <DialogTitle className="text-xl text-center">Upgrade de Franquia</DialogTitle>
                <DialogDescription className="text-center text-sm leading-relaxed mt-2">
                  Avance para o próximo nível e acelere seus resultados!
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-1">
                <div className="bg-primary/5 rounded-lg p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    Fazer o upgrade é uma <strong>ótima decisão</strong>! Com um plano superior, seus ganhos vão
                    <strong> acelerar significativamente</strong> — bônus maiores, qualificações mais altas e
                    acesso a premiações exclusivas. <Rocket className="inline h-4 w-4 text-primary -translate-y-px" />
                  </p>
                </div>

                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <strong className="text-sm text-warning">Importante</strong>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    O upgrade mantém seu ID atual e<br />substitui o plano por um superior.
                  </p>
                </div>

                {hasMultipleEligible && (
                  <div className="space-y-2 text-center">
                    <Label className="text-sm font-medium">
                      Qual ID vai receber o upgrade?
                    </Label>
                    <Select value={upgradeTargetId} onValueChange={setUpgradeTargetId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ID" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleFranchises.map((uf) => (
                          <SelectItem key={uf.franchiseId} value={uf.franchiseId}>
                            ID {uf.franchiseId} — {planLabels[uf.planCode] || uf.planCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!hasMultipleEligible && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-md p-3">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>
                      O upgrade será aplicado ao <strong className="text-foreground">ID {upgradeTargetId}</strong> — {planLabels[effectivePlanCode] || ""}
                    </span>
                  </div>
                )}

                <p className="text-sm text-center text-foreground font-medium pt-1">
                  Está pronto para acelerar seus ganhos?
                </p>
              </div>

              <div className="flex gap-3 mt-3">
                <Button variant="outline" className="flex-1" onClick={() => handleClose(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleConfirmIntro} disabled={isMaxPlan}>
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
              <p className="text-sm text-muted-foreground mt-1">
                ID {upgradeTargetId} — Atualmente: <strong className="text-foreground">{planLabels[effectivePlanCode]}</strong>. Selecione o plano superior.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
                {upgradeOptions.map((f) => {
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
                <Button onClick={handleContinueToPayment} disabled={!selectedPlan}>
                  Continuar
                </Button>
              </div>
            </>
          )}

          {/* ── STEP 2: Payment ── */}
          {step === "payment" && selectedFranchise && (
            <>
              <div className="relative pt-1">
                <button
                  type="button"
                  onClick={() => setStep("select")}
                  className="absolute left-0 top-1 z-10 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Voltar"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <DialogHeader className="text-center px-8">
                  <DialogTitle className="text-xl">Pagamento do Upgrade</DialogTitle>
                  <DialogDescription className="text-center">
                    Upgrade para {selectedFranchise.name} — ID {upgradeTargetId}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="text-center space-y-1 mt-2">
                <p className="text-sm font-medium text-foreground">
                  Franquia {selectedFranchise.name}
                </p>
                <p className="text-3xl font-extrabold text-foreground tracking-tight">
                  {formatPrice(discountedPrice)}
                </p>
                {isPixDiscount && price !== discountedPrice && (
                  <p className="text-sm line-through text-muted-foreground">{formatPrice(price)}</p>
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
                                  ? `À vista — ${formatPrice(price)}`
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

          {/* ── STEP 3: Confirmation ── */}
          {step === "confirmation" && selectedFranchise && paymentResult && (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-primary">Upgrade realizado!</h2>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Seu upgrade para a franquia {selectedFranchise.name} foi processado com sucesso.
              </p>

              <div className="w-full bg-primary/5 rounded-xl p-4 space-y-2 text-sm text-left">
                <ConfirmRow label="ID" value={upgradeTargetId} />
                <ConfirmRow label="Nova franquia" value={selectedFranchise.name} />
                <ConfirmRow label="Valor" value={formatPrice(paymentResult.amount)} />
                {paymentResult.method === "credit-card" && paymentResult.cardLast4 && (
                  <>
                    <ConfirmRow label="Cartão" value={`•••• ${paymentResult.cardLast4}`} />
                    {paymentResult.installments && paymentResult.installments > 1 && (
                      <ConfirmRow
                        label="Parcelas"
                        value={`${paymentResult.installments}× ${formatPrice(paymentResult.amount / paymentResult.installments)}`}
                      />
                    )}
                  </>
                )}
                {paymentResult.method === "pix" && (
                  <ConfirmRow label="Método" value="PIX" />
                )}
              </div>

              <Button onClick={() => handleClose(false)} className="w-full max-w-[200px]">
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
              const msg = `Olá, meu nome é ${userName}, estou fazendo upgrade para a franquia ${selectedFranchise?.name ?? ""}, ID ${upgradeTargetId}, no valor de ${formatPrice(discountedPrice)} (com o desconto). Gostaria de pagar presencialmente no banco, como fazer?`;
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
          hint="Aguarde enquanto avançamos para a próxima etapa."
        />
      )}
    </>
  );
}

/* ── Helpers ── */

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

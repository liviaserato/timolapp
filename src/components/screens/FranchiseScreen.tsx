import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { WizardData } from "@/types/wizard";
import { Check, ChevronLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import bronzeImg from "@/assets/franquia-bronze.svg";
import prataImg from "@/assets/franquia-prata.svg";
import ouroImg from "@/assets/franquia-ouro.svg";
import platinaImg from "@/assets/franquia-platina.svg";

type Currency = "BRL" | "USD" | "EUR";
type Lang = "pt" | "en" | "es";

interface FranchiseOption {
  id: string;
  nameKey: string;
  installmentPrice: Record<Currency, number>;
  installments: number;
  image: string;
  subtitle: Record<Lang, string>;
  benefits: Record<Lang, string[]>;
  highlight: Record<Lang, string>;
  recommended?: boolean;
}

const franchiseOptions: FranchiseOption[] = [
  {
    id: "bronze",
    nameKey: "franchise.bronze",
    installmentPrice: { BRL: 160, USD: 32, EUR: 29 },
    installments: 12,
    image: bronzeImg,
    subtitle: {
      pt: "Comece com segurança",
      en: "Start with confidence",
      es: "Comienza con seguridad",
    },
    benefits: {
      pt: [
        "Acesso completo à plataforma e treinamentos Timol",
        "Permissão para atuar como consultor desde o início",
        "Combo Mega incluso (Sylo + Top H+)",
        "Entrada no sistema de expansão",
        "Bônus binário inicial (8%)",
      ],
      en: [
        "Full access to Timol platform and training",
        "Permission to act as consultant from day one",
        "Mega Combo included (Sylo + Top H+)",
        "Entry into the expansion system",
        "Initial binary bonus (8%)",
      ],
      es: [
        "Acceso completo a la plataforma y capacitaciones Timol",
        "Permiso para actuar como consultor desde el inicio",
        "Combo Mega incluido (Sylo + Top H+)",
        "Entrada al sistema de expansión",
        "Bono binario inicial (8%)",
      ],
    },
    highlight: {
      pt: "Comece com segurança e valide o modelo na prática.",
      en: "Start safely and validate the model in practice.",
      es: "Comienza con seguridad y valida el modelo en la práctica.",
    },
  },
  {
    id: "silver",
    nameKey: "franchise.silver",
    installmentPrice: { BRL: 260, USD: 52, EUR: 47 },
    installments: 12,
    image: prataImg,
    subtitle: {
      pt: "Comece a crescer",
      en: "Start growing",
      es: "Empieza a crecer",
    },
    benefits: {
      pt: [
        "Tudo do Bronze, com mais força de crescimento",
        "Combo Mega incluso",
        "Possibilidade de qualificar como distribuidor e líder",
        "Descontos maiores em produtos",
        "Estrutura mais forte para revenda",
        "Binário dobrado em relação ao Bronze (16%)",
      ],
      en: [
        "Everything in Bronze, with more growth power",
        "Mega Combo included",
        "Possibility to qualify as distributor and leader",
        "Greater product discounts",
        "Stronger resale structure",
        "Binary doubled vs Bronze (16%)",
      ],
      es: [
        "Todo del Bronce, con más fuerza de crecimiento",
        "Combo Mega incluido",
        "Posibilidad de calificar como distribuidor y líder",
        "Mayores descuentos en productos",
        "Estructura más fuerte para reventa",
        "Binario duplicado respecto al Bronce (16%)",
      ],
    },
    highlight: {
      pt: "Saia do teste e comece a ganhar escala.",
      en: "Move past testing and start scaling up.",
      es: "Sal de la prueba y empieza a ganar escala.",
    },
  },
  {
    id: "gold",
    nameKey: "franchise.gold",
    installmentPrice: { BRL: 380, USD: 76, EUR: 68 },
    installments: 12,
    image: ouroImg,
    recommended: true,
    subtitle: {
      pt: "Construa liderança",
      en: "Build leadership",
      es: "Construye liderazgo",
    },
    benefits: {
      pt: [
        "Tudo do Prata",
        "Combo Mega + Combo Mini inclusos",
        "Início das qualificações altas (Rubi e Esmeralda)",
        "Pontuação já gera premiações reais",
        "Possibilidade de viagens e incentivos",
        "Estrutura real de liderança",
        "Binário mais agressivo (24%)",
      ],
      en: [
        "Everything in Silver",
        "Mega Combo + Mini Combo included",
        "Start of high qualifications (Ruby & Emerald)",
        "Points already generate real rewards",
        "Possibility of trips and incentives",
        "Real leadership structure",
        "More aggressive binary (24%)",
      ],
      es: [
        "Todo del Plata",
        "Combo Mega + Combo Mini incluidos",
        "Inicio de las calificaciones altas (Rubí y Esmeralda)",
        "Puntuación que ya genera premiaciones reales",
        "Posibilidad de viajes e incentivos",
        "Estructura real de liderazgo",
        "Binario más agresivo (24%)",
      ],
    },
    highlight: {
      pt: "O ponto onde o jogo realmente começa.",
      en: "The point where the game really begins.",
      es: "El punto donde el juego realmente comienza.",
    },
  },
  {
    id: "platinum",
    nameKey: "franchise.platinum",
    installmentPrice: { BRL: 675, USD: 135, EUR: 121 },
    installments: 12,
    image: platinaImg,
    subtitle: {
      pt: "Alcance o topo",
      en: "Reach the top",
      es: "Alcanza la cima",
    },
    benefits: {
      pt: [
        "Tudo do Ouro",
        "Combo Mega + Mini inclusos",
        "Único nível que permite chegar a Diamante",
        "Acesso ao topo do plano (Diamante → Black → Estrelas)",
        "Limite máximo de premiações e pontuação",
        "Maior potencial de ganhos recorrentes",
        "Binário mais alto do plano (32% a 60%)",
      ],
      en: [
        "Everything in Gold",
        "Mega + Mini Combos included",
        "Only level that allows reaching Diamond",
        "Access to the top of the plan (Diamond → Black → Stars)",
        "Maximum reward and point limits",
        "Highest recurring earnings potential",
        "Highest binary in the plan (32% to 60%)",
      ],
      es: [
        "Todo del Oro",
        "Combo Mega + Mini incluidos",
        "Único nivel que permite llegar a Diamante",
        "Acceso a la cima del plan (Diamante → Black → Estrellas)",
        "Límite máximo de premiaciones y puntuación",
        "Mayor potencial de ganancias recurrentes",
        "Binario más alto del plan (32% a 60%)",
      ],
    },
    highlight: {
      pt: "Jogue no nível máximo do plano.",
      en: "Play at the plan's highest level.",
      es: "Juega al nivel máximo del plan.",
    },
  },
];

const currencySymbol: Record<Currency, string> = { BRL: "R$", USD: "US$", EUR: "€" };
const currencyLocale: Record<Currency, string> = { BRL: "pt-BR", USD: "en-US", EUR: "de-DE" };

function getCurrencyFromCountry(countryIso2?: string): Currency {
  if (!countryIso2) return "BRL";
  const euroCountries = ["AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES"];
  if (euroCountries.includes(countryIso2)) return "EUR";
  if (countryIso2 === "BR") return "BRL";
  return "USD";
}

const microcopy: Record<Lang, string> = {
  pt: "Todas as franquias dão acesso ao mesmo negócio. O que muda é a velocidade de crescimento, o nível de qualificação e o teto de ganhos.",
  en: "All franchises give access to the same business. What changes is the growth speed, qualification level, and earnings ceiling.",
  es: "Todas las franquicias dan acceso al mismo negocio. Lo que cambia es la velocidad de crecimiento, el nivel de calificación y el techo de ganancias.",
};

const cashDiscountText: Record<Lang, string> = {
  pt: "Pagamentos à vista têm 5% de desconto",
  en: "Cash payments get a 5% discount",
  es: "Pagos al contado tienen 5% de descuento",
};

interface Props {
  data: WizardData;
  onNext: (franchise: string, price: number) => void;
  onBack: () => void;
}

export const FranchiseScreen = ({ data, onNext, onBack }: Props) => {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<string | null>(data.franchise ?? null);

  const currency = getCurrencyFromCountry(data.countryIso2);
  const sym = currencySymbol[currency];
  const locale = currencyLocale[currency];
  const lang = language as Lang;

  const formatPrice = (price: number) =>
    price.toLocaleString(locale, { minimumFractionDigits: 2 });

  const handleConfirm = () => {
    if (!selected) return;
    const f = franchiseOptions.find((fr) => fr.id === selected)!;
    const totalPrice = f.installmentPrice[currency] * f.installments;
    onNext(f.id, totalPrice);
  };

  const odataId = data.userId ?? "—";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <img src="/favicon.svg" alt="Timol" className="h-10 w-10 mx-auto" />
        <p className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          {t("franchise.yourId")} {odataId}
        </p>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          {t("franchise.subtitle")}
        </h2>
        {/* Microcopy */}
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {microcopy[lang]}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {franchiseOptions.map((f) => {
          const isSelected = selected === f.id;
          return (
            <div
              key={f.id}
              className={cn(
                "relative rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col",
                isSelected
                  ? "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-400 shadow-lg scale-[1.02]"
                  : "border-border bg-card hover:shadow-md hover:scale-[1.01]"
              )}
              onClick={() => setSelected(f.id)}
            >
              {/* Recommended badge */}
              {f.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-yellow-500 text-white border-0 text-xs px-3 py-1 shadow-md whitespace-nowrap cursor-default pointer-events-none">
                    {t("franchise.bestChoice")}
                  </Badge>
                </div>
              )}

              {/* Header: icon left, name+subtitle+price right */}
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-t-[calc(0.5rem-2px)]",
                isSelected ? "bg-yellow-100/50" : "bg-muted/30"
              )}>
                <img src={f.image} alt={t(f.nameKey)} className="h-14 w-14 object-contain flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-primary">{t(f.nameKey)}</h3>
                  <p className="text-xs text-muted-foreground italic">{f.subtitle[lang]}</p>
                  <div className="flex flex-wrap items-baseline gap-x-1.5 mt-1">
                    <span className="text-[11px] text-muted-foreground">{f.installments}x</span>
                    <span className="text-xl font-bold text-foreground">
                      {sym} {formatPrice(f.installmentPrice[currency])}
                    </span>
                  </div>
                </div>
              </div>

              <Separator className={isSelected ? "bg-yellow-300/60" : ""} />

              {/* Benefits */}
              <div className="flex-1 flex flex-col px-4 py-3 gap-1.5">
                {f.benefits[lang].map((b, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Check className={cn(
                      "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
                      isSelected ? "text-yellow-600" : "text-primary/60"
                    )} />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* Highlight tagline */}
              <div className={cn(
                "px-4 pb-4 pt-1",
              )}>
                <p className={cn(
                  "text-xs font-semibold italic text-center",
                  isSelected ? "text-yellow-700" : "text-primary/70"
                )}>
                  "{f.highlight[lang]}"
                </p>
              </div>

              {/* Selected indicator */}
              {isSelected && !f.recommended && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white rounded-full p-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cash discount note */}
      <p className="text-center text-sm text-muted-foreground font-medium">
        💰 {cashDiscountText[lang]}
      </p>

      {/* Actions */}
      <div className="flex justify-between gap-3 max-w-md mx-auto">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("btn.back")}
        </Button>
        <Button onClick={handleConfirm} disabled={!selected} className="flex-1">
          {t("btn.next")}
        </Button>
      </div>
    </div>
  );
};

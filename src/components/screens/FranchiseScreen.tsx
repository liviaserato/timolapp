import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { WizardData } from "@/types/wizard";
import { Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import bronzeImg from "@/assets/franquia-bronze.svg";
import prataImg from "@/assets/franquia-prata.svg";
import ouroImg from "@/assets/franquia-ouro.svg";
import platinaImg from "@/assets/franquia-platina.svg";
import comboMegaImg from "@/assets/produto-combo-mega.png";
import comboMiniImg from "@/assets/produto-combo-mini.png";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

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
  products: Record<Lang, string[]>;
  productImages: string[];
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
        "Entrada ideal com baixo risco",
        "Bônus Binário de 8%",
        "Acesso ao escritório digital e plataforma de treinamentos exclusivos Timol",
        "Permissão para revender os produtos e atuar como <em>consultor</em> logo de início",
      ],
      en: [
        "Ideal entry with low risk",
        "Binary Bonus of 8%",
        "Access to digital office and exclusive Timol training platform",
        "Permission to resell products and act as a <em>consultant</em> from the start",
      ],
      es: [
        "Entrada ideal con bajo riesgo",
        "Bono Binario de 8%",
        "Acceso a la oficina digital y plataforma de capacitaciones exclusivas Timol",
        "Permiso para revender productos y actuar como <em>consultor</em> desde el inicio",
      ],
    },
    products: {
      pt: ["Combo Mega"],
      en: ["Combo Mega"],
      es: ["Combo Mega"],
    },
    productImages: [comboMegaImg],
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
        "Bônus Binário de 16%",
        "Possibilidade de qualificar como <em>distribuidor</em> e <em>líder</em>",
        "Descontos maiores em produtos selecionados",
        "Estrutura mais forte para revenda",
      ],
      en: [
        "Everything in Bronze, with more growth power",
        "Binary Bonus of 16%",
        "Possibility to qualify as <em>distributor</em> and <em>leader</em>",
        "Greater discounts on selected products",
        "Stronger resale structure",
      ],
      es: [
        "Todo del Bronce, con más fuerza de crecimiento",
        "Bono Binario de 16%",
        "Posibilidad de calificar como <em>distribuidor</em> y <em>líder</em>",
        "Mayores descuentos en productos seleccionados",
        "Estructura más fuerte para reventa",
      ],
    },
    products: {
      pt: ["Combo Mega"],
      en: ["Combo Mega"],
      es: ["Combo Mega"],
    },
    productImages: [comboMegaImg],
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
        "Bônus Binário de 24%",
        "Início das qualificações altas: <em>Rubi</em> e <em>Esmeralda</em>",
        "Pontuação que gera premiações incríveis",
        "Grandes chances de ganhar viagens e outros incentivos",
      ],
      en: [
        "Everything in Silver",
        "Binary Bonus of 24%",
        "Start of high qualifications: <em>Ruby</em> & <em>Emerald</em>",
        "Points that generate incredible rewards",
        "Great chances of winning trips and other incentives",
      ],
      es: [
        "Todo del Plata",
        "Bono Binario de 24%",
        "Inicio de las calificaciones altas: <em>Rubí</em> y <em>Esmeralda</em>",
        "Puntuación que genera premiaciones increíbles",
        "Grandes oportunidades de ganar viajes y otros incentivos",
      ],
    },
    products: {
      pt: ["Combo Mega", "Combo Mini"],
      en: ["Mega Combo", "Mini Combo"],
      es: ["Combo Mega", "Combo Mini"],
    },
    productImages: [comboMegaImg, comboMiniImg],
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
      pt: "Construa sua aposentadoria",
      en: "Build your retirement",
      es: "Construye tu jubilación",
    },
    benefits: {
      pt: [
        "Tudo do Ouro",
        "Bônus Binário de 32% a 60%",
        "Único nível que permite se tornar um <em>Diamante</em>",
        "Plano de Carreira (acumule estrelas → Black)",
        "Grandes prêmios o esperam",
        "Maior potencial de ganhos recorrentes",
      ],
      en: [
        "Everything in Gold",
        "Binary Bonus of 32% to 60%",
        "Only level that allows becoming a <em>Diamond</em>",
        "Career Plan (accumulate stars → Black)",
        "Great rewards await you",
        "Highest recurring earnings potential",
      ],
      es: [
        "Todo del Oro",
        "Bono Binario de 32% a 60%",
        "Único nivel que permite convertirse en <em>Diamante</em>",
        "Plan de Carrera (acumule estrellas → Black)",
        "Grandes premios lo esperan",
        "Mayor potencial de ganancias recurrentes",
      ],
    },
    products: {
      pt: ["Combo Mega", "Combo Mini"],
      en: ["Mega Combo", "Mini Combo"],
      es: ["Combo Mega", "Combo Mini"],
    },
    productImages: [comboMegaImg, comboMiniImg],
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

const sectionLabels: Record<Lang, { benefits: string; products: string }> = {
  pt: { benefits: "Benefícios", products: "Produtos inclusos" },
  en: { benefits: "Benefits", products: "Included products" },
  es: { benefits: "Beneficios", products: "Productos incluidos" },
};

const cashLabel: Record<Lang, string> = {
  pt: "à vista",
  en: "cash",
  es: "al contado",
};

interface Props {
  data: WizardData;
  onNext: (franchise: string, price: number) => void;
  onBack: () => void;
}

function splitPrice(price: number, locale: string): { integer: string; decimal: string } {
  const formatted = price.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sep = locale === "en-US" ? "." : ",";
  const idx = formatted.lastIndexOf(sep);
  if (idx === -1) return { integer: formatted, decimal: "00" };
  return { integer: formatted.slice(0, idx), decimal: formatted.slice(idx + 1) };
}

/** Style <em> tags as blue font-medium instead of italic */
function styleEmTags(html: string): string {
  return html
    .replace(/<em>/g, '<span class="text-primary font-medium not-italic">')
    .replace(/<\/em>/g, '</span>');
}

export const FranchiseScreen = ({ data, onNext, onBack }: Props) => {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<string | null>(data.franchise ?? null);

  const currency = getCurrencyFromCountry(data.countryIso2);
  const sym = currencySymbol[currency];
  const locale = currencyLocale[currency];
  const lang = language as Lang;

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
        <img src={timolLogoDark} alt="Timol" className="h-10 mx-auto" />
        <p className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          {t("franchise.yourId")} {odataId}
        </p>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          {t("franchise.subtitle")}
        </h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {franchiseOptions.map((f) => {
          const isSelected = selected === f.id;
          const { integer, decimal } = splitPrice(f.installmentPrice[currency], locale);
          const cashPrice = f.installmentPrice[currency] * f.installments * 0.95;
          const cashFormatted = cashPrice.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
              {/* Badge — only visible when selected */}
              {isSelected && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-yellow-500 text-white border-0 text-xs px-3 py-1 shadow-md whitespace-nowrap cursor-default pointer-events-none hover:bg-yellow-500">
                    {f.subtitle[lang]}
                  </Badge>
                </div>
              )}

              {/* Header: icon left, info right-aligned */}
              <div className="flex items-center justify-between px-4 pr-7 pt-5 pb-3 rounded-t-[calc(0.5rem-2px)]">
                <img src={f.image} alt={t(f.nameKey)} className="h-16 w-16 object-contain flex-shrink-0" />
                <div className="flex flex-col items-end min-w-0 text-right">
                  <h3 className="text-2xl font-extrabold text-foreground leading-tight">{t(f.nameKey)}</h3>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[11px] text-muted-foreground font-medium">{f.installments}x</span>
                    <span className="text-[11px] text-muted-foreground font-medium">{sym}</span>
                    <span className="text-3xl font-extrabold text-foreground leading-none tracking-tight">
                      {integer}
                    </span>
                    <span className="text-sm font-bold text-foreground -translate-y-2">
                      ,{decimal}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {cashLabel[lang]}: {sym} {cashFormatted}
                  </p>
                </div>
              </div>

              <Separator className={isSelected ? "bg-yellow-300/60" : ""} />

              {/* Benefits section */}
              <div className="px-4 pt-3 pb-2">
                <div className="flex flex-col gap-2">
                  {f.benefits[lang].map((b, i) => {
                    const isBinary = b.startsWith("Bônus") || b.startsWith("Binary") || b.startsWith("Bono");
                    const hasHtml = b.includes("<em>");
                    const cleanText = b.replace(/<\/?em>/g, "").replace(/<\/?strong>/g, "");
                    return (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className={cn(
                          "h-4 w-4 mt-0.5 flex-shrink-0",
                          isSelected ? "text-yellow-600" : "text-primary/60"
                        )} />
                        {hasHtml ? (
                          <span
                            className={cn(isBinary && "font-semibold text-foreground")}
                            dangerouslySetInnerHTML={{ __html: styleEmTags(b) }}
                          />
                        ) : (
                          <span className={cn(
                            isBinary && "font-semibold text-foreground",
                          )}>{cleanText}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Divider before products — aligns section across cards */}
              <div className="mt-auto">
                <Separator className={cn("mx-4 w-auto", isSelected ? "bg-yellow-300/40" : "bg-border/40")} />
              </div>

              {/* Products section */}
              <div className="px-4 pt-3 pb-2">
                <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">
                  {sectionLabels[lang].products}
                </p>
                <div className="flex flex-col gap-0">
                  {f.productImages.map((img, i) => (
                    <div key={i}>
                      {i > 0 && (
                        <div className="flex items-center gap-2 pl-1 py-0">
                          <span className="text-base font-bold text-muted-foreground leading-none ml-5">+</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 px-1 py-0.5">
                        <img src={img} alt={f.products[lang][i]} className="h-16 w-16 object-contain" />
                        <span className="text-sm font-medium text-foreground">{f.products[lang][i]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlight / impact phrase */}
              <div className="mt-auto">
                <Separator className={isSelected ? "bg-yellow-300/60" : ""} />
                <div className={cn(
                  "px-4 py-3 rounded-b-[calc(0.5rem-2px)]",
                  isSelected ? "bg-yellow-100/60" : "bg-muted/20"
                )}>
                  <p className={cn(
                    "text-sm font-semibold italic text-center",
                    isSelected ? "text-yellow-700" : "text-primary/70"
                  )}>
                    "{f.highlight[lang]}"
                  </p>
                </div>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white rounded-full p-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

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

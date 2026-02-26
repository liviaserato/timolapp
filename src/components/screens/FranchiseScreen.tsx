import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { WizardData } from "@/types/wizard";
import { Check, ChevronLeft, Shield, TrendingUp, Crown, Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import comboMegaImg from "@/assets/produto-combo-mega.png";
import comboMiniImg from "@/assets/produto-combo-mini.png";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

type Currency = "BRL" | "USD" | "EUR";
type Lang = "pt" | "en" | "es";

const franchiseIcons: Record<string, typeof Shield> = {
  bronze: Shield,
  silver: TrendingUp,
  gold: Crown,
  platinum: Gem,
};

const franchiseLabel: Record<Lang, string> = {
  pt: "Franquia",
  en: "Franchise",
  es: "Franquicia",
};

interface FranchiseOption {
  id: string;
  nameKey: string;
  installmentPrice: Record<Currency, number>;
  installments: number;
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
    subtitle: {
      pt: "Comece com segurança",
      en: "Start with confidence",
      es: "Comienza con seguridad",
    },
    benefits: {
      pt: [
        "Entrada ideal para começar com baixo risco",
        "Bônus Binário de 8%",
        "Acesso ao escritório digital e treinamentos exclusivos Timol",
        "Permissão para vender os produtos e atuar como <em>consultor</em> desde o início",
      ],
      en: [
        "Ideal entry to start with low risk",
        "Binary Bonus of 8%",
        "Access to digital office and exclusive Timol trainings",
        "Permission to sell products and act as a <em>consultant</em> from the start",
      ],
      es: [
        "Entrada ideal para comenzar con bajo riesgo",
        "Bono Binario de 8%",
        "Acceso a la oficina digital y capacitaciones exclusivas Timol",
        "Permiso para vender productos y actuar como <em>consultor</em> desde el inicio",
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
    subtitle: {
      pt: "Comece a crescer",
      en: "Start growing",
      es: "Empieza a crecer",
    },
    benefits: {
      pt: [
        "Tudo do Bronze, com mais potencial de crescimento",
        "Bônus Binário de 16%",
        "Possibilidade de se qualificar como <em>distribuidor</em> e <em>líder</em>",
        "Descontos maiores em produtos selecionados",
        "Estrutura mais forte para revenda",
      ],
      en: [
        "Everything in Bronze, with more growth potential",
        "Binary Bonus of 16%",
        "Possibility to qualify as <em>distributor</em> and <em>leader</em>",
        "Greater discounts on selected products",
        "Stronger resale structure",
      ],
      es: [
        "Todo del Bronce, con más potencial de crecimiento",
        "Bono Binario de 16%",
        "Posibilidad de calificarse como <em>distribuidor</em> y <em>líder</em>",
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
        "Pontuação que gera premiações relevantes",
        "Grandes chances de ganhar viagens e incentivos",
      ],
      en: [
        "Everything in Silver",
        "Binary Bonus of 24%",
        "Start of high qualifications: <em>Ruby</em> & <em>Emerald</em>",
        "Points that generate relevant rewards",
        "Great chances of winning trips and incentives",
      ],
      es: [
        "Todo del Plata",
        "Bono Binario de 24%",
        "Inicio de las calificaciones altas: <em>Rubí</em> y <em>Esmeralda</em>",
        "Puntuación que genera premiaciones relevantes",
        "Grandes oportunidades de ganar viajes e incentivos",
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
    subtitle: {
      pt: "Construa sua aposentadoria",
      en: "Build your retirement",
      es: "Construye tu jubilación",
    },
    benefits: {
      pt: [
        "Tudo do Ouro",
        "Bônus Binário de 32% a 60%",
        "Único nível que permite chegar a <em>Diamante</em>",
        "Plano de Carreira <em>Diamante</em>",
        "Premiações maiores e mais exclusivas",
        "Maior potencial de ganhos recorrentes",
      ],
      en: [
        "Everything in Gold",
        "Binary Bonus of 32% to 60%",
        "Only level that allows reaching <em>Diamond</em>",
        "Full <em>Diamond</em> Career Plan",
        "Bigger and more exclusive rewards",
        "Highest recurring earnings potential",
      ],
      es: [
        "Todo del Oro",
        "Bono Binario de 32% a 60%",
        "Único nivel que permite llegar a <em>Diamante</em>",
        "Plan de Carrera <em>Diamante</em>",
        "Premiaciones mayores y más exclusivas",
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 justify-items-center">
        {franchiseOptions.map((f) => {
          const isSelected = selected === f.id;
          const { integer, decimal } = splitPrice(f.installmentPrice[currency], locale);
          const cashPrice = f.installmentPrice[currency] * f.installments * 0.95;
          const cashFormatted = cashPrice.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          return (
            <div
              key={f.id}
              className={cn(
                "relative rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col w-full",
                isSelected
                   ? "border-yellow-500 bg-[#FEFAD2] ring-2 ring-yellow-400 shadow-lg scale-[1.02]"
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

              {/* Header: textual with light blue bg */}
              {(() => {
                const Icon = franchiseIcons[f.id] || Shield;
                return (
                  <div className={cn(
                    "flex items-center justify-between px-4 pt-5 pb-3 rounded-t-[calc(0.5rem-2px)]",
                    isSelected ? "bg-[#FEFAD2]" : "bg-primary/5"
                  )}>
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={cn(
                        "h-7 w-7 flex-shrink-0",
                        isSelected ? "text-yellow-800" : "text-primary/60"
                      )} />
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-xs font-medium uppercase tracking-wider leading-tight",
                          isSelected ? "text-yellow-800" : "text-primary/60"
                        )}>
                          {franchiseLabel[lang]}
                        </span>
                        <h3 className={cn(
                          "text-xl font-extrabold leading-tight uppercase",
                          isSelected ? "text-yellow-900" : "text-foreground"
                        )}>{t(f.nameKey)}</h3>
                      </div>
                    </div>
                    <div className="flex flex-col items-end min-w-0 text-right">
                      {currency === "BRL" ? (
                        <>
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
                        </>
                      ) : (
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[11px] text-muted-foreground font-medium">{sym}</span>
                          <span className="text-3xl font-extrabold text-foreground leading-none tracking-tight">
                            {splitPrice(f.installmentPrice[currency] * f.installments, locale).integer}
                          </span>
                          <span className="text-sm font-bold text-foreground -translate-y-2">
                            ,{splitPrice(f.installmentPrice[currency] * f.installments, locale).decimal}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <Separator className={isSelected ? "bg-yellow-500" : ""} />

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
                <Separator className={cn("mx-4 w-auto", isSelected ? "bg-yellow-400/60" : "bg-border/40")} />
              </div>

              {/* Products section */}
              <div className="px-4 pt-3 pb-2">
                <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">
                  {sectionLabels[lang].products}
                </p>
                <div className="flex items-center gap-6">
                  {f.productImages.map((img, i) => {
                    const name = f.products[lang][i] || "";
                    const parts = name.split(" ");
                    const line1 = parts[0] || "";
                    const line2 = parts.slice(1).join(" ") || "";
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <img src={img} alt={name} className="h-12 w-12 object-contain flex-shrink-0" />
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-medium text-muted-foreground">{line1}</span>
                          <span className="text-sm font-semibold text-foreground">{line2}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Highlight / impact phrase */}
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

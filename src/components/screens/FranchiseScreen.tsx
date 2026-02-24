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

type Currency = "BRL" | "USD" | "EUR";

interface FranchiseOption {
  id: string;
  nameKey: string;
  prices: Record<Currency, number>;
  image: string;
  benefits: { pt: string[]; en: string[]; es: string[] };
  recommended?: boolean;
}

const franchiseOptions: FranchiseOption[] = [
  {
    id: "bronze",
    nameKey: "franchise.bronze",
    prices: { BRL: 497, USD: 99, EUR: 89 },
    image: bronzeImg,
    benefits: {
      pt: ["Acesso à plataforma básica", "Suporte por e-mail", "Comissão de 15% nas vendas", "Materiais de divulgação digitais", "Treinamento introdutório online"],
      en: ["Access to basic platform", "Email support", "15% commission on sales", "Digital marketing materials", "Introductory online training"],
      es: ["Acceso a la plataforma básica", "Soporte por correo", "Comisión del 15% en ventas", "Materiales de difusión digitales", "Capacitación introductoria online"],
    },
  },
  {
    id: "silver",
    nameKey: "franchise.silver",
    prices: { BRL: 997, USD: 199, EUR: 179 },
    image: prataImg,
    benefits: {
      pt: ["Tudo do Bronze", "Suporte prioritário via WhatsApp", "Comissão de 20% nas vendas", "Materiais impressos + digitais", "Treinamento avançado + mentoria mensal", "Área exclusiva de produtos"],
      en: ["Everything in Bronze", "Priority WhatsApp support", "20% commission on sales", "Print + digital materials", "Advanced training + monthly mentoring", "Exclusive product area"],
      es: ["Todo de Bronce", "Soporte prioritario por WhatsApp", "Comisión del 20% en ventas", "Materiales impresos + digitales", "Capacitación avanzada + mentoría mensual", "Área exclusiva de productos"],
    },
  },
  {
    id: "gold",
    nameKey: "franchise.gold",
    prices: { BRL: 1997, USD: 399, EUR: 359 },
    image: ouroImg,
    recommended: true,
    benefits: {
      pt: ["Tudo do Prata", "Comissão de 25% nas vendas", "Gerente de contas dedicado", "Acesso a eventos exclusivos", "Loja virtual personalizada", "Bônus de liderança de equipe"],
      en: ["Everything in Silver", "25% commission on sales", "Dedicated account manager", "Access to exclusive events", "Custom online store", "Team leadership bonus"],
      es: ["Todo de Plata", "Comisión del 25% en ventas", "Gerente de cuenta dedicado", "Acceso a eventos exclusivos", "Tienda virtual personalizada", "Bono de liderazgo de equipo"],
    },
  },
  {
    id: "platinum",
    nameKey: "franchise.platinum",
    prices: { BRL: 3997, USD: 799, EUR: 719 },
    image: platinaImg,
    benefits: {
      pt: ["Tudo do Ouro", "Comissão de 30% nas vendas", "Participação nos resultados", "Acesso antecipado a novos produtos", "Suporte 24/7 exclusivo", "Convite para board de franqueados", "Viagem de incentivo anual"],
      en: ["Everything in Gold", "30% commission on sales", "Profit sharing", "Early access to new products", "24/7 exclusive support", "Franchisee board invitation", "Annual incentive trip"],
      es: ["Todo de Oro", "Comisión del 30% en ventas", "Participación en resultados", "Acceso anticipado a nuevos productos", "Soporte 24/7 exclusivo", "Invitación al board de franquiciados", "Viaje de incentivo anual"],
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

  const formatPrice = (price: number) =>
    price.toLocaleString(locale, { minimumFractionDigits: 0 });

  const handleConfirm = () => {
    if (!selected) return;
    const f = franchiseOptions.find((fr) => fr.id === selected)!;
    onNext(f.id, f.prices[currency]);
  };

  const firstName = data.fullName?.split(" ")[0] ?? "";
  const lang = language as "pt" | "en" | "es";
  const odataId = data.userId ?? "—";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <img src="/favicon.svg" alt="Timol" className="h-10 w-10 mx-auto" />
        <p className="text-xl sm:text-2xl font-bold text-primary">
          {t("franchise.yourId")} {odataId}
        </p>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          {t("franchise.subtitle")}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {franchiseOptions.map((f) => {
          const isSelected = selected === f.id;
          return (
            <div
              key={f.id}
              className={cn(
                "relative rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col",
                f.recommended ? "mt-4" : "",
                isSelected
                  ? "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-400 shadow-lg scale-[1.02]"
                  : "border-border bg-card hover:shadow-md hover:scale-[1.01]"
              )}
              onClick={() => setSelected(f.id)}
            >
              {/* Recommended badge — overlapping top border */}
              {f.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-yellow-500 text-white border-0 text-xs px-3 py-1 shadow-md whitespace-nowrap">
                    {t("franchise.bestChoice")}
                  </Badge>
                </div>
              )}

              {/* Header: icon left, name+price right */}
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-t-[calc(0.5rem-2px)]",
                isSelected ? "bg-yellow-100/50" : "bg-muted/30"
              )}>
                <img src={f.image} alt={t(f.nameKey)} className="h-14 w-14 object-contain flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-primary">{t(f.nameKey)}</h3>
                  <div className="flex flex-wrap items-baseline gap-x-1.5">
                    <span className="text-xl font-bold text-foreground">
                      {sym} {formatPrice(f.prices[currency])}
                    </span>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">{t("franchise.once")}</span>
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

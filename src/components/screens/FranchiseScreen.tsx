import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WizardData } from "@/types/wizard";
import { Check, ChevronLeft, Star, Crown, Shield, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

type Currency = "BRL" | "USD" | "EUR";

interface FranchiseOption {
  id: string;
  nameKey: string;
  prices: Record<Currency, number>;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  benefits: { pt: string[]; en: string[]; es: string[] };
  highlight?: boolean;
}

const franchiseOptions: FranchiseOption[] = [
  {
    id: "bronze",
    nameKey: "franchise.bronze",
    prices: { BRL: 497, USD: 99, EUR: 89 },
    icon: <Shield className="h-6 w-6" />,
    borderColor: "border-amber-700",
    bgColor: "bg-amber-50",
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
    icon: <Star className="h-6 w-6" />,
    borderColor: "border-slate-400",
    bgColor: "bg-slate-50",
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
    icon: <Crown className="h-6 w-6" />,
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-50",
    highlight: true,
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
    icon: <Gem className="h-6 w-6" />,
    borderColor: "border-purple-500",
    bgColor: "bg-purple-50",
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
  // Euro countries (simplified)
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <img src="/favicon.svg" alt="Timol" className="h-10 w-10 mx-auto" />
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          {t("franchise.title")}{firstName ? `, ${firstName}` : ""}!
        </h2>
        <p className="text-muted-foreground">{t("franchise.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {franchiseOptions.map((f) => {
          const isSelected = selected === f.id;
          return (
            <Card
              key={f.id}
              className={cn(
                "relative cursor-pointer transition-all duration-200 border-2 flex flex-col",
                f.borderColor,
                f.bgColor,
                isSelected
                  ? "ring-2 ring-primary shadow-lg scale-[1.02]"
                  : "hover:shadow-md hover:scale-[1.01]",
                f.highlight && !isSelected && "ring-1 ring-yellow-400"
              )}
              onClick={() => setSelected(f.id)}
            >
              {f.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-0.5 rounded-full">
                  {t("franchise.popular")}
                </div>
              )}
              <CardHeader className="pb-3 pt-5 flex-none">
                <div className="flex items-center gap-2">
                  <div className="text-primary">{f.icon}</div>
                  <CardTitle className="text-lg">{t(f.nameKey)}</CardTitle>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {sym} {formatPrice(f.prices[currency])}
                  <span className="text-sm font-normal text-muted-foreground ml-1">{t("franchise.once")}</span>
                </div>
              </CardHeader>

              {/* Benefits grow to fill card */}
              <div className="flex-1 px-6 space-y-2 pb-2">
                {f.benefits[lang].map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* Button always at the bottom */}
              <div className="px-6 pb-5 pt-3 flex-none">
                <Button
                  className={cn(
                    "w-full",
                    isSelected
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                      : ""
                  )}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setSelected(f.id); }}
                >
                  {isSelected ? t("franchise.selected") : t("franchise.select")}
                </Button>
              </div>
            </Card>
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

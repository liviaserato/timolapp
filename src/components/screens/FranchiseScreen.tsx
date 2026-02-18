import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WizardData } from "@/types/wizard";
import { Check, ChevronLeft, Star, Crown, Shield, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface Franchise {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  color: string;
  benefits: string[];
  highlight?: boolean;
}

const franchises: Franchise[] = [
  {
    id: "bronze",
    name: "Bronze",
    price: 497,
    icon: <Shield className="h-6 w-6" />,
    color: "border-amber-700 bg-amber-50",
    benefits: [
      "Acesso à plataforma básica",
      "Suporte por e-mail",
      "Comissão de 15% nas vendas",
      "Materiais de divulgação digitais",
      "Treinamento introdutório online",
    ],
  },
  {
    id: "silver",
    name: "Prata",
    price: 997,
    icon: <Star className="h-6 w-6" />,
    color: "border-slate-400 bg-slate-50",
    benefits: [
      "Tudo do Bronze",
      "Suporte prioritário via WhatsApp",
      "Comissão de 20% nas vendas",
      "Materiais impressos + digitais",
      "Treinamento avançado + mentoria mensal",
      "Área exclusiva de produtos",
    ],
  },
  {
    id: "gold",
    name: "Ouro",
    price: 1997,
    icon: <Crown className="h-6 w-6" />,
    color: "border-yellow-500 bg-yellow-50",
    highlight: true,
    benefits: [
      "Tudo do Prata",
      "Comissão de 25% nas vendas",
      "Gerente de contas dedicado",
      "Acesso a eventos exclusivos",
      "Loja virtual personalizada",
      "Bônus de liderança de equipe",
    ],
  },
  {
    id: "platinum",
    name: "Platina",
    price: 3997,
    icon: <Gem className="h-6 w-6" />,
    color: "border-purple-500 bg-purple-50",
    benefits: [
      "Tudo do Ouro",
      "Comissão de 30% nas vendas",
      "Participação nos resultados da empresa",
      "Acesso antecipado a novos produtos",
      "Suporte 24/7 com equipe exclusiva",
      "Convite para board de franqueados",
      "Viagem de incentivo anual",
    ],
  },
];

interface Props {
  data: WizardData;
  onNext: (franchise: string, price: number) => void;
  onBack: () => void;
}

export const FranchiseScreen = ({ data, onNext, onBack }: Props) => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string | null>(data.franchise ?? null);

  const handleConfirm = () => {
    if (!selected) return;
    const f = franchises.find((fr) => fr.id === selected)!;
    onNext(f.id, f.price);
  };

  const firstName = data.fullName?.split(" ")[0] ?? "";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          {t("franchise.title")}{firstName ? `, ${firstName}` : ""}!
        </h2>
        <p className="text-muted-foreground">{t("franchise.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {franchises.map((f) => (
          <Card
            key={f.id}
            className={cn(
              "relative cursor-pointer transition-all duration-200 border-2",
              f.color,
              selected === f.id
                ? "ring-2 ring-primary shadow-lg scale-[1.02]"
                : "hover:shadow-md hover:scale-[1.01]",
              f.highlight && selected !== f.id && "ring-1 ring-warning"
            )}
            onClick={() => setSelected(f.id)}
          >
            {f.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-warning text-foreground text-xs font-bold px-3 py-0.5 rounded-full">
                {t("franchise.popular")}
              </div>
            )}
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center gap-2">
                <div className="text-primary">{f.icon}</div>
                <CardTitle className="text-lg">{t(`franchise.${f.id}`)}</CardTitle>
              </div>
              <div className="text-2xl font-bold text-primary">
                R$ {f.price.toLocaleString("pt-BR")}
                <span className="text-sm font-normal text-muted-foreground ml-1">{t("franchise.once")}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {f.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
              <Button
                className={cn("w-full mt-3", selected === f.id ? "" : "variant-outline")}
                variant={selected === f.id ? "default" : "outline"}
                size="sm"
                onClick={(e) => { e.stopPropagation(); setSelected(f.id); }}
              >
                {selected === f.id ? t("franchise.selected") : t("franchise.select")}
              </Button>
            </CardContent>
          </Card>
        ))}
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

import { useMemo } from "react";
import { Hand, DollarSign, Target, Newspaper, ShoppingCart, Users, BookOpen, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { OrderSummaryCard } from "@/components/app/pedidos/OrderSummaryCard";
import { IndicarFranquiaDialog } from "@/components/app/IndicarFranquiaDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TodayCarousel } from "@/components/app/treinamentos/TodayCarousel";
import { weekEvents, DAYS_FULL } from "@/components/app/treinamentos/constants";
import { getEventStatus } from "@/components/app/treinamentos/helpers";
import { mockBonusSummary, mockBancoTimol, mockUserQualification, qualificationLabels } from "@/components/app/financeiro/mock-data";
import { getCurrencyConfig, formatCurrency } from "@/components/app/financeiro/currency-helpers";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const challenges = [
  { id: "meta1", label: "Desafio 1: Aumentar Vendas" },
  { id: "meta2", label: "Desafio 2: Fidelizar Clientes" },
  { id: "meta3", label: "Desafio 3: Expandir Rede" },
];

const mockOrders = [
  {
    id: "1", number: "#5001", date: "2026-03-10",
    items: [{ name: "Combo Mega", qty: 2, price: 189.9 }, { name: "Combo Mini", qty: 1, price: 99.9 }, { name: "Refil Alcalino", qty: 3, price: 59.9 }],
    total: 479.7, status: "enviado", tracking: "BR123456789",
  },
  {
    id: "2", number: "#4998", date: "2026-03-07",
    items: [{ name: "Loader Transparente", qty: 5, price: 29.9 }, { name: "Filtro Premium", qty: 2, price: 79.9 }],
    total: 149.5, status: "entregue",
  },
  {
    id: "3", number: "#4985", date: "2026-03-03",
    items: [{ name: "Combo Mega", qty: 1, price: 189.9 }, { name: "Produtos Separados", qty: 3, price: 49.9 }, { name: "Galão Ionizado", qty: 2, price: 45.0 }],
    total: 339.6, status: "confirmado",
  },
  {
    id: "4", number: "#4970", date: "2026-03-01",
    items: [{ name: "Combo Mini", qty: 4, price: 99.9 }],
    total: 399.6, status: "entregue",
  },
  {
    id: "5", number: "#4955", date: "2026-02-25",
    items: [{ name: "Combo Mega", qty: 1, price: 189.9 }],
    total: 189.9, status: "cancelado",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [indicarOpen, setIndicarOpen] = useState(false);

  const today = new Date();
  const todayDow = today.getDay();
  const todayIndex = todayDow === 0 ? 6 : todayDow - 1;

  const todayEvents = useMemo(() => {
    const events = weekEvents.filter((e) => e.dayIndex === todayIndex);
    return events.sort((a, b) => {
      const statusA = getEventStatus(a, todayIndex);
      const statusB = getEventStatus(b, todayIndex);
      const order = { live: 0, upcoming: 1, past: 2 } as const;
      if (order[statusA] !== order[statusB]) return order[statusA] - order[statusB];
      const [ah, am] = a.time.split(":").map(Number);
      const [bh, bm] = b.time.split(":").map(Number);
      return (ah * 60 + am) - (bh * 60 + bm);
    });
  }, [todayIndex]);

  const todayLabel = `Hoje – ${DAYS_FULL[todayIndex]}, ${today.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}`;

  const currency = getCurrencyConfig("BR", "BRL");
  const q = qualificationLabels[mockUserQualification.current];

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-primary">Painel Inicial</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral da sua franquia</p>
      </header>

      <section className="flex flex-col gap-2">
        {/* Boas Vindas */}
        <DashboardCard icon={Hand} title="Boas Vindas">
          <p className="mt-1 text-sm">
            Olá, <strong>Lívia Serato</strong>
          </p>
          <p className="text-sm text-muted-foreground italic mt-1">
            "Faça hoje melhor do que ontem e amanhã melhor do que hoje!"
          </p>
        </DashboardCard>

        {/* Treinamentos - Hoje */}
        {todayEvents.length > 0 && (
          <DashboardCard icon={GraduationCap} title={todayLabel}>
            <div className="mt-2">
              <TodayCarousel events={todayEvents} todayIndex={todayIndex} />
            </div>
          </DashboardCard>
        )}

        {/* Resumo Financeiro */}
        <DashboardCard icon={DollarSign} title="Resumo Financeiro">
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-md border border-success/30 bg-success/5 p-3 text-center">
              <p className="text-xs text-muted-foreground">Bônus a Receber</p>
              <p className="text-lg font-bold text-success">{formatCurrency(mockBonusSummary.nextFriday, currency)}</p>
            </div>
            <div className="rounded-md border border-app-card-border p-3 text-center">
              <p className="text-xs text-muted-foreground">Saldo Banco Timol</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(mockBancoTimol.available, currency)}</p>
            </div>
            <div className="rounded-md border border-app-card-border p-3 text-center">
              <p className="text-xs text-muted-foreground">Pontos Unilevel</p>
              <p className="text-lg font-bold text-primary">{mockUserQualification.totalPoints.toLocaleString("pt-BR")}</p>
            </div>
            <div className="rounded-md border border-app-card-border p-3 text-center">
              <p className="text-xs text-muted-foreground">Qualificação Atual</p>
              {q && (
                <p className="text-sm font-semibold text-primary flex items-center justify-center gap-1.5 mt-1">
                  <span className="text-base">{q.icon}</span>
                  {q.label}
                </p>
              )}
            </div>
          </div>
        </DashboardCard>




        {/* Movimentação de Pedidos */}
        <OrderSummaryCard orders={mockOrders} />

        {/* Metas e Desafios */}
        <DashboardCard icon={Target} title="Metas e Desafios">
          <div className="mt-2 flex flex-col gap-2">
            {challenges.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox id={c.id} />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
        </DashboardCard>

        {/* Timol News */}
        <DashboardCard icon={Newspaper} title="Timol News">
          <p className="text-sm text-muted-foreground mt-1">
            Notícias, atualizações e promoções da Timol
          </p>
          <div className="mt-3">
            <Carousel className="w-full">
              <CarouselContent>
                {[1, 2, 3, 4].map((n) => (
                  <CarouselItem key={n}>
                    <div className="flex min-h-[200px] items-center justify-center rounded-md bg-accent text-muted-foreground text-lg font-semibold">
                      Slide {n}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-3 h-8 w-8 border-app-card-border" />
              <CarouselNext className="-right-3 h-8 w-8 border-app-card-border" />
            </Carousel>
          </div>
        </DashboardCard>
      </section>

      <IndicarFranquiaDialog open={indicarOpen} onOpenChange={setIndicarOpen} />
    </div>
  );
}

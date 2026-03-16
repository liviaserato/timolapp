import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CreditCard, Loader2, Clock, ShoppingBag } from "lucide-react";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Props {
  finalTotal: number;
  paymentMethod: "pix" | "boleto" | "credit";
  pickupUnit: string | null;
  onChangePayment: () => void;
}

export default function OrderPaymentPending({ finalTotal, paymentMethod, pickupUnit, onChangePayment }: Props) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const methodLabel =
    paymentMethod === "pix" ? "PIX" : paymentMethod === "boleto" ? "Boleto Bancário" : "Cartão de Crédito";

  const isPix = paymentMethod === "pix";
  const isBoleto = paymentMethod === "boleto";

  const handleRefresh = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-xl">
        <CardContent className="flex flex-col gap-5 py-8 px-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <img src={timolLogoDark} alt="Timol" className="h-12" />
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-primary">Pagamento Pendente</h2>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Aguardando confirmação
            </span>
          </div>

          {/* Friendly message */}
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3 text-center">
            {isPix && (
              <p>
                Estamos aguardando a confirmação do seu pagamento via PIX.
                <br />
                Assim que identificarmos, seu pedido será processado automaticamente! 😊
              </p>
            )}
            {isBoleto && (
              <p>
                Seu boleto foi gerado com sucesso!
                <br />
                Após o pagamento, a compensação pode levar até 2 dias úteis. Fique tranquilo! 😊
              </p>
            )}
            {paymentMethod === "credit" && (
              <p>
                Estamos processando o pagamento do seu cartão.
                <br />
                Em alguns instantes tudo estará confirmado. Aguarde um pouquinho! 😊
              </p>
            )}
          </div>

          {/* Order summary */}
          <div className="w-full bg-primary/5 rounded-xl p-4 space-y-2 text-sm">
            <DataRow
              label="Valor Total"
              value={<span className="font-semibold">{formatCurrency(finalTotal)}</span>}
            />
            <DataRow
              label="Pagamento"
              value={<span className="text-muted-foreground text-xs">{methodLabel}</span>}
            />
            {pickupUnit && (
              <DataRow
                label="Retirada"
                value={<span className="text-muted-foreground text-xs">{pickupUnit}</span>}
              />
            )}
          </div>

          {/* Info note */}
          <div className="bg-accent/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Você pode acompanhar o status do seu pedido ou atualizar sua forma de pagamento a qualquer momento pelo app. Estamos aqui para ajudar! 💙
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button onClick={handleRefresh} disabled={checking} className="w-full gap-2">
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Verificar Pagamento
            </Button>

            <Button variant="outline" onClick={onChangePayment} disabled={checking} className="w-full gap-2">
              <CreditCard className="h-4 w-4" />
              Alterar Forma de Pagamento
            </Button>

            <Button variant="ghost" onClick={() => navigate("/app/pedidos")} className="w-full gap-2 text-muted-foreground">
              <ShoppingBag className="h-4 w-4" />
              Ver Meus Pedidos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center border-b border-border/40 py-1 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag, Bell, Package } from "lucide-react";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Props {
  finalTotal: number;
  paymentMethod: "pix" | "boleto" | "credit";
  pickupUnit: string | null;
}

export default function OrderPaymentConfirmed({ finalTotal, paymentMethod, pickupUnit }: Props) {
  const navigate = useNavigate();

  const methodLabel =
    paymentMethod === "pix" ? "PIX" : paymentMethod === "boleto" ? "Boleto Bancário" : "Cartão de Crédito";

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-xl text-center">
        <CardContent className="flex flex-col items-center gap-5 py-10 px-6">
          <img src={timolLogoDark} alt="Timol" className="h-12 mx-auto" />

          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
            <h2 className="text-2xl font-bold text-primary">Pedido Confirmado!</h2>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Que ótimo! Seu pedido foi realizado com sucesso.
            <br />
            Agora é só aguardar — você pode acompanhar tudo pelo app.
          </p>

          {/* Order summary */}
          <div className="w-full bg-primary/5 rounded-xl p-4 space-y-2 text-sm text-left">
            <DataRow
              label="Status"
              value={<span className="font-semibold text-green-600">Aprovado</span>}
            />
            <DataRow
              label="Nº do Pedido"
              value={<span className="font-semibold">#TML-{Math.floor(100000 + Math.random() * 900000)}</span>}
            />
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

          {/* Pickup notice */}
          {pickupUnit && (
            <div className="flex items-start gap-2.5 bg-accent/50 rounded-lg p-3 text-left w-full">
              <Bell className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Você escolheu retirar seu pedido na <strong className="text-foreground">{pickupUnit}</strong>.
                <br />
                Assim que estiver disponível para retirada, você será notificado. 📦
              </p>
            </div>
          )}

          {/* Delivery notice */}
          {!pickupUnit && (
            <div className="flex items-start gap-2.5 bg-accent/50 rounded-lg p-3 text-left w-full">
              <Package className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seu pedido será enviado/disponibilizado em breve!
                <br />
                Acompanhe o status da entrega/retirada diretamente pelo app.
              </p>
            </div>
          )}

          <Button
            className="w-full gap-2"
            onClick={() => navigate("/app/pedidos")}
          >
            <ShoppingBag className="h-4 w-4" />
            Ver Meus Pedidos
          </Button>
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

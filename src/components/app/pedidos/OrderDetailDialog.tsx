import { useState } from "react";
import {
  Package,
  MapPin,
  Building2,
  Truck,
  Calendar,
  CheckSquare,
  Star,
  RotateCcw,
  CreditCard,
  Landmark,
  Wallet,
  Ticket,
  ClipboardList,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import comboMegaImg from "@/assets/produto-combo-mega.png";
import comboMiniImg from "@/assets/produto-combo-mini.png";
import produtosSeparadosImg from "@/assets/produtos-separados.png";
import loaderImg from "@/assets/produtos-loader-transparent.png";

/* ── Types ── */

export type OrderStatus = "pendente" | "confirmado" | "enviado" | "entregue" | "cancelado" | "disponivel_retirada";

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  discountedTotal?: number;
}

export interface OrderDelivery {
  type: "entrega" | "retirada";
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  note?: string;
  pickupLocation?: string;
  deliveryDate?: string;
  tracking?: string;
  deliveredTo?: string;
}

export interface OrderPayment {
  method: string;
  label?: string;
  value: number;
  installments?: string;
  flag?: string;
}

export interface Order {
  id: string;
  number: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  tracking?: string;
  subtotal?: number;
  freight?: number;
  coupon?: { name: string; discount: number };
  pointsUnilevel?: number;
  pointsBinary?: number;
  delivery?: OrderDelivery;
  payments?: OrderPayment[];
}

/* ── Helpers ── */

const statusConfig: Record<OrderStatus, { label: string; textColor: string; bgColor: string; borderColor: string }> = {
  pendente:              { label: "Pendente",                textColor: "text-gray-600",       bgColor: "bg-gray-50",         borderColor: "border-gray-300" },
  confirmado:            { label: "Confirmado",              textColor: "text-blue-600",       bgColor: "bg-blue-50",         borderColor: "border-blue-300" },
  enviado:               { label: "Enviado",                 textColor: "text-emerald-600",    bgColor: "bg-emerald-50",      borderColor: "border-emerald-300" },
  disponivel_retirada:   { label: "Disponível p/ Retirada",  textColor: "text-emerald-600",    bgColor: "bg-emerald-50",      borderColor: "border-emerald-300" },
  entregue:              { label: "Entregue",                textColor: "text-[#003885]",      bgColor: "bg-blue-50",         borderColor: "border-[#003885]/30" },
  cancelado:             { label: "Cancelado",               textColor: "text-red-600",        bgColor: "bg-red-50",          borderColor: "border-red-300" },
};

const productImages: Record<string, string> = {
  "Combo Mega": comboMegaImg,
  "Combo Mini": comboMiniImg,
  "Produtos Separados": produtosSeparadosImg,
  "Loader Transparente": loaderImg,
};

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
}

function canReturn(order: Order): boolean {
  if (order.status !== "entregue" || !order.delivery?.deliveryDate) return false;
  const delivered = new Date(order.delivery.deliveryDate + "T00:00:00");
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - delivered.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

const Separator = () => <div className="border-t border-border/40 my-1.5" />;

const paymentOrder: Record<string, number> = {
  "saldo": 0, "banco": 0,
  "voucher": 1,
  "pix": 2,
  "crédito": 3, "credito": 3,
};

function sortPayments(payments: OrderPayment[]) {
  return [...payments].sort((a, b) => {
    const aKey = Object.keys(paymentOrder).find(k => a.method.toLowerCase().includes(k)) ?? "";
    const bKey = Object.keys(paymentOrder).find(k => b.method.toLowerCase().includes(k)) ?? "";
    return (paymentOrder[aKey] ?? 99) - (paymentOrder[bKey] ?? 99);
  });
}

const sectionTitleClass = "text-sm font-bold text-primary mb-2";

/* ── Component ── */

interface OrderDetailDialogProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailDialog({ order, onClose }: OrderDetailDialogProps) {
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  if (!order) return null;

  const cfg = statusConfig[order.status];
  const subtotal = order.subtotal ?? order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const freight = order.freight ?? 0;
  const couponDiscount = order.coupon?.discount ?? 0;
  const totalValue = order.total;

  return (
    <>
      <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          {/* Blue header area */}
          <div className="-mx-6 -mt-6 px-6 pt-6 pb-3 bg-sidebar rounded-t-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sidebar-foreground">
                <Package className="h-5 w-5 shrink-0" />
                <span>Pedido {order.number}</span>
              </DialogTitle>
            </DialogHeader>

            {/* Date + Status badge row */}
            <div className="mt-1 flex items-center justify-between pl-7">
              <span className="text-[13px] text-sidebar-foreground/70">Data: {formatDate(order.date)}</span>
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                cfg.textColor, cfg.bgColor, cfg.borderColor
              )}>
                {cfg.label}
              </span>
            </div>
          </div>

          {/* ── Produtos ── */}
          <div>
            <p className={sectionTitleClass}>Produtos</p>
            <div className="space-y-3">
              {order.items.map((item, idx) => {
                const img = productImages[item.name];
                const lineTotal = item.price * item.qty;
                return (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="h-14 w-14 rounded-md border border-border bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
                      {img ? (
                        <img src={img} alt={item.name} className="h-12 w-12 object-contain" />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatCurrency(item.price)} /unidade
                          </p>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          {item.discountedTotal != null ? (
                            <div className="flex flex-col items-end">
                              <span className="relative text-sm text-muted-foreground">
                                {formatCurrency(lineTotal)}
                                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <span className="block w-[110%] h-[1.5px] bg-red-400/70 rotate-[-12deg]" />
                                </span>
                              </span>
                              <span className="text-sm font-bold text-foreground">
                                {formatCurrency(item.discountedTotal)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-foreground">
                              {formatCurrency(lineTotal)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.qty} {item.qty === 1 ? "unidade" : "unidades"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* ── Resumo de Valores ── */}
          <div>
            <p className={sectionTitleClass}>Resumo de Valores</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pedido</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete</span>
                <span className={freight === 0 ? "text-emerald-600 font-medium" : ""}>
                  {freight === 0 ? "Grátis" : formatCurrency(freight)}
                </span>
              </div>
              {order.coupon && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cupom {order.coupon.name}</span>
                  <span className="text-emerald-600 font-medium">- {formatCurrency(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-1">
                <span>Valor Total</span>
                <span>{formatCurrency(totalValue)}</span>
              </div>
            </div>
          </div>

          {/* Points banner */}
          {(order.pointsUnilevel || order.pointsBinary) && (
            <div className="rounded-lg bg-sky-50 border border-sky-200 px-3 py-2.5 flex justify-center">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-sky-700 shrink-0" />
                <p className="text-xs text-sky-700 text-left">
                Com este pedido, você acumulou
                <br />
                {order.pointsUnilevel != null && (
                  <span className="font-bold text-sky-600">{order.pointsUnilevel} pontos Unilevel</span>
                )}
                {order.pointsUnilevel != null && order.pointsBinary != null && " e "}
                {order.pointsBinary != null && (
                  <span className="font-bold text-sky-600">{order.pointsBinary} pontos Binário</span>
                )}
                .
              </p>
              </div>
            </div>
          )}

          <Separator />

          {/* ── Forma de Pagamento ── */}
          {order.payments && order.payments.length > 0 && (
            <>
              <div>
                <p className={sectionTitleClass}>Forma de Pagamento</p>
                <div className="space-y-1.5 text-sm">
                  {sortPayments(order.payments).map((p, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1.5">
                          <PaymentIcon method={p.method} />
                          <span className="text-muted-foreground">
                            {p.method}
                            {p.label ? ` ${p.label}` : ""}
                          </span>
                        </div>
                        <span>{formatCurrency(p.value)}</span>
                      </div>
                      {p.installments && (
                        <p className="text-[11px] text-muted-foreground italic ml-5">({p.installments})</p>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-1">
                    <span>Valor Total</span>
                    <span>{formatCurrency(totalValue)}</span>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* ── Logística ── */}
          {order.delivery && (
            <>
              <div>
                <p className={sectionTitleClass}>Logística</p>

                {order.delivery.type === "entrega" && (
                  <div className="space-y-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Endereço de Entrega</p>
                        {order.delivery.address && (
                          <p className="text-xs text-muted-foreground">{order.delivery.address}</p>
                        )}
                        {order.delivery.city && (
                          <p className="text-xs text-muted-foreground">
                            {order.delivery.city}{order.delivery.state ? ` — ${order.delivery.state}` : ""}
                          </p>
                        )}
                        {order.delivery.zip && (
                          <p className="text-xs text-muted-foreground">CEP {order.delivery.zip}</p>
                        )}
                        {order.delivery.note && (
                          <p className="text-[11px] text-muted-foreground/60 italic">{order.delivery.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {order.delivery.type === "retirada" && (
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Retirada Presencial</p>
                      {order.delivery.pickupLocation && (
                        <p className="text-xs text-muted-foreground">{order.delivery.pickupLocation}</p>
                      )}
                    </div>
                  </div>
                )}

                {order.status === "confirmado" && order.delivery.type === "entrega" && (
                  <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mt-2">
                    📦 Seu pedido foi confirmado e está sendo preparado. Assim que sair para entrega, você receberá o código de rastreio.
                  </p>
                )}
                {order.status === "confirmado" && order.delivery.type === "retirada" && (
                  <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mt-2">
                    📦 Seu pedido foi confirmado e está sendo preparado. Assim que estiver disponível para retirada, você será notificado.
                  </p>
                )}

                {order.delivery.type === "entrega" && (order.delivery.deliveryDate || order.delivery.tracking || order.delivery.deliveredTo) && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="text-sm font-semibold text-foreground">Informações da Entrega</p>
                    </div>
                    {order.delivery.deliveryDate && (
                      <div className="flex items-center gap-2 text-xs ml-5">
                        <span className="text-muted-foreground">Data da Entrega:</span>
                        <span className="text-foreground">{formatDate(order.delivery.deliveryDate)}</span>
                      </div>
                    )}
                     {order.delivery.tracking && (
                      <div className="flex items-center gap-2 text-xs ml-5">
                        <span className="text-muted-foreground">Rastreio:</span>
                        <Truck className="h-3.5 w-3.5 text-foreground shrink-0 -mr-1" />
                        <span className="font-mono text-foreground">{order.delivery.tracking}</span>
                      </div>
                    )}
                    {order.delivery.deliveredTo && (
                      <div className="flex items-center gap-2 text-xs ml-5">
                        <span className="text-muted-foreground">Entrega</span>
                        <span className="text-foreground">Entregue para {order.delivery.deliveredTo}</span>
                      </div>
                    )}
                  </div>
                )}

                {order.delivery.type !== "entrega" && order.delivery.tracking && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Rastreio:</span>
                      <Truck className="h-3.5 w-3.5 text-foreground shrink-0 -mr-1" />
                      <span className="font-mono text-foreground">{order.delivery.tracking}</span>
                    </div>
                  </div>
                )}
              </div>

              <Separator />
            </>
          )}

          {/* ── Return button ── */}
          {canReturn(order) && (
            <Button
              variant="outline"
              className="w-full gap-2 text-muted-foreground"
              onClick={() => setShowReturnDialog(true)}
            >
              <RotateCcw className="h-4 w-4" />
              Desisti da compra, quero devolver
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Return confirmation dialog ── */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Devolução por Desistência
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Você tem o direito de desistir da compra em até <span className="font-bold text-foreground">7 dias</span>,
              conforme o Código de Defesa do Consumidor.
            </p>
            <p>
              Se desejar prosseguir com a devolução, clique no botão abaixo.
            </p>
          </div>
          <Button className="w-full mt-2" onClick={() => { setShowReturnDialog(false); onClose(); }}>
            Prosseguir
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ── Payment icon helper ── */

function PaymentIcon({ method }: { method: string }) {
  const lower = method.toLowerCase();
  if (lower === "pix") return <Landmark className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  if (lower.includes("crédito") || lower.includes("credito")) return <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  if (lower.includes("saldo") || lower.includes("banco")) return <Wallet className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  if (lower.includes("voucher")) return <Ticket className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  return <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
}

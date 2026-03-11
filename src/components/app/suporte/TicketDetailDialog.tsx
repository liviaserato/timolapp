import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, ThumbsDown, Clock, CheckCircle2, AlertCircle, User, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TicketInteraction {
  id: string;
  autor: "usuario" | "equipe";
  nomeAutor: string;
  mensagem: string;
  dataHora: string;
}

export interface TicketDetail {
  id: string;
  numero: string;
  assunto: string;
  categoria: string;
  status: "aberto" | "em_andamento" | "respondido" | "fechado";
  descricaoInicial: string;
  dataAbertura: string;
  ultimaAtualizacao: string;
  historico: TicketInteraction[];
}

const statusMap: Record<TicketDetail["status"], { label: string; color: string; icon: typeof Clock }> = {
  aberto: { label: "Aberto", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
  em_andamento: { label: "Em andamento", color: "bg-amber-100 text-amber-700", icon: Clock },
  respondido: { label: "Respondido", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  fechado: { label: "Fechado", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
};

interface TicketDetailDialogProps {
  ticket: TicketDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TicketDetailDialog({ ticket, open, onOpenChange }: TicketDetailDialogProps) {
  const [rating, setRating] = useState<"positive" | "negative" | null>(null);

  if (!ticket) return null;

  const st = statusMap[ticket.status];
  const isResolved = ticket.status === "respondido" || ticket.status === "fechado";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute left-4 top-4 text-muted-foreground hover:text-foreground"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <DialogTitle className="text-lg">Chamado {ticket.numero}</DialogTitle>
          <DialogDescription>Detalhes e histórico de interações</DialogDescription>
        </DialogHeader>

        {/* ── Info principal ── */}
        <div className="space-y-3 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Status</span>
            <Badge variant="secondary" className={`text-[10px] ${st.color}`}>
              {st.label}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Categoria</p>
              <p className="font-medium">{ticket.categoria}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data de abertura</p>
              <p className="font-medium">{ticket.dataAbertura}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Assunto</p>
            <p className="text-sm font-medium">{ticket.assunto}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Descrição inicial</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{ticket.descricaoInicial}</p>
          </div>
        </div>

        {/* ── Histórico de interações ── */}
        <div className="mt-4">
          <h3 className="text-sm font-bold text-primary mb-3">Histórico de Interações</h3>
          <div className="space-y-3">
            {ticket.historico.map((item) => {
              const isUser = item.autor === "usuario";
              return (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-lg p-3 text-sm",
                    isUser ? "bg-primary/5 border border-primary/10" : "bg-muted/60 border border-border"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center",
                        isUser ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                      )}
                    >
                      {isUser ? <User className="h-3 w-3" /> : <Headphones className="h-3 w-3" />}
                    </div>
                    <span className="font-medium text-xs">{item.nomeAutor}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{item.dataHora}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed pl-7">{item.mensagem}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Avaliação (se resolvido) ── */}
        {isResolved && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-medium text-center mb-3">
              Você ficou satisfeito com o atendimento?
            </p>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setRating("positive")}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all",
                  rating === "positive"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600 scale-110"
                    : "border-border text-muted-foreground hover:border-muted-foreground/40"
                )}
                aria-label="Satisfeito"
              >
                <ThumbsUp className={cn("h-6 w-6", rating === "positive" && "fill-emerald-500")} />
                <span className="text-[10px] font-medium">Sim</span>
              </button>
              <button
                onClick={() => setRating("negative")}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all",
                  rating === "negative"
                    ? "border-red-500 bg-red-50 text-red-600 scale-110"
                    : "border-border text-muted-foreground hover:border-muted-foreground/40"
                )}
                aria-label="Insatisfeito"
              >
                <ThumbsDown className={cn("h-6 w-6", rating === "negative" && "fill-red-500")} />
                <span className="text-[10px] font-medium">Não</span>
              </button>
            </div>
            {rating && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                {rating === "positive" ? "Obrigado pelo feedback! 😊" : "Sentimos muito. Vamos melhorar! 🙏"}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

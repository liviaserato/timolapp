import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Youtube,
  Video,
  Tv,
  MessageCircle,
  ExternalLink,
  Clock,
  Star,
  Presentation,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import iconWhatsapp from "@/assets/icon-logo-whatsapp.svg";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

type EventType = "produto" | "negocio" | "especial" | "treinamento";

interface WeekEvent {
  id: string;
  dayIndex: number;        // 0=Seg … 6=Dom
  time: string;            // "19:00"
  title: string;
  type: EventType;
  host?: string;
}

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const DAYS_FULL = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const weekEvents: WeekEvent[] = [
  { id: "1", dayIndex: 0, time: "19:00", title: "Live Produto – Timol Saúde", type: "produto", host: "João Silva" },
  { id: "2", dayIndex: 0, time: "20:30", title: "Treinamento: Primeiros Passos", type: "treinamento", host: "Maria Souza" },
  { id: "3", dayIndex: 1, time: "19:00", title: "Live Negócio – Plano de Carreira", type: "negocio", host: "Carlos Lima" },
  { id: "4", dayIndex: 2, time: "19:00", title: "Especial: Fechamento de Mês", type: "especial", host: "Ana Costa" },
  { id: "5", dayIndex: 2, time: "20:30", title: "Treinamento: Técnicas de Venda", type: "treinamento", host: "Pedro Alves" },
  { id: "6", dayIndex: 3, time: "19:00", title: "Live Produto – Linha Premium", type: "produto", host: "João Silva" },
  { id: "7", dayIndex: 3, time: "20:30", title: "Live Negócio – Marketing Digital", type: "negocio", host: "Carlos Lima" },
  { id: "8", dayIndex: 4, time: "19:00", title: "Especial: Depoimentos de Sucesso", type: "especial", host: "Ana Costa" },
  { id: "9", dayIndex: 5, time: "10:00", title: "Treinamento: Liderança", type: "treinamento", host: "Maria Souza" },
];

const typeConfig: Record<EventType, { label: string; color: string; icon: React.ReactNode }> = {
  produto:      { label: "Produto",      color: "bg-blue-500/15 text-blue-700 border-blue-200",     icon: <Presentation className="h-3.5 w-3.5" /> },
  negocio:      { label: "Negócio",      color: "bg-emerald-500/15 text-emerald-700 border-emerald-200", icon: <Tv className="h-3.5 w-3.5" /> },
  especial:     { label: "Especial",     color: "bg-amber-500/15 text-amber-700 border-amber-200",   icon: <Sparkles className="h-3.5 w-3.5" /> },
  treinamento:  { label: "Treinamento",  color: "bg-purple-500/15 text-purple-700 border-purple-200", icon: <GraduationCap className="h-3.5 w-3.5" /> },
};

const quickLinks = [
  { label: "Canal YouTube",   icon: <Youtube className="h-5 w-5" />,     url: "#", color: "text-red-600" },
  { label: "Sala Google Meet", icon: <Video className="h-5 w-5" />,      url: "#", color: "text-green-600" },
  { label: "TimolFlix",        icon: <Tv className="h-5 w-5" />,         url: "#", color: "text-primary" },
  { label: "WhatsApp",         icon: <img src={iconWhatsapp} alt="" className="h-5 w-5" />, url: "#", color: "" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Treinamentos() {
  const today = new Date();
  const todayDow = today.getDay(); // 0=Sun
  const todayIndex = todayDow === 0 ? 6 : todayDow - 1; // convert to 0=Mon

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const filteredEvents =
    selectedDay !== null
      ? weekEvents.filter((e) => e.dayIndex === selectedDay)
      : weekEvents;

  const todayEvents = weekEvents.filter((e) => e.dayIndex === todayIndex);

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Treinamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe a programação semanal de lives, treinamentos e eventos especiais.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickLinks.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                <span className={link.color}>{link.icon}</span>
                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                  {link.label}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      {/* Today highlight (only if there are events today) */}
      {todayEvents.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Hoje – {DAYS_FULL[todayIndex]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayEvents.map((ev) => (
              <EventRow key={ev.id} event={ev} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weekly calendar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Programação Semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Day filter tabs */}
          <Tabs
            value={selectedDay !== null ? String(selectedDay) : "all"}
            onValueChange={(v) => setSelectedDay(v === "all" ? null : Number(v))}
          >
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="all" className="text-xs px-3">Todos</TabsTrigger>
              {DAYS.map((d, i) => (
                <TabsTrigger
                  key={i}
                  value={String(i)}
                  className={`text-xs px-3 ${i === todayIndex ? "ring-1 ring-primary/40" : ""}`}
                >
                  {d}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Events list */}
          <div className="space-y-2">
            {filteredEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum evento neste dia.
              </p>
            ) : (
              filteredEvents.map((ev) => (
                <EventRow key={ev.id} event={ev} showDay={selectedDay === null} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        {(Object.keys(typeConfig) as EventType[]).map((type) => {
          const cfg = typeConfig[type];
          return (
            <Badge key={type} variant="outline" className={`${cfg.color} text-[11px] gap-1`}>
              {cfg.icon}
              {cfg.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Event Row                                                          */
/* ------------------------------------------------------------------ */

function EventRow({ event, showDay = false }: { event: WeekEvent; showDay?: boolean }) {
  const cfg = typeConfig[event.type];

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
      {/* Time */}
      <div className="flex flex-col items-center min-w-[52px]">
        {showDay && (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            {DAYS[event.dayIndex]}
          </span>
        )}
        <span className="text-sm font-bold text-foreground flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {event.time}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-border" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
        {event.host && (
          <p className="text-xs text-muted-foreground">com {event.host}</p>
        )}
      </div>

      {/* Badge */}
      <Badge variant="outline" className={`${cfg.color} text-[10px] gap-1 shrink-0 hidden sm:flex`}>
        {cfg.icon}
        {cfg.label}
      </Badge>
    </div>
  );
}

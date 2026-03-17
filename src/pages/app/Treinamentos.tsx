import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import {
  Calendar,
  Youtube,
  Video,
  Tv,
  ExternalLink,
  Clock,
  Star,
  Presentation,
  GraduationCap,
  Sparkles,
  Play,
  Radio,
  Hourglass,
} from "lucide-react";
import iconWhatsapp from "@/assets/icon-logo-whatsapp.svg";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type EventType = "produto" | "negocio" | "especial" | "treinamento";

interface WeekEvent {
  id: string;
  dayIndex: number;        // 0=Seg … 6=Dom
  time: string;            // "19:00"
  endTime?: string;        // "20:00" optional end time
  title: string;
  type: EventType;
  host?: string;
}

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const DAYS_FULL = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

const weekEvents: WeekEvent[] = [
  { id: "1", dayIndex: 0, time: "08:50", endTime: "10:00", title: "Aulas de produtos e franquias", type: "produto", host: "Lucas Rocha" },
  { id: "2", dayIndex: 0, time: "20:30", endTime: "21:30", title: "Treinamento: Primeiros Passos", type: "treinamento", host: "Maria Souza" },
  { id: "3", dayIndex: 1, time: "19:20", endTime: "20:20", title: "Aulas de produtos e franquias", type: "negocio", host: "Lucas Rocha" },
  { id: "4", dayIndex: 1, time: "20:30", endTime: "21:30", title: "Live Especial: Fechamento de Mês", type: "especial", host: "Ana Costa" },
  { id: "5", dayIndex: 2, time: "19:00", endTime: "20:00", title: "Treinamento: Técnicas de Venda", type: "treinamento", host: "Pedro Alves" },
  { id: "6", dayIndex: 3, time: "19:00", endTime: "20:00", title: "Live Produto – Linha Premium", type: "produto", host: "João Silva" },
  { id: "7", dayIndex: 3, time: "20:30", endTime: "21:30", title: "Live Negócio – Marketing Digital", type: "negocio", host: "Carlos Lima" },
  { id: "8", dayIndex: 4, time: "19:00", endTime: "20:00", title: "Especial: Depoimentos de Sucesso", type: "especial", host: "Ana Costa" },
  { id: "9", dayIndex: 5, time: "10:00", endTime: "11:00", title: "Treinamento: Liderança", type: "treinamento", host: "Maria Souza" },
];

const typeConfig: Record<EventType, { label: string; borderColor: string; badgeClass: string; icon: React.ReactNode }> = {
  produto:     { label: "Produto",     borderColor: "border-l-blue-600",    badgeClass: "bg-blue-500/15 text-blue-700 border-blue-200",       icon: <Presentation className="h-3.5 w-3.5" /> },
  negocio:     { label: "Negócio",     borderColor: "border-l-emerald-600", badgeClass: "bg-emerald-500/15 text-emerald-700 border-emerald-200", icon: <Tv className="h-3.5 w-3.5" /> },
  especial:    { label: "Especial",    borderColor: "border-l-amber-500",   badgeClass: "bg-amber-500/15 text-amber-700 border-amber-200",     icon: <Sparkles className="h-3.5 w-3.5" /> },
  treinamento: { label: "Treinamento", borderColor: "border-l-purple-600",  badgeClass: "bg-purple-500/15 text-purple-700 border-purple-200",   icon: <GraduationCap className="h-3.5 w-3.5" /> },
};

const quickLinks = [
  { label: "Canal YouTube",    icon: <Youtube className="h-5 w-5" />,                                     url: "#", color: "text-red-600" },
  { label: "Sala Google Meet", icon: <Video className="h-5 w-5" />,                                       url: "#", color: "text-green-600" },
  { label: "TimolFlix",        icon: <Tv className="h-5 w-5" />,                                          url: "#", color: "text-primary" },
  { label: "WhatsApp",         icon: <img src={iconWhatsapp} alt="" className="h-5 w-5" />,                url: "#", color: "" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getMondayOfCurrentWeek(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getDateForDayIndex(dayIndex: number): Date {
  const monday = getMondayOfCurrentWeek();
  const d = new Date(monday);
  d.setDate(monday.getDate() + dayIndex);
  return d;
}

function formatDateBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

type EventStatus = "live" | "past" | "upcoming";

function getEventStatus(event: WeekEvent, todayIndex: number): EventStatus {
  if (event.dayIndex < todayIndex) return "past";
  if (event.dayIndex > todayIndex) return "upcoming";

  // Same day — check time
  const now = new Date();
  const [startH, startM] = event.time.split(":").map(Number);
  const startMinutes = startH * 60 + startM;

  let endMinutes = startMinutes + 60; // default 1h
  if (event.endTime) {
    const [endH, endM] = event.endTime.split(":").map(Number);
    endMinutes = endH * 60 + endM;
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (nowMinutes >= startMinutes && nowMinutes < endMinutes) return "live";
  if (nowMinutes >= endMinutes) return "past";
  return "upcoming";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Treinamentos() {
  const today = new Date();
  const todayDow = today.getDay();
  const todayIndex = todayDow === 0 ? 6 : todayDow - 1;

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<EventType | "all">("all");

  const filteredEvents = useMemo(() => {
    let events = selectedDay !== null
      ? weekEvents.filter((e) => e.dayIndex === selectedDay)
      : weekEvents;
    if (selectedType !== "all") {
      events = events.filter((e) => e.type === selectedType);
    }
    return events;
  }, [selectedDay, selectedType]);

  const todayEvents = weekEvents.filter((e) => e.dayIndex === todayIndex);

  const selectedDateLabel = useMemo(() => {
    if (selectedDay === null) {
      const monday = getDateForDayIndex(0);
      const sunday = getDateForDayIndex(6);
      const sameYear = monday.getFullYear() === sunday.getFullYear();
      const mondayStr = monday.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", ...(sameYear ? {} : { year: "numeric" }) });
      const sundayStr = formatDateBR(sunday);
      return `${mondayStr} a ${sundayStr}`;
    }
    const date = getDateForDayIndex(selectedDay);
    return `${DAYS_FULL[selectedDay]}, ${formatDateBR(date)}`;
  }, [selectedDay]);

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
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="group">
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

      {/* Today highlight */}
      {todayEvents.length > 0 && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-primary fill-primary/20" />
              Hoje – {DAYS_FULL[todayIndex]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayEvents.map((ev) => (
              <TodayEventRow key={ev.id} event={ev} todayIndex={todayIndex} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weekly calendar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Programação Semanal
              </CardTitle>
              {selectedDateLabel && (
                <p className="text-sm text-muted-foreground ml-6">{selectedDateLabel}</p>
              )}
            </div>
            {/* Category filter dropdown */}
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as EventType | "all")}>
              <SelectTrigger className="w-auto h-8 text-xs gap-1.5 px-3 shrink-0">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {(Object.keys(typeConfig) as EventType[]).map((type) => {
                  const cfg = typeConfig[type];
                  return (
                    <SelectItem key={type} value={type}>
                      <span className="flex items-center gap-1.5">
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
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
          <div className="space-y-2" style={{ minHeight: "340px" }}>
            {filteredEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum evento neste dia.
              </p>
            ) : selectedDay === null ? (
              /* Group by day with separator labels */
              (() => {
                const grouped = filteredEvents.reduce<Record<number, WeekEvent[]>>((acc, ev) => {
                  (acc[ev.dayIndex] = acc[ev.dayIndex] || []).push(ev);
                  return acc;
                }, {});
                return Object.entries(grouped)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([dayIdx, events]) => {
                    const idx = Number(dayIdx);
                    const isToday = idx === todayIndex;
                    return (
                      <div key={dayIdx} className="flex gap-3">
                        {/* Rotated day label */}
                        <div className="flex flex-col items-center justify-center min-w-[36px] py-2">
                          <span
                            className={`text-[11px] font-semibold tracking-widest whitespace-nowrap ${isToday ? "text-primary" : "text-muted-foreground/50"}`}
                            style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", letterSpacing: "0.15em" }}
                          >
                            {DAYS_FULL[idx]}
                          </span>
                        </div>
                        <div className={`flex-1 space-y-2 border-l-2 pl-3 py-2 ${isToday ? "border-primary/40" : "border-border"}`}>
                          {events.map((ev) => (
                            <ScheduleEventRow key={ev.id} event={ev} showDay={false} showDate todayIndex={todayIndex} />
                          ))}
                        </div>
                      </div>
                    );
                  });
              })()
            ) : (
              filteredEvents.map((ev) => (
                <ScheduleEventRow key={ev.id} event={ev} showDay={false} showDate todayIndex={todayIndex} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Today Event Row (enhanced)                                         */
/* ------------------------------------------------------------------ */

function TodayEventRow({ event, todayIndex }: { event: WeekEvent; todayIndex: number }) {
  const cfg = typeConfig[event.type];
  const status = getEventStatus(event, todayIndex);

  return (
    <div className={`flex items-center gap-3 rounded-r-lg rounded-l-[2px] border border-app-card-border bg-card overflow-hidden border-l-[5px] ${cfg.borderColor} p-3 shadow-sm`}>
      {/* Time */}
      <div className="flex flex-col items-center min-w-[48px]">
        <span className="text-sm font-bold text-foreground flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {event.time}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-border" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground">{event.title}</p>
          {status === "live" && (
            <Badge className="bg-red-600 text-white border-0 text-[10px] gap-1 animate-pulse">
              <Radio className="h-3 w-3" />
              Ao vivo
            </Badge>
          )}
        </div>
        {event.host && (
          <p className="text-xs text-muted-foreground mt-0.5">com {event.host}</p>
        )}
      </div>

      {/* Action */}
      <div className="shrink-0">
        {status === "live" ? (
          <Button size="sm" className="gap-1.5 text-xs">
            <Play className="h-3.5 w-3.5" />
            Entrar na aula
          </Button>
        ) : status === "past" ? (
          <Button size="sm" variant="outline" className="gap-0.5 text-xs flex flex-col items-center leading-tight h-auto py-1.5 px-3">
            <Play className="h-3.5 w-3.5 mb-0.5" />
            <span>Assistir</span>
            <span>gravação</span>
          </Button>
        ) : (
          <Badge variant="outline" className={`${cfg.badgeClass} text-[10px] gap-1`}>
            {cfg.icon}
            {cfg.label}
          </Badge>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Schedule Event Row (weekly grid)                                   */
/* ------------------------------------------------------------------ */

function ScheduleEventRow({ event, showDay = false, showDate = false, todayIndex }: { event: WeekEvent; showDay?: boolean; showDate?: boolean; todayIndex: number }) {
  const cfg = typeConfig[event.type];
  const status = getEventStatus(event, todayIndex);
  const dayDateLabel = showDate ? (() => {
    const d = getDateForDayIndex(event.dayIndex);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  })() : null;

  return (
    <div className={`flex items-center gap-3 rounded-r-lg rounded-l-[2px] border border-app-card-border bg-card overflow-hidden border-l-[5px] ${cfg.borderColor} p-3 hover:bg-muted/50 transition-colors`}>
      {/* Time */}
      <div className="flex flex-col items-center min-w-[72px] w-[72px]">
        {showDay && (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            {DAYS[event.dayIndex]}
          </span>
        )}
        {dayDateLabel !== null && (
          <span className="text-xs text-muted-foreground leading-tight">{dayDateLabel}</span>
        )}
        <span className="text-sm font-bold text-foreground flex items-center gap-1">
          <Clock className="h-3 w-3 text-foreground" />
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

      {/* Divider */}
      <div className="w-px h-8 bg-border" />

      {/* Status action */}
      <div className="shrink-0 hidden sm:flex">
        {status === "live" ? (
          <Badge className="bg-red-600 text-white border-0 text-[10px] gap-1 animate-pulse">
            <Radio className="h-3 w-3" />
            Ao vivo
          </Badge>
        ) : status === "past" ? (
          <button className="flex flex-col items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1">
            <Play className="h-4 w-4" />
            <span>Gravação</span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-0.5 text-xs text-muted-foreground px-3 py-1">
            <Hourglass className="h-4 w-4" />
            <span>Em breve</span>
          </div>
        )}
      </div>
    </div>
  );
}

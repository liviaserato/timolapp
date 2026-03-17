import { useState, useMemo, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import iconWhatsapp from "@/assets/icon-logo-whatsapp.svg";
import bannerMock from "@/assets/banner-treinamento-mock.png";
import bannerMock2 from "@/assets/banner-treinamento-mock-2.png";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type EventType = "produto" | "negocio" | "especial" | "treinamento";

interface WeekEvent {
  id: string;
  dayIndex: number;
  time: string;
  endTime?: string;
  title: string;
  type: EventType;
  host?: string;
  bannerUrl?: string;
}

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const DAYS_FULL = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

const weekEvents: WeekEvent[] = [
  { id: "1", dayIndex: 0, time: "08:50", endTime: "10:00", title: "Aulas de produtos e franquias", type: "produto", host: "Lucas Rocha" },
  { id: "2", dayIndex: 0, time: "20:30", endTime: "21:30", title: "Treinamento: Primeiros Passos", type: "treinamento", host: "Maria Souza" },
  { id: "3", dayIndex: 1, time: "00:00", endTime: "23:59", title: "Aulas de produtos e franquias", type: "negocio", host: "Lucas Rocha", bannerUrl: bannerMock },
  { id: "4", dayIndex: 1, time: "20:30", endTime: "21:30", title: "Construindo uma Rede Forte", type: "especial", host: "Ana Costa", bannerUrl: bannerMock2 },
  { id: "5", dayIndex: 2, time: "19:00", endTime: "20:00", title: "Treinamento: Técnicas de Venda", type: "treinamento", host: "Pedro Alves" },
  { id: "6", dayIndex: 3, time: "19:00", endTime: "20:00", title: "Live Produto – Linha Premium", type: "produto", host: "João Silva" },
  { id: "7", dayIndex: 3, time: "20:30", endTime: "21:30", title: "Live Negócio – Marketing Digital", type: "negocio", host: "Carlos Lima" },
  { id: "8", dayIndex: 4, time: "19:00", endTime: "20:00", title: "Especial: Depoimentos de Sucesso", type: "especial", host: "Ana Costa" },
  { id: "9", dayIndex: 5, time: "10:00", endTime: "11:00", title: "Treinamento: Liderança", type: "treinamento", host: "Maria Souza" },
];

const typeConfig: Record<EventType, { label: string; borderColor: string; iconColor: string; badgeBg: string; badgeBorder: string; badgeText: string; icon: React.ReactNode }> = {
  produto:     { label: "Produto",     borderColor: "border-l-[#006DFF]",   iconColor: "text-[#006DFF]",   badgeBg: "bg-[#006DFF]/10", badgeBorder: "border-[#006DFF]/30", badgeText: "text-[#006DFF]", icon: <Presentation className="h-3.5 w-3.5" /> },
  negocio:     { label: "Negócio",     borderColor: "border-l-[#003885]",   iconColor: "text-[#003885]",   badgeBg: "bg-[#003885]/10", badgeBorder: "border-[#003885]/30", badgeText: "text-[#003885]", icon: <Tv className="h-3.5 w-3.5" /> },
  especial:    { label: "Especial",    borderColor: "border-l-amber-300",   iconColor: "text-amber-400",   badgeBg: "bg-amber-400/10", badgeBorder: "border-amber-400/30", badgeText: "text-amber-500", icon: <Sparkles className="h-3.5 w-3.5" /> },
  treinamento: { label: "Treinamento", borderColor: "border-l-emerald-400", iconColor: "text-emerald-500", badgeBg: "bg-emerald-500/10", badgeBorder: "border-emerald-500/30", badgeText: "text-emerald-600", icon: <GraduationCap className="h-3.5 w-3.5" /> },
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
  const day = now.getDay();
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

  const now = new Date();
  const [startH, startM] = event.time.split(":").map(Number);
  const startMinutes = startH * 60 + startM;

  let endMinutes = startMinutes + 60;
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

  const todayEvents = useMemo(() => {
    const events = weekEvents.filter((e) => e.dayIndex === todayIndex);
    return events.sort((a, b) => {
      const statusA = getEventStatus(a, todayIndex);
      const statusB = getEventStatus(b, todayIndex);
      const order: Record<EventStatus, number> = { live: 0, upcoming: 1, past: 2 };
      if (order[statusA] !== order[statusB]) return order[statusA] - order[statusB];
      const [ah, am] = a.time.split(":").map(Number);
      const [bh, bm] = b.time.split(":").map(Number);
      return (ah * 60 + am) - (bh * 60 + bm);
    });
  }, [todayIndex]);

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
      <div>
        <h1 className="text-2xl font-bold text-primary">Treinamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe a programação semanal de lives, treinamentos e eventos especiais.
        </p>
      </div>

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

      {todayEvents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-primary fill-primary/20" />
              Hoje – {DAYS_FULL[todayIndex]}, {formatDateBR(today)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TodayCarousel events={todayEvents} todayIndex={todayIndex} />
          </CardContent>
        </Card>
      )}

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
                        <span className={cfg.iconColor}>{cfg.icon}</span>
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

          <div className="space-y-2" style={{ minHeight: "340px" }}>
            {filteredEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum evento neste dia.
              </p>
            ) : selectedDay === null ? (
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
                      <div key={dayIdx} className="flex gap-3 items-stretch">
                        <div className="flex items-center min-w-[36px]">
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
/*  Today Carousel                                                     */
/* ------------------------------------------------------------------ */

function TodayCarousel({ events, todayIndex }: { events: WeekEvent[]; todayIndex: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [overflows, setOverflows] = useState(false);

  const getCardWidth = useCallback(() => {
    if (!scrollRef.current) return 200 + 16;
    const firstChild = scrollRef.current.firstElementChild as HTMLElement | null;
    if (!firstChild) return 200 + 16;
    return firstChild.offsetWidth + 16; // card width + gap
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: index * getCardWidth(), behavior: "smooth" });
  }, [getCardWidth]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const cw = getCardWidth();
    const idx = Math.round(scrollRef.current.scrollLeft / cw);
    setActiveIndex(Math.min(idx, events.length - 1));
  }, [getCardWidth, events.length]);

  const checkOverflow = useCallback(() => {
    if (!scrollRef.current) return;
    setOverflows(scrollRef.current.scrollWidth > scrollRef.current.clientWidth + 4);
  }, []);

  const scrollRefCb = useCallback((node: HTMLDivElement | null) => {
    (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (!node) return;
    setOverflows(node.scrollWidth > node.clientWidth + 4);
    const ro = new ResizeObserver(() => checkOverflow());
    ro.observe(node);
  }, [checkOverflow]);

  return (
    <div className="space-y-3">
      <div
        ref={scrollRefCb}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {events.map((ev) => (
          <div key={ev.id} className="w-full sm:w-auto shrink-0" style={{ scrollSnapAlign: "start" }}>
            <TodayEventCard event={ev} todayIndex={todayIndex} />
          </div>
        ))}
      </div>

      {overflows && events.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-6 bg-foreground"
                  : "w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Today Event Card                                                   */
/* ------------------------------------------------------------------ */

function TodayEventCard({ event, todayIndex }: { event: WeekEvent; todayIndex: number }) {
  const cfg = typeConfig[event.type];
  const status = getEventStatus(event, todayIndex);
  const eventDate = getDateForDayIndex(event.dayIndex);
  const dateStr = eventDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
  const [imageOpen, setImageOpen] = useState(false);

  return (
    <>
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm flex flex-col w-full sm:w-[200px] sm:min-w-[200px] sm:max-w-[200px]">
        {event.bannerUrl && (
          <div className="relative cursor-pointer" onClick={() => setImageOpen(true)}>
            <img src={event.bannerUrl} alt={event.title} className="w-full aspect-[4/5] object-cover" />
            {status === "live" && (
              <span className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                AO VIVO
              </span>
            )}
          </div>
        )}

        <div className="p-2.5 space-y-1.5 flex-1 flex flex-col">
          <div className="flex flex-col gap-1">
            <div className="flex justify-end">
              <Badge className={`text-[10px] gap-1 shrink-0 ${cfg.badgeText} ${cfg.badgeBg} ${cfg.badgeBorder} border`}>
                {cfg.icon}
                {cfg.label}
              </Badge>
            </div>
            <p className="text-xs font-semibold text-foreground leading-snug">{event.title}</p>
          </div>

          <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 shrink-0" />
              {dateStr}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {event.time}{event.endTime ? ` – ${event.endTime}` : ""}
            </span>
          </div>

          <div className="flex-1" />

          <div className="pt-1">
            {status === "live" ? (
              <Button size="sm" className="gap-1.5 text-[11px] w-full bg-red-600 hover:bg-red-700 h-7">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                Assista ao vivo
              </Button>
            ) : status === "past" ? (
              <Button size="sm" variant="outline" className="gap-1.5 text-[11px] w-full h-7">
                <Play className="h-3 w-3" />
                Assistir gravação
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="gap-1.5 text-[11px] w-full h-7" disabled>
                <Hourglass className="h-3 w-3" />
                Em breve
              </Button>
            )}
          </div>
        </div>
      </div>

      {event.bannerUrl && (
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent className="max-w-lg p-2 bg-transparent border-0 shadow-none">
            <img src={event.bannerUrl} alt={event.title} className="w-full rounded-lg" />
          </DialogContent>
        </Dialog>
      )}
    </>
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
    <div className={`flex items-center gap-2 rounded-r-lg rounded-l-[2px] border border-border bg-card overflow-hidden border-l-[5px] ${cfg.borderColor} px-2 py-3 hover:bg-muted/50 transition-colors`}>
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

      <div className="w-px h-8 bg-border" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
        {event.host && (
          <p className="text-xs text-muted-foreground">com {event.host}</p>
        )}
      </div>

      <div className="w-px h-8 bg-border" />

      <div className="shrink-0 hidden sm:flex min-w-[72px] w-[72px] justify-center">
        {status === "live" ? (
          <Badge className="bg-red-600 text-white border-0 text-[10px] gap-1 animate-pulse">
            <Radio className="h-3 w-3" />
            Ao vivo
          </Badge>
        ) : status === "past" ? (
          <button className="flex flex-col items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1 py-1 whitespace-nowrap">
            <Play className="h-3.5 w-3.5 shrink-0" />
            <span>Gravação</span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-0.5 text-[10px] text-muted-foreground px-1 py-1 whitespace-nowrap">
            <Hourglass className="h-3.5 w-3.5 shrink-0" />
            <span>Em breve</span>
          </div>
        )}
      </div>
    </div>
  );
}
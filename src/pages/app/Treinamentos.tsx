import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, ExternalLink, Calendar, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/i18n/LanguageContext";

import type { EventType } from "@/components/app/treinamentos/types";
import { DAYS, DAYS_FULL, weekEvents, typeConfig, quickLinks } from "@/components/app/treinamentos/constants";
import { getDateForDayIndex, formatDateBR, getEventStatus } from "@/components/app/treinamentos/helpers";
import { TodayCarousel } from "@/components/app/treinamentos/TodayCarousel";
import { ScheduleEventRow, ScheduleEventCard } from "@/components/app/treinamentos/ScheduleEventRow";

export default function Treinamentos() {
  const today = new Date();
  const todayDow = today.getDay();
  const todayIndex = todayDow === 0 ? 6 : todayDow - 1;
  const isMobile = useIsMobile();
  const { t } = useLanguage();

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
      const order = { live: 0, upcoming: 1, past: 2 } as const;
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
        <h1 className="text-2xl font-bold text-primary">{t("treinamentos.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("treinamentos.subtitle")}</p>
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

      {/* Weekly schedule */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {t("treinamentos.weeklySchedule")}
              </CardTitle>
              {selectedDateLabel && (
                <p className="text-sm text-muted-foreground ml-6">{selectedDateLabel}</p>
              )}
            </div>
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as EventType | "all")}>
              <SelectTrigger className="w-auto h-8 text-xs gap-1.5 px-3 shrink-0">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder={t("treinamentos.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("treinamentos.allCategories")}</SelectItem>
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
            <TabsList className="flex w-full h-auto gap-0.5 p-0.5">
              <TabsTrigger value="all" className="text-xs px-2 flex-1 min-w-0">{t("rede.all")}</TabsTrigger>
              {DAYS.map((d, i) => (
                <TabsTrigger
                  key={i}
                  value={String(i)}
                  className="text-xs px-1.5 flex-1 min-w-0"
                >
                  {d}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="space-y-2" style={{ minHeight: "340px" }}>
            {filteredEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {t("treinamentos.noEvents")}
              </p>
            ) : selectedDay === null ? (
              (() => {
                const grouped = filteredEvents.reduce<Record<number, typeof filteredEvents>>((acc, ev) => {
                  (acc[ev.dayIndex] = acc[ev.dayIndex] || []).push(ev);
                  return acc;
                }, {});
                return Object.entries(grouped)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([dayIdx, events]) => {
                    const idx = Number(dayIdx);
                    const isToday = idx === todayIndex;

                    if (isMobile) {
                      return (
                        <div key={dayIdx} className="space-y-2">
                          <h3 className={`text-xs font-semibold uppercase tracking-wide pt-2 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                            {DAYS_FULL[idx]}
                          </h3>
                          {events.map((ev) => (
                            <ScheduleEventCard key={ev.id} event={ev} todayIndex={todayIndex} />
                          ))}
                        </div>
                      );
                    }

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
                        <div className={`flex-1 space-y-2 border-l-2 pl-3 py-2 min-w-0 ${isToday ? "border-primary/40" : "border-border"}`}>
                          {events.map((ev) => (
                            <ScheduleEventRow key={ev.id} event={ev} showDay={false} showDate todayIndex={todayIndex} />
                          ))}
                        </div>
                      </div>
                    );
                  });
              })()
            ) : (
              isMobile ? (
                filteredEvents.map((ev) => (
                  <ScheduleEventCard key={ev.id} event={ev} todayIndex={todayIndex} />
                ))
              ) : (
                filteredEvents.map((ev) => (
                  <ScheduleEventRow key={ev.id} event={ev} showDay={false} showDate todayIndex={todayIndex} />
                ))
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

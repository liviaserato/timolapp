import { Badge } from "@/components/ui/badge";
import { Clock, Play, Radio, Hourglass, Calendar } from "lucide-react";
import type { WeekEvent } from "./types";
import { typeConfig, DAYS } from "./constants";
import { getEventStatus, getDateForDayIndex } from "./helpers";

export function ScheduleEventRow({ event, showDay = false, showDate = false, todayIndex }: { event: WeekEvent; showDay?: boolean; showDate?: boolean; todayIndex: number }) {
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

      <div className="w-px h-8 bg-border hidden sm:block" />

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

/** Mobile-friendly vertical card for schedule events */
export function ScheduleEventCard({ event, todayIndex }: { event: WeekEvent; todayIndex: number }) {
  const cfg = typeConfig[event.type];
  const status = getEventStatus(event, todayIndex);
  const d = getDateForDayIndex(event.dayIndex);
  const dateLabel = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className={`rounded-r-lg rounded-l-[2px] border border-border bg-card overflow-hidden border-l-[5px] ${cfg.borderColor} p-3 space-y-2 hover:bg-muted/50 transition-colors`}>
      <p className="text-sm font-semibold text-foreground leading-snug">{event.title}</p>
      {event.host && (
        <p className="text-xs text-muted-foreground">com {event.host}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {dateLabel}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {event.time}{event.endTime ? ` – ${event.endTime}` : ""}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <Badge className={`${cfg.badgeBg} ${cfg.badgeText} border ${cfg.badgeBorder} text-[10px] gap-1`}>
          {cfg.icon}
          {cfg.label}
        </Badge>
        {status === "live" ? (
          <Badge className="bg-red-600 text-white border-0 text-[10px] gap-1 animate-pulse">
            <Radio className="h-3 w-3" />
            Ao vivo
          </Badge>
        ) : status === "past" ? (
          <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            <Play className="h-3 w-3" />
            Gravação
          </button>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Hourglass className="h-3 w-3" />
            Em breve
          </span>
        )}
      </div>
    </div>
  );
}

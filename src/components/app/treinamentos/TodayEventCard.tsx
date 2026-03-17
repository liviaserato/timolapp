import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, Clock, Play, Hourglass } from "lucide-react";
import type { WeekEvent } from "./types";
import { typeConfig } from "./constants";
import { getEventStatus, getDateForDayIndex } from "./helpers";

export function TodayEventCard({ event, todayIndex }: { event: WeekEvent; todayIndex: number }) {
  const cfg = typeConfig[event.type];
  const status = getEventStatus(event, todayIndex);
  const eventDate = getDateForDayIndex(event.dayIndex);
  const dateStr = eventDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
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
          <p className="text-xs font-semibold text-foreground leading-snug">{event.title}</p>

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

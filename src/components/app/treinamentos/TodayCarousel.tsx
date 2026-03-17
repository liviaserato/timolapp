import { useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WeekEvent } from "./types";
import { TodayEventCard } from "./TodayEventCard";

export function TodayCarousel({ events, todayIndex }: { events: WeekEvent[]; todayIndex: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [overflows, setOverflows] = useState(false);

  const getCardWidth = useCallback(() => {
    if (!scrollRef.current) return 216;
    const firstChild = scrollRef.current.firstElementChild as HTMLElement | null;
    if (!firstChild) return 216;
    return firstChild.offsetWidth + 16;
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const clamped = Math.max(0, Math.min(index, events.length - 1));
    scrollRef.current.scrollTo({ left: clamped * getCardWidth(), behavior: "smooth" });
  }, [getCardWidth, events.length]);

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

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < events.length - 1;

  return (
    <div className="space-y-3">
      {/* Prev / Next navigation - only when overflow */}
      {overflows && events.length > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground px-2"
            disabled={!canPrev}
            onClick={() => scrollToIndex(activeIndex - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </Button>
          <span className="text-[11px] text-muted-foreground">
            {activeIndex + 1} / {events.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground px-2"
            disabled={!canNext}
            onClick={() => scrollToIndex(activeIndex + 1)}
          >
            Próximo
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <div
        ref={scrollRefCb}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {events.map((ev) => (
          <div key={ev.id} className="w-full sm:w-auto shrink-0" style={{ scrollSnapAlign: "start" }}>
            <TodayEventCard event={ev} todayIndex={todayIndex} />
          </div>
        ))}
      </div>
    </div>
  );
}

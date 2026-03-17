import type { WeekEvent, EventStatus } from "./types";

export function getMondayOfCurrentWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getDateForDayIndex(dayIndex: number): Date {
  const monday = getMondayOfCurrentWeek();
  const d = new Date(monday);
  d.setDate(monday.getDate() + dayIndex);
  return d;
}

export function formatDateBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function getEventStatus(event: WeekEvent, todayIndex: number): EventStatus {
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

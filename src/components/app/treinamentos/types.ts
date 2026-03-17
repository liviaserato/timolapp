export type EventType = "produto" | "negocio" | "especial" | "treinamento";

export interface WeekEvent {
  id: string;
  dayIndex: number;
  time: string;
  endTime?: string;
  title: string;
  type: EventType;
  host?: string;
  bannerUrl?: string;
}

export type EventStatus = "live" | "past" | "upcoming";

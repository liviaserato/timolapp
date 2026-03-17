import { Presentation, Tv, Sparkles, GraduationCap, Youtube, Video } from "lucide-react";
import iconWhatsapp from "@/assets/icon-logo-whatsapp.svg";
import bannerMock from "@/assets/banner-treinamento-mock.png";
import bannerMock2 from "@/assets/banner-treinamento-mock-2.png";
import type { EventType, WeekEvent } from "./types";

export const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const DAYS_FULL = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

export const weekEvents: WeekEvent[] = [
  { id: "1", dayIndex: 0, time: "08:50", endTime: "10:00", title: "Aulas de produtos e franquias", type: "produto", host: "Lucas Rocha", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { id: "2", dayIndex: 0, time: "20:30", endTime: "21:30", title: "Treinamento: Primeiros Passos", type: "treinamento", host: "Maria Souza", youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
  { id: "10", dayIndex: 1, time: "14:00", endTime: "15:00", title: "Live Especial – Novidades 2025", type: "especial", host: "Fernanda Lima", bannerUrl: bannerMock, youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { id: "11", dayIndex: 1, time: "16:00", endTime: "17:00", title: "Negócio: Expansão Regional", type: "negocio", host: "Carlos Lima", bannerUrl: bannerMock2, youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
  { id: "3", dayIndex: 1, time: "00:00", endTime: "23:59", title: "Aulas de produtos e franquias", type: "negocio", host: "Lucas Rocha", bannerUrl: bannerMock },
  { id: "4", dayIndex: 1, time: "20:30", endTime: "21:30", title: "Construindo uma Rede Forte", type: "especial", host: "Ana Costa", bannerUrl: bannerMock2, youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { id: "5", dayIndex: 2, time: "19:00", endTime: "20:00", title: "Treinamento: Técnicas de Venda", type: "treinamento", host: "Pedro Alves", youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
  { id: "6", dayIndex: 3, time: "19:00", endTime: "20:00", title: "Live Produto – Linha Premium", type: "produto", host: "João Silva" },
  { id: "7", dayIndex: 3, time: "20:30", endTime: "21:30", title: "Live Negócio – Marketing Digital", type: "negocio", host: "Carlos Lima", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { id: "8", dayIndex: 4, time: "19:00", endTime: "20:00", title: "Especial: Depoimentos de Sucesso", type: "especial", host: "Ana Costa" },
  { id: "9", dayIndex: 5, time: "10:00", endTime: "11:00", title: "Treinamento: Liderança", type: "treinamento", host: "Maria Souza", youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
];

export const typeConfig: Record<EventType, { label: string; borderColor: string; iconColor: string; badgeBg: string; badgeBorder: string; badgeText: string; icon: React.ReactNode }> = {
  produto:     { label: "Produto",     borderColor: "border-l-[#006DFF]",   iconColor: "text-[#006DFF]",   badgeBg: "bg-[#006DFF]/10", badgeBorder: "border-[#006DFF]/30", badgeText: "text-[#006DFF]", icon: <Presentation className="h-3.5 w-3.5" /> },
  negocio:     { label: "Negócio",     borderColor: "border-l-[#003885]",   iconColor: "text-[#003885]",   badgeBg: "bg-[#003885]/10", badgeBorder: "border-[#003885]/30", badgeText: "text-[#003885]", icon: <Tv className="h-3.5 w-3.5" /> },
  especial:    { label: "Especial",    borderColor: "border-l-amber-300",   iconColor: "text-amber-400",   badgeBg: "bg-amber-400/10", badgeBorder: "border-amber-400/30", badgeText: "text-amber-500", icon: <Sparkles className="h-3.5 w-3.5" /> },
  treinamento: { label: "Treinamento", borderColor: "border-l-emerald-400", iconColor: "text-emerald-500", badgeBg: "bg-emerald-500/10", badgeBorder: "border-emerald-500/30", badgeText: "text-emerald-600", icon: <GraduationCap className="h-3.5 w-3.5" /> },
};

export const quickLinks = [
  { label: "Canal YouTube",    icon: <Youtube className="h-5 w-5" />,                                     url: "#", color: "text-red-600" },
  { label: "Sala Google Meet", icon: <Video className="h-5 w-5" />,                                       url: "#", color: "text-green-600" },
  { label: "TimolFlix",        icon: <Tv className="h-5 w-5" />,                                          url: "#", color: "text-primary" },
  { label: "WhatsApp",         icon: <img src={iconWhatsapp} alt="" className="h-5 w-5" />,                url: "#", color: "" },
];

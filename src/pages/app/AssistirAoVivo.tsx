import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Radio, Play, ExternalLink, MessageSquare } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { weekEvents } from "@/components/app/treinamentos/constants";
import { getEventStatus } from "@/components/app/treinamentos/helpers";

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

export default function AssistirAoVivo() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const today = new Date();
  const todayDow = today.getDay();
  const todayIndex = todayDow === 0 ? 6 : todayDow - 1;

  const event = useMemo(() => weekEvents.find((e) => e.id === eventId), [eventId]);

  if (!event || !event.youtubeUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-muted-foreground">Evento não encontrado ou sem vídeo disponível.</p>
        <Button variant="outline" onClick={() => navigate("/app/treinamentos")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const videoId = extractYouTubeId(event.youtubeUrl);
  const status = getEventStatus(event, todayIndex);
  const isLive = status === "live";
  const embedDomain = window.location.hostname;

  const playerUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${embedDomain}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/treinamentos")} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-foreground truncate">{event.title}</h1>
            {isLive ? (
              <Badge className="bg-red-600 text-white border-0 text-[10px] gap-1 animate-pulse shrink-0">
                <Radio className="h-3 w-3" />
                Ao Vivo
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] gap-1 shrink-0">
                <Play className="h-3 w-3" />
                Gravação
              </Badge>
            )}
          </div>
          {event.host && (
            <p className="text-sm text-muted-foreground">com {event.host}</p>
          )}
        </div>
      </div>

      {/* Player + Chat layout */}
      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-4`} style={{ minHeight: isMobile ? undefined : "calc(100vh - 220px)" }}>
        {/* YouTube Player */}
        <div className={isMobile ? "w-full" : "flex-[7] min-w-0"}>
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={playerUrl}
              title={event.title}
              className="absolute inset-0 w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Chat panel — only for live events */}
        {isLive && (
          <div className={isMobile ? "w-full" : "flex-[3] min-w-[280px]"}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Chat ao vivo
                </span>
                <a
                  href={`https://www.youtube.com/live_chat?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  Abrir em nova aba
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex-1 rounded-lg border border-border overflow-hidden bg-card" style={{ minHeight: isMobile ? "400px" : "100%" }}>
                <iframe
                  src={chatUrl}
                  title="YouTube Live Chat"
                  className="w-full h-full"
                  style={{ minHeight: isMobile ? "400px" : "500px" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Radio, Play, ExternalLink, MessageSquare, ClipboardList } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center gap-4 py-20 bg-[#0f1117] min-h-screen">
        <p className="text-neutral-400">Evento não encontrado ou sem vídeo disponível.</p>
        <Button variant="outline" onClick={() => navigate("/app/treinamentos")} className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
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

  const descriptionBlock = (
    <div className="space-y-4 pt-3">
      <div>
        <h2 className="text-sm font-semibold text-neutral-200">Sobre esta aula</h2>
        <p className="text-sm text-neutral-400 leading-relaxed mt-1">
          Nesta aula exclusiva, vamos abordar os fundamentos essenciais dos nossos produtos e o funcionamento do modelo de franquias Timol.
          Você vai aprender estratégias práticas de apresentação, entender os diferenciais competitivos da linha e descobrir como
          potencializar seus resultados dentro da rede. Ideal para quem está começando ou deseja reciclar seus conhecimentos.
        </p>
      </div>
      <div className="rounded-lg border border-neutral-700/60 bg-neutral-800/50 p-3 flex items-start gap-3">
        <ClipboardList className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-neutral-200">Sua opinião é muito importante!</p>
          <p className="text-xs text-neutral-400 leading-relaxed mt-0.5">
            Ao final da aula, responda nossa pesquisa de satisfação e nos conte o que achou. Seu feedback nos ajuda a melhorar
            cada vez mais o conteúdo e a experiência dos treinamentos. Leva menos de 1 minuto!
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#0f1117] -m-6 p-4 md:p-6 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/treinamentos")} className="shrink-0 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-neutral-100 truncate">{event.title}</h1>
            {isLive ? (
              <Badge className="bg-red-600 text-white border-0 text-[10px] gap-1 animate-pulse shrink-0">
                <Radio className="h-3 w-3" />
                Ao Vivo
              </Badge>
            ) : (
              <Badge className="bg-neutral-700 text-neutral-300 border-0 text-[10px] gap-1 shrink-0">
                <Play className="h-3 w-3" />
                Gravação
              </Badge>
            )}
          </div>
          {event.host && (
            <p className="text-sm text-neutral-500">com {event.host}</p>
          )}
        </div>
      </div>

      {/* Desktop: player + chat side by side, description below player */}
      {!isMobile ? (
        <div className="flex flex-row gap-4" style={{ minHeight: "calc(100vh - 220px)" }}>
          {/* Left column: player + description */}
          <div className="flex-[7] min-w-0 flex flex-col">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={playerUrl}
                title={event.title}
                className="absolute inset-0 w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {descriptionBlock}
          </div>

          {/* Right column: chat */}
          {isLive && (
            <div className="flex-[3] min-w-[280px] flex flex-col">
              <div className="flex-1 rounded-lg border border-neutral-700/60 overflow-hidden bg-neutral-900" style={{ minHeight: "100%" }}>
                <iframe
                  src={chatUrl}
                  title="YouTube Live Chat"
                  className="w-full h-full"
                  style={{ minHeight: "500px" }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  Chat ao vivo
                </span>
                <a
                  href={`https://www.youtube.com/live_chat?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition-colors"
                >
                  Abrir em nova aba
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Mobile/Tablet: player → description → chat */
        <div className="flex flex-col gap-4">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={playerUrl}
              title={event.title}
              className="absolute inset-0 w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {descriptionBlock}

          {isLive && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  Chat ao vivo
                </span>
                <a
                  href={`https://www.youtube.com/live_chat?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition-colors"
                >
                  Abrir em nova aba
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="rounded-lg border border-neutral-700/60 overflow-hidden bg-neutral-900" style={{ minHeight: "400px" }}>
                <iframe
                  src={chatUrl}
                  title="YouTube Live Chat"
                  className="w-full h-full"
                  style={{ minHeight: "400px" }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

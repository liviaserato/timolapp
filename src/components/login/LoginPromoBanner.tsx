import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Droplets, TrendingUp, GraduationCap } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";


interface Props {
  className?: string;
}

const PROMO_IMAGE_PATH = "/promo-banner.jpg";

export const LoginPromoBanner = ({ className }: Props) => {
  const { t } = useLanguage();
  const [promoImage, setPromoImage] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setPromoImage(PROMO_IMAGE_PATH);
    img.onerror = () => setPromoImage(null);
    img.src = PROMO_IMAGE_PATH;
  }, []);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio: "840 / 1200", fontFamily: "'Poppins', sans-serif" }}
    >
      {/* === Text-based default banner === */}
      <div
        className="absolute inset-0 flex flex-col justify-between"
        style={{
          background:
            "linear-gradient(165deg, hsl(214 100% 20%) 0%, hsl(214 100% 30%) 40%, hsl(214 80% 24%) 100%)",
          padding: "clamp(24px, 6.6%, 80px)",
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 1px, transparent 1px),
                              radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2) 1px, transparent 1px)`,
            backgroundSize: "40px 40px, 60px 60px",
          }}
        />

        {/* Content blocks with glowing separators */}
        <div className="relative z-10 flex-1 flex flex-col justify-center gap-6">
          <ContentBlock
            icon={<Droplets className="h-8 w-8 lg:h-10 lg:w-10" />}
            title={t("banner.block1.title")}
            text={t("banner.block1.text")}
          />

          <GlowSeparator />

          <ContentBlock
            icon={<TrendingUp className="h-8 w-8 lg:h-10 lg:w-10" />}
            title={t("banner.block2.title")}
            text={t("banner.block2.text")}
          />

          <GlowSeparator />

          <ContentBlock
            icon={<GraduationCap className="h-8 w-8 lg:h-10 lg:w-10" />}
            title={t("banner.block3.title")}
            text={t("banner.block3.text")}
          />
        </div>

        {/* Bottom: Hashtag with Breathing font */}
        <div className="relative z-10 text-center">
          <p className="text-2xl lg:text-3xl font-extrabold tracking-wide">
            <span
              style={{
                color: "hsl(0 0% 100%)",
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              #
            </span>
            <span
              style={{
                color: "hsl(0 0% 100%)",
                fontFamily: "'Breathing', cursive",
                fontSize: "1.1em",
                textShadow:
                  "0 0 20px hsla(199, 100%, 72%, 0.6), 0 0 40px hsla(199, 100%, 72%, 0.3), 0 2px 12px rgba(0,56,133,0.5)",
              }}
            >
              VemSerTimol
            </span>
          </p>
        </div>
      </div>

      {/* === Image overlay === */}
      {promoImage && (
        <img
          src={promoImage}
          alt="Promoção Timol"
          className="absolute inset-0 w-full h-full object-cover z-20"
        />
      )}
    </div>
  );
};

/* ---- Sub-components ---- */

const ContentBlock = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) => (
  <div className="flex gap-4 items-start" style={{ transform: "rotate(-2deg)" }}>
    <div className="shrink-0 pt-0.5" style={{ color: "hsl(199 100% 72%)" }}>
      {icon}
    </div>
    <div className="space-y-1">
      <h3
        className="text-base lg:text-lg font-bold leading-tight"
        style={{ color: "hsl(0 0% 100%)", fontFamily: "'Poppins', sans-serif" }}
      >
        {title}
      </h3>
      <p
        className="text-sm lg:text-base leading-snug opacity-80"
        style={{ color: "hsl(0 0% 100%)", fontFamily: "'Poppins', sans-serif" }}
      >
        {text}
      </p>
    </div>
  </div>
);

const GlowSeparator = () => (
  <div className="relative h-4 my-0.5 overflow-hidden">
    <svg
      viewBox="0 0 680 16"
      preserveAspectRatio="none"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <line
        x1="0"
        y1="14"
        x2="680"
        y2="2"
        stroke="hsl(199 100% 72%)"
        strokeWidth="2"
        strokeOpacity="0.5"
        strokeLinecap="round"
        filter="url(#glow)"
      />
    </svg>
  </div>
);

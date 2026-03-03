import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Droplets, TrendingUp, GraduationCap } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import timolFavicon from "@/assets/favicon-timol-azul-escuro.svg";

interface Props {
  className?: string;
}

// Try loading a custom promo image; if it exists, overlay it
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
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{ aspectRatio: "840 / 1200" }}
    >
      {/* === Text-based default banner (always rendered) === */}
      <div
        className="absolute inset-0 flex flex-col justify-between"
        style={{
          background: "linear-gradient(165deg, hsl(214 100% 20%) 0%, hsl(214 100% 30%) 40%, hsl(214 80% 24%) 100%)",
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

        {/* Top: favicon + title */}
        <div className="relative z-10 text-center space-y-4">
          <div className="flex justify-center">
            <img
              src={timolFavicon}
              alt="Timol"
              className="h-8 lg:h-10 brightness-0 invert opacity-90"
            />
          </div>
          <h2
            className="text-lg lg:text-xl font-bold leading-snug tracking-tight"
            style={{ color: "hsl(0 0% 100%)" }}
          >
            {t("banner.title.line1")}
            <br />
            <span
              className="text-xl lg:text-2xl"
              style={{ color: "hsl(199 100% 72%)" }}
            >
              {t("banner.title.line2")}
            </span>
          </h2>
        </div>

        {/* Middle: 3 content blocks with diagonal separators */}
        <div className="relative z-10 flex-1 flex flex-col justify-center gap-2 my-4">
          <ContentBlock
            icon={<Droplets className="h-5 w-5 lg:h-6 lg:w-6" />}
            title={t("banner.block1.title")}
            text={t("banner.block1.text")}
          />

          <DiagonalSeparator />

          <ContentBlock
            icon={<TrendingUp className="h-5 w-5 lg:h-6 lg:w-6" />}
            title={t("banner.block2.title")}
            text={t("banner.block2.text")}
          />

          <DiagonalSeparator />

          <ContentBlock
            icon={<GraduationCap className="h-5 w-5 lg:h-6 lg:w-6" />}
            title={t("banner.block3.title")}
            text={t("banner.block3.text")}
          />
        </div>

        {/* Bottom: Hashtag */}
        <div className="relative z-10 text-center">
          <p
            className="text-2xl lg:text-3xl font-extrabold tracking-wide"
            style={{
              color: "hsl(199 100% 72%)",
              textShadow: "0 2px 12px rgba(0,56,133,0.5)",
            }}
          >
            #VemSerTimol
          </p>
        </div>
      </div>

      {/* === Image overlay (covers text banner if present) === */}
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
  <div className="flex gap-3 items-start">
    <div
      className="shrink-0 rounded-lg p-2"
      style={{ background: "hsla(199, 100%, 72%, 0.15)" }}
    >
      <div style={{ color: "hsl(199 100% 72%)" }}>{icon}</div>
    </div>
    <div className="space-y-0.5">
      <h3
        className="text-sm lg:text-base font-bold leading-tight"
        style={{ color: "hsl(0 0% 100%)" }}
      >
        {title}
      </h3>
      <p
        className="text-xs lg:text-sm leading-snug opacity-75"
        style={{ color: "hsl(0 0% 100%)" }}
      >
        {text}
      </p>
    </div>
  </div>
);

const DiagonalSeparator = () => (
  <div className="relative h-4 my-1 overflow-hidden">
    <svg
      viewBox="0 0 680 16"
      preserveAspectRatio="none"
      className="w-full h-full"
      aria-hidden="true"
    >
      <line
        x1="0"
        y1="14"
        x2="680"
        y2="2"
        stroke="hsl(199 100% 72%)"
        strokeWidth="3"
        strokeOpacity="0.3"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

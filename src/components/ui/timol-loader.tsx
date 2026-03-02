import { cn } from "@/lib/utils";
import produtosSeparados from "@/assets/produtos-loader-transparent.png";

interface TimolLoaderProps {
  className?: string;
  size?: number;
}

export const TimolLoader = ({ className, size = 20 }: TimolLoaderProps) => {
  const w = size;
  const h = size * 1.3;

  return (
    <div
      className={cn("timol-loader relative inline-flex items-end justify-center", className)}
      style={{ width: w, height: h }}
      aria-label="Carregando…"
    >
      {/* SVG bottle behind products */}
      <svg
        width={w}
        height={h}
        viewBox="0 0 20 26"
        fill="none"
        className="absolute inset-0 z-[1]"
      >
        {/* Water fill - animated via CSS clipPath (behind products) */}
        <path
          d="M7 1h6v3l2.5 3.5c.8 1 1.5 2 1.5 3.2V22a3 3 0 01-3 3H6a3 3 0 01-3-3V10.7c0-1.2.7-2.2 1.5-3.2L7 4V1z"
          fill="hsl(var(--primary))"
          opacity="0.15"
          className="timol-loader-fill"
        />
        {/* Wave on top of water */}
        <path
          d="M3.5 16c1.5-1 3-1.5 5-.5s4 .5 5.5-.5"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          opacity="0.35"
          className="timol-loader-wave"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Products image - in front of water, behind bottle outline */}
      <img
        src={produtosSeparados}
        alt=""
        aria-hidden="true"
        className="absolute z-[2] object-contain pointer-events-none"
        style={{
          width: w * 0.68,
          height: h * 0.62,
          bottom: h * 0.01,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      {/* Bottle outline on top of everything */}
      <svg
        width={w}
        height={h}
        viewBox="0 0 20 26"
        fill="none"
        className="relative z-[3]"
      >
        <path
          d="M7 1h6v3l2.5 3.5c.8 1 1.5 2 1.5 3.2V22a3 3 0 01-3 3H6a3 3 0 01-3-3V10.7c0-1.2.7-2.2 1.5-3.2L7 4V1z"
          stroke="hsl(var(--primary))"
          strokeWidth="1.4"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Cap */}
        <rect x="6.5" y="0" width="7" height="2" rx="0.8" fill="hsl(var(--primary))" opacity="0.5" />
      </svg>
    </div>
  );
};

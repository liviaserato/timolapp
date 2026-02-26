import { cn } from "@/lib/utils";

interface TimolLoaderProps {
  className?: string;
  size?: number;
}

export const TimolLoader = ({ className, size = 20 }: TimolLoaderProps) => {
  const w = size;
  const h = size * 1.3;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 20 26"
      fill="none"
      className={cn("timol-loader", className)}
      aria-label="Carregando…"
    >
      {/* Bottle outline */}
      <path
        d="M7 1h6v3l2.5 3.5c.8 1 1.5 2 1.5 3.2V22a3 3 0 01-3 3H6a3 3 0 01-3-3V10.7c0-1.2.7-2.2 1.5-3.2L7 4V1z"
        stroke="hsl(var(--primary))"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Cap */}
      <rect x="6.5" y="0" width="7" height="2" rx="0.8" fill="hsl(var(--primary))" opacity="0.5" />
      {/* Water fill - animated via CSS clipPath */}
      <path
        d="M7 1h6v3l2.5 3.5c.8 1 1.5 2 1.5 3.2V22a3 3 0 01-3 3H6a3 3 0 01-3-3V10.7c0-1.2.7-2.2 1.5-3.2L7 4V1z"
        fill="hsl(var(--primary))"
        opacity="0.25"
        className="timol-loader-fill"
      />
      {/* Wave on top of water */}
      <path
        d="M3.5 16c1.5-1 3-1.5 5-.5s4 .5 5.5-.5"
        stroke="hsl(var(--primary))"
        strokeWidth="1"
        opacity="0.4"
        className="timol-loader-wave"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

import { TimolLoader } from "@/components/ui/timol-loader";
import { cn } from "@/lib/utils";

interface FullScreenTimolLoaderProps {
  title: string;
  hint?: string;
  size?: number;
  mode?: "overlay" | "page";
  className?: string;
}

export const FullScreenTimolLoader = ({
  title,
  hint,
  size = 56,
  mode = "overlay",
  className,
}: FullScreenTimolLoaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 text-center",
        mode === "overlay"
          ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          : "min-h-screen",
        className,
      )}
    >
      <TimolLoader size={size} />
      <p className="mt-6 text-lg font-semibold text-foreground">{title}</p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
};

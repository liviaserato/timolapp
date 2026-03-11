import { type LucideIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
  tooltip?: string;
  id?: string;
  headerRight?: React.ReactNode;
}

export function DashboardCard({ icon: Icon, title, children, className, tooltip, id, headerRight }: DashboardCardProps) {
  return (
    <fieldset id={id} className={cn(
      "relative rounded-[10px] border border-app-card-border bg-card p-4 shadow-sm min-w-0 flex flex-col",
      headerRight ? "overflow-visible" : "overflow-hidden",
      className
    )}>
      <legend className="flex items-center gap-2 px-1 text-base font-bold text-primary">
        <Icon className="h-5 w-5 shrink-0" />
        <span className="shrink-0">{title}</span>
        {tooltip && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button type="button" className="inline-flex cursor-help" aria-label={tooltip}>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[220px] text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </legend>
      {headerRight && (
        <div className="absolute top-0 right-4 -translate-y-[60%]">
          {headerRight}
        </div>
      )}
      {children}
    </fieldset>
  );
}

import { type LucideIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
  tooltip?: string;
}

export function DashboardCard({ icon: Icon, title, children, className, tooltip }: DashboardCardProps) {
  return (
    <fieldset className={cn(
      "rounded-[10px] border border-app-card-border bg-card p-4 shadow-sm",
      className
    )}>
      <legend className="flex items-center gap-2 px-1 text-base font-bold text-primary">
        <Icon className="h-5 w-5" />
        {title}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="inline-flex" aria-label={tooltip}>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[220px] text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </legend>
      {children}
    </fieldset>
  );
}

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function DashboardCard({ icon: Icon, title, children, className }: DashboardCardProps) {
  return (
    <fieldset className={cn(
      "rounded-[10px] border border-app-card-border bg-card p-4 shadow-sm",
      className
    )}>
      <legend className="flex items-center gap-2 px-1 text-base font-bold text-primary">
        <Icon className="h-5 w-5" />
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

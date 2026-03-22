import { useLocation, Link } from "react-router-dom";
import { LogOut, LayoutDashboard, Users, FileText, Settings, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInternalSidebarState } from "@/pages/InternalLayout";
import { logout } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";

const navItems = [
  { labelKey: "internal.nav.dashboard", path: "/internal", icon: LayoutDashboard },
  { labelKey: "internal.nav.registrations", path: "/internal/cadastros", icon: FileText },
  { labelKey: "internal.nav.franchisees", path: "/internal/franqueados", icon: Users },
  { labelKey: "internal.nav.permissions", path: "/internal/permissoes", icon: ShieldCheck },
];

const bottomItems = [
  { labelKey: "internal.nav.settings", path: "/internal/configuracoes", icon: Settings },
];

interface InternalSidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function InternalSidebarNav({ collapsed = false, onNavigate }: InternalSidebarNavProps) {
  const { pathname } = useLocation();
  const { t } = useLanguage();

  const isActive = (path: string) => {
    if (path === "/internal") return pathname === "/internal";
    return pathname.startsWith(path);
  };

  const navItemClass =
    "flex h-11 items-center gap-3 px-4 text-[15px] font-medium leading-none text-primary-foreground/90 transition-colors hover:bg-[hsl(var(--app-sidebar-hover))] whitespace-nowrap overflow-hidden border-l-[3px] border-transparent";

  const renderLink = (item: { labelKey: string; path: string; icon: React.ComponentType<{ className?: string }> }) => {
    const label = t(item.labelKey);
    const Icon = item.icon;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onNavigate}
        title={collapsed ? label : undefined}
        className={cn(
          navItemClass,
          isActive(item.path) && "bg-[hsl(var(--app-sidebar-hover))] text-primary-foreground font-semibold border-l-primary-foreground"
        )}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          <Icon className="h-5 w-5" />
        </span>
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Staff badge */}
      <div className="px-4 py-3">
        <div className={cn(
          "flex items-center gap-2 rounded-md bg-primary-foreground/10 px-3 py-1.5 text-xs font-bold text-primary-foreground uppercase tracking-wider",
          collapsed && "justify-center px-1"
        )}>
          <ShieldCheck className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Staff</span>}
        </div>
      </div>

      <nav className="flex flex-col py-1 flex-1">
        {navItems.map(renderLink)}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto">
        <div className="mx-3 border-t border-primary-foreground/20" />
        <nav className="flex flex-col py-2">
          {bottomItems.map(renderLink)}
          <button
            onClick={() => {
              onNavigate?.();
              logout();
            }}
            title={collapsed ? t("nav.sair") : undefined}
            className={navItemClass}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              <LogOut className="h-5 w-5 shrink-0" />
            </span>
            {!collapsed && <span>{t("nav.sair")}</span>}
          </button>
        </nav>
      </div>
    </div>
  );
}

export function InternalSidebar() {
  const { expanded } = useInternalSidebarState();

  return (
    <aside
      style={{ scrollbarWidth: "none" }}
      className={cn(
        "hidden md:flex flex-col shrink-0 overflow-y-auto overflow-x-hidden bg-app-sidebar transition-[width] duration-200 ease-in-out [&::-webkit-scrollbar]:hidden",
        expanded ? "w-[200px]" : "w-[60px]"
      )}
    >
      <InternalSidebarNav collapsed={!expanded} />
    </aside>
  );
}

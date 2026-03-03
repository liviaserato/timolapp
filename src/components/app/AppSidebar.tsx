import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  UserCog,
  Building2,
  Network,
  Users,
  GraduationCap,
  Package,
  ShoppingCart,
  DollarSign,
  Briefcase,
  BarChart3,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Painel Inicial", icon: LayoutDashboard, path: "/app" },
  { label: "Cadastro", icon: UserCog, path: "/app/cadastro" },
  { label: "Franquia", icon: Building2, path: "/app/franquia" },
  { label: "Rede", icon: Network, path: "/app/rede" },
  { label: "Clientes", icon: Users, path: "/app/clientes" },
  { label: "Treinamentos", icon: GraduationCap, path: "/app/treinamentos" },
  { label: "Produtos", icon: Package, path: "/app/produtos" },
  { label: "Pedidos", icon: ShoppingCart, path: "/app/pedidos" },
  { label: "Financeiro", icon: DollarSign, path: "/app/financeiro" },
  { label: "Comercial", icon: Briefcase, path: "/app/comercial" },
  { label: "Relatórios", icon: BarChart3, path: "/app/relatorios" },
  { label: "Suporte", icon: LifeBuoy, path: "/app/suporte" },
];

interface AppSidebarNavProps {
  onNavigate?: () => void;
}

export function AppSidebarNav({ onNavigate }: AppSidebarNavProps) {
  const { pathname } = useLocation();

  const isActive = (path: string) => {
    if (path === "/app") return pathname === "/app";
    return pathname.startsWith(path);
  };

  return (
    <nav className="flex flex-col py-3">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-primary-foreground/90 text-[15px] font-medium transition-colors hover:bg-[hsl(var(--app-sidebar-hover))]",
            isActive(item.path) && "bg-[hsl(var(--app-sidebar-hover))] text-primary-foreground font-semibold"
          )}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden lg:block sticky top-[70px] h-[calc(100vh-70px)] w-[200px] overflow-y-auto bg-app-sidebar">
      <AppSidebarNav />
    </aside>
  );
}

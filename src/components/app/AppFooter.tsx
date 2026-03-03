import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, DollarSign, Users, Network, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const footerItems = [
  { label: "Pedidos", icon: ShoppingCart, path: "/app/pedidos" },
  { label: "Financeiro", icon: DollarSign, path: "/app/financeiro" },
  { label: "Clientes", icon: Users, path: "/app/clientes" },
  { label: "Rede", icon: Network, path: "/app/rede" },
  { label: "FAT", icon: GraduationCap, path: "/app/treinamentos" },
];

export function AppFooter() {
  const { pathname } = useLocation();

  return (
    <footer className="sticky bottom-0 z-30 flex h-[70px] items-center justify-center bg-gradient-to-b from-app-header to-app-header-gradient shadow-[0_-2px_4px_rgba(0,0,0,0.08)] lg:hidden">
      <nav className="flex w-full max-w-[820px] items-center justify-between px-4">
        {footerItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-2 text-[11px] text-primary-foreground/80 hover:text-primary-foreground transition-colors",
              pathname.startsWith(item.path) && "text-primary-foreground font-semibold"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  );
}

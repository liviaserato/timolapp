import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, DollarSign, Users, Network, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

import iconPedidos from "@/assets/icon-sidebar-pedidos.svg";
import iconFinanceiro from "@/assets/icon-sidebar-financeiro.svg";
import iconClientes from "@/assets/icon-sidebar-clientes.svg";

const footerItems = [
  { label: "Pedidos", iconSvg: iconPedidos, path: "/app/pedidos" },
  { label: "Financeiro", iconSvg: iconFinanceiro, path: "/app/financeiro" },
  { label: "Clientes", iconSvg: iconClientes, path: "/app/clientes" },
  { label: "Rede", iconLucide: Network, path: "/app/rede" },
  { label: "FAT", iconLucide: GraduationCap, path: "/app/treinamentos" },
];

export function AppFooter() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < lastScrollY.current) {
        // scrolling up → show
        setVisible(true);
      } else if (currentY > lastScrollY.current && currentY > 100) {
        // scrolling down past threshold → hide
        setVisible(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 flex h-[70px] items-center justify-center bg-gradient-to-b from-app-header to-app-header-gradient shadow-[0_-2px_4px_rgba(0,0,0,0.08)] lg:hidden transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
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
            {item.iconSvg ? (
              <img src={item.iconSvg} alt="" className="h-5 w-5" />
            ) : item.iconLucide ? (
              <item.iconLucide className="h-5 w-5" />
            ) : null}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  );
}

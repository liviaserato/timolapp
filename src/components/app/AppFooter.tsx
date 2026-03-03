import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

import iconPedidos from "@/assets/icon-sidebar-pedidos.svg";
import iconFinanceiro from "@/assets/icon-sidebar-financeiro.svg";
import iconClientes from "@/assets/icon-sidebar-clientes.svg";
import iconRede from "@/assets/icon-sidebar-rede.svg";
import iconTreinamentos from "@/assets/icon-sidebar-treinamentos.svg";

const footerItems = [
  { label: "Pedidos", icon: iconPedidos, path: "/app/pedidos" },
  { label: "Financeiro", icon: iconFinanceiro, path: "/app/financeiro" },
  { label: "Clientes", icon: iconClientes, path: "/app/clientes" },
  { label: "Rede", icon: iconRede, path: "/app/rede" },
  { label: "FAT", icon: iconTreinamentos, path: "/app/treinamentos" },
];

export function AppFooter() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const currentY = target.scrollTop;
    if (currentY < lastScrollY.current) {
      setVisible(true);
    } else if (currentY > lastScrollY.current && currentY > 100) {
      setVisible(false);
    }
    lastScrollY.current = currentY;
  }, []);

  useEffect(() => {
    // The scrollable element is the <main> inside AppLayout
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <footer
      className={cn(
        "shrink-0 z-30 flex h-[70px] items-center justify-center bg-gradient-to-b from-app-header to-app-header-gradient shadow-[0_-2px_4px_rgba(0,0,0,0.08)] md:hidden transition-transform duration-300 ease-out",
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
            <img src={item.icon} alt="" className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  );
}

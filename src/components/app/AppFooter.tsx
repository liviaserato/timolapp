import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

import iconPedidos from "@/assets/icon-sidebar-pedidos.svg";
import iconFinanceiro from "@/assets/icon-sidebar-financeiro.svg";
import iconClientes from "@/assets/icon-sidebar-clientes.svg";
import iconRede from "@/assets/icon-sidebar-rede.svg";
import iconTreinamentos from "@/assets/icon-sidebar-treinamentos.svg";

const footerItems = [
  { labelKey: "nav.financeiro", icon: iconFinanceiro, path: "/app/financeiro" },
  { labelKey: "nav.pedidos", icon: iconPedidos, path: "/app/pedidos" },
  { labelKey: "nav.clientes", icon: iconClientes, path: "/app/clientes" },
  { labelKey: "nav.rede", icon: iconRede, path: "/app/rede" },
  { labelKey: "nav.fat", icon: iconTreinamentos, path: "/app/treinamentos" },
];

export function AppFooter() {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const [visible, setVisible] = useState(true);
  const hasScrolled = useRef(false);
  const lastScrollY = useRef(0);

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const currentY = target.scrollTop;
    const atBottom = target.scrollHeight - target.clientHeight - currentY < 10;

    if (!hasScrolled.current && currentY > 0) {
      hasScrolled.current = true;
    }
    if (!hasScrolled.current) return;

    if (atBottom || currentY <= 0) {
      setVisible(true);
    } else if (currentY < lastScrollY.current) {
      setVisible(true);
    } else if (currentY > lastScrollY.current) {
      setVisible(false);
    }
    lastScrollY.current = currentY;
  }, []);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <footer
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      className={cn(
        "shrink-0 z-30 flex min-h-[70px] items-center justify-center bg-gradient-to-b from-app-header to-app-header-gradient shadow-[0_-2px_4px_rgba(0,0,0,0.08)] md:hidden transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <nav className="flex w-full max-w-[820px] items-center justify-between px-4">
        {footerItems.map((item) => {
          const label = t(item.labelKey);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group flex flex-1 flex-col items-center justify-center gap-1.5 text-[11px] text-primary-foreground/80 hover:text-primary-foreground transition-colors",
                pathname.startsWith(item.path) && "text-primary-foreground font-semibold"
              )}
            >
              <img src={item.icon} alt="" className="h-6 w-6" />
              <span className={cn(
                "border-b border-transparent transition-all duration-200 group-hover:border-primary-foreground/60 pb-0.5",
                pathname.startsWith(item.path) && "border-primary-foreground"
              )}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}

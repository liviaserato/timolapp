import { useLocation, Link, useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInternalSidebarState } from "@/pages/InternalLayout";
import { logout } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";

import iconPainelInicial from "@/assets/icon-sidebar-painel-inicial.svg";
import iconCadastro from "@/assets/icon-sidebar-cadastro.svg";
import iconRede from "@/assets/icon-sidebar-rede.svg";
import iconClientes from "@/assets/icon-sidebar-clientes.svg";
import iconProdutos from "@/assets/icon-sidebar-produtos.svg";
import iconPedidos from "@/assets/icon-sidebar-pedidos.svg";
import iconFinanceiro from "@/assets/icon-sidebar-financeiro.svg";
import iconComercial from "@/assets/icon-sidebar-comercial.svg";
import iconRelatorios from "@/assets/icon-sidebar-relatorios.svg";
import iconTreinamentos from "@/assets/icon-sidebar-treinamentos.svg";
import iconSuporte from "@/assets/icon-sidebar-suporte.svg";
import iconConfiguracoes from "@/assets/icon-sidebar-configuracoes.svg";

const navItems = [
  { labelKey: "nav.dashboard", path: "/internal", icon: iconPainelInicial },
  { labelKey: "nav.cadastro", path: "/internal/cadastros", icon: iconCadastro },
  { labelKey: "nav.financeiro", path: "/internal/financeiro", icon: iconFinanceiro },
  { labelKey: "nav.rede", path: "/internal/rede", icon: iconRede },
  { labelKey: "nav.clientes", path: "/internal/clientes", icon: iconClientes },
  { labelKey: "nav.produtos", path: "/internal/produtos", icon: iconProdutos },
  { labelKey: "nav.pedidos", path: "/internal/pedidos", icon: iconPedidos },
  { labelKey: "nav.treinamentos", path: "/internal/treinamentos", icon: iconTreinamentos },
  { labelKey: "nav.comercial", path: "/internal/comercial", icon: iconComercial },
  { labelKey: "nav.relatorios", path: "/internal/relatorios", icon: iconRelatorios },
  { labelKey: "nav.suporte", path: "/internal/suporte", icon: iconSuporte },
];

const bottomItems = [
  { labelKey: "nav.configuracoes", path: "/internal/configuracoes", icon: iconConfiguracoes },
];

interface InternalSidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function InternalSidebarNav({ collapsed = false, onNavigate }: InternalSidebarNavProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const isActive = (path: string) => {
    if (path === "/internal") return pathname === "/internal";
    return pathname.startsWith(path);
  };

  const navItemClass =
    "flex h-11 items-center gap-3 px-4 text-[15px] font-medium leading-none text-primary-foreground/90 transition-colors hover:bg-[hsl(var(--app-sidebar-hover))] whitespace-nowrap overflow-hidden border-l-[3px] border-transparent";

  const renderLink = (item: { labelKey: string; path: string; icon: string }) => {
    const label = t(item.labelKey);
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
          <img src={item.icon} alt="" className="h-5 w-5 object-contain" />
        </span>
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Spacer */}
      <div className="py-2" />

      <nav className="flex flex-col py-1 flex-1">
        {navItems.map(renderLink)}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto">
        {/* Separator */}
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
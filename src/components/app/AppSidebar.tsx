import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/pages/AppLayout";
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
  { labelKey: "nav.dashboard", path: "/app", icon: iconPainelInicial },
  { labelKey: "nav.cadastro", path: "/app/cadastro", icon: iconCadastro },
  { labelKey: "nav.financeiro", path: "/app/financeiro", icon: iconFinanceiro },
  { labelKey: "nav.rede", path: "/app/rede", icon: iconRede },
  { labelKey: "nav.clientes", path: "/app/clientes", icon: iconClientes },
  { labelKey: "nav.produtos", path: "/app/produtos", icon: iconProdutos },
  { labelKey: "nav.pedidos", path: "/app/pedidos", icon: iconPedidos },
  { labelKey: "nav.comercial", path: "/app/comercial", icon: iconComercial },
  { labelKey: "nav.relatorios", path: "/app/relatorios", icon: iconRelatorios },
  { labelKey: "nav.treinamentos", path: "/app/treinamentos", icon: iconTreinamentos },
  { labelKey: "nav.suporte", path: "/app/suporte", icon: iconSuporte },
];

const bottomItems = [
  { labelKey: "nav.configuracoes", path: "/app/configuracoes", icon: iconConfiguracoes },
];

interface AppSidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function AppSidebarNav({ collapsed = false, onNavigate }: AppSidebarNavProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const isActive = (path: string) => {
    if (path === "/app") return pathname === "/app";
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
      <nav className="flex flex-col py-3 flex-1">
        {navItems.map(renderLink)}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto">
        {/* Atualização Cadastral button */}
        <div className="mx-3 mb-2">
          <Link
            to="/app/atualizacao-cadastral"
            onClick={onNavigate}
            title={collapsed ? t("nav.atualizacaoCadastral") : undefined}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors",
              "bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25",
              isActive("/app/atualizacao-cadastral") && "bg-primary-foreground/25"
            )}
          >
            {!collapsed && <span>{t("nav.atualizacaoCadastral")}</span>}
            {collapsed && <span className="text-[10px]">Atual.</span>}
          </Link>
        </div>

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

export function AppSidebar() {
  const { expanded } = useSidebarState();

  return (
    <aside
      style={{ scrollbarWidth: 'none' }}
      className={cn(
        "hidden md:flex flex-col shrink-0 overflow-y-auto overflow-x-hidden bg-app-sidebar transition-[width] duration-200 ease-in-out [&::-webkit-scrollbar]:hidden",
        expanded ? "w-[200px]" : "w-[60px]"
      )}
    >
      <AppSidebarNav collapsed={!expanded} />
    </aside>
  );
}

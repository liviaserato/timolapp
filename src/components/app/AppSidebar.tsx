import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/pages/AppLayout";

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

const navItems = [
  { label: "Painel Inicial", path: "/app", icon: iconPainelInicial },
  { label: "Cadastro", path: "/app/cadastro", icon: iconCadastro },
  { label: "Rede", path: "/app/rede", icon: iconRede },
  { label: "Clientes", path: "/app/clientes", icon: iconClientes },
  { label: "Treinamentos", path: "/app/treinamentos", icon: iconTreinamentos },
  { label: "Produtos", path: "/app/produtos", icon: iconProdutos },
  { label: "Pedidos", path: "/app/pedidos", icon: iconPedidos },
  { label: "Financeiro", path: "/app/financeiro", icon: iconFinanceiro },
  { label: "Comercial", path: "/app/comercial", icon: iconComercial },
  { label: "Relatórios", path: "/app/relatorios", icon: iconRelatorios },
  { label: "Suporte", path: "/app/suporte", icon: iconSuporte },
];

interface AppSidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function AppSidebarNav({ collapsed = false, onNavigate }: AppSidebarNavProps) {
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
          title={collapsed ? item.label : undefined}
          className={cn(
            "flex items-center gap-3 py-3 text-primary-foreground/90 text-[15px] font-medium transition-colors hover:bg-[hsl(var(--app-sidebar-hover))] whitespace-nowrap overflow-hidden",
            collapsed ? "justify-center px-0" : "px-4",
            isActive(item.path) && "bg-[hsl(var(--app-sidebar-hover))] text-primary-foreground font-semibold"
          )}
        >
          <img src={item.icon} alt="" className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </Link>
      ))}
    </nav>
  );
}

export function AppSidebar() {
  const { expanded } = useSidebarState();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 overflow-y-auto overflow-x-hidden bg-app-sidebar transition-[width] duration-200 ease-in-out",
        expanded ? "w-[200px]" : "w-[56px]"
      )}
    >
      <AppSidebarNav collapsed={!expanded} />
    </aside>
  );
}

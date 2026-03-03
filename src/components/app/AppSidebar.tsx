import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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

type NavIcon = { type: "svg"; src: string };

const navItems: { label: string; path: string; icon: NavIcon }[] = [
  { label: "Painel Inicial", path: "/app", icon: { type: "svg", src: iconPainelInicial } },
  { label: "Cadastro", path: "/app/cadastro", icon: { type: "svg", src: iconCadastro } },
  { label: "Rede", path: "/app/rede", icon: { type: "svg", src: iconRede } },
  { label: "Clientes", path: "/app/clientes", icon: { type: "svg", src: iconClientes } },
  { label: "Treinamentos", path: "/app/treinamentos", icon: { type: "svg", src: iconTreinamentos } },
  { label: "Produtos", path: "/app/produtos", icon: { type: "svg", src: iconProdutos } },
  { label: "Pedidos", path: "/app/pedidos", icon: { type: "svg", src: iconPedidos } },
  { label: "Financeiro", path: "/app/financeiro", icon: { type: "svg", src: iconFinanceiro } },
  { label: "Comercial", path: "/app/comercial", icon: { type: "svg", src: iconComercial } },
  { label: "Relatórios", path: "/app/relatorios", icon: { type: "svg", src: iconRelatorios } },
  { label: "Suporte", path: "/app/suporte", icon: { type: "svg", src: iconSuporte } },
];

interface AppSidebarNavProps {
  onNavigate?: () => void;
}

function NavItemIcon({ icon }: { icon: NavIcon }) {
  return <img src={icon.src} alt="" className="h-5 w-5 shrink-0" />;
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
          <NavItemIcon icon={item.icon} />
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

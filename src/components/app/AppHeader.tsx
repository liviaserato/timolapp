import { Link, useNavigate } from "react-router-dom";
import { Menu, ChevronDown, User, Star, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebarState } from "@/pages/AppLayout";
import { useFranchise } from "@/contexts/FranchiseContext";
import { supabase } from "@/integrations/supabase/client";
import timolLogoBranco from "@/assets/logo-timol-branco.svg";
import iconSuporte from "@/assets/icon-sidebar-suporte.svg";
import iconCadastro from "@/assets/icon-sidebar-cadastro.svg";
import iconConfiguracoes from "@/assets/icon-sidebar-configuracoes.svg";

export function AppHeader() {
  const navigate = useNavigate();
  const { toggle } = useSidebarState();
  const { profiles, selected, setSelectedId, hasMultiple } = useFranchise();

  return (
    <header className="shrink-0 z-30 flex h-[70px] items-center justify-between gap-4 bg-gradient-to-b from-app-header to-app-header-gradient px-5 pr-6 shadow-sm">
      {/* Left: toggle + logo */}
      <div className="flex items-center gap-4">
        {/* Desktop/Tablet sidebar toggle - hidden on mobile */}
        <button
          onClick={toggle}
          className="hidden md:inline-flex items-center justify-center text-primary-foreground hover:text-primary-foreground/80 transition-colors"
          aria-label="Alternar menu lateral"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link to="/app" className="block">
          <img
            src={timolLogoBranco}
            alt="Timol"
            className="h-[clamp(28px,7vw,40px)] w-auto object-contain"
          />
        </Link>
      </div>

      {/* Center: title (desktop only) */}
      <p className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-lg font-semibold text-primary-foreground hidden lg:block">
        Escritório Digital
      </p>

      {/* Right: user info + avatar */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Name + ID — whole block triggers ID switcher when multiple */}
        {hasMultiple ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-end gap-0.5 hover:opacity-90 transition-opacity">
                <span className="text-sm font-semibold text-primary-foreground leading-tight md:whitespace-nowrap">
                  <span className="hidden md:inline">{selected?.name ?? "Usuário"}</span>
                  <span className="inline md:hidden">
                    {selected?.name
                      ? selected.name.split(" ").slice(0, 2).join(" ")
                      : "Usuário"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-primary-foreground/75">
                  <span>ID {selected?.franchiseId}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-85" />
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {profiles.map((p) => (
                <DropdownMenuItem
                  key={p.franchiseId}
                  onClick={() => setSelectedId(p.franchiseId)}
                  className={p.franchiseId === selected?.franchiseId ? "font-semibold bg-accent" : ""}
                >
                  ID {p.franchiseId}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-sm font-semibold text-primary-foreground leading-tight md:whitespace-nowrap">
              <span className="hidden md:inline">{selected?.name ?? "Usuário"}</span>
              <span className="inline md:hidden">
                {selected?.name
                  ? selected.name.split(" ").slice(0, 2).join(" ")
                  : "Usuário"}
              </span>
            </span>
            <span className="text-xs text-primary-foreground/75">
              ID {selected?.franchiseId}
            </span>
          </div>
        )}

        {/* Avatar + badge + stars */}
        <div className="relative">
          {/* Mobile: avatar opens menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex h-10 w-10 items-center justify-center rounded-md bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 transition-colors">
                  <User className="h-5 w-5" />
                  <span className="absolute -top-1 -right-2 text-xs">💎</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuItem asChild>
                  <Link to="/app/cadastro" className="flex items-center gap-2">
                    <img src={iconCadastro} alt="" className="h-4 w-4 invert-0 brightness-0" /> Meus Dados
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/suporte" className="flex items-center gap-2">
                    <img src={iconSuporte} alt="" className="h-4 w-4 invert-0 brightness-0" /> Fale Conosco
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/configuracoes" className="flex items-center gap-2">
                    <img src={iconConfiguracoes} alt="" className="h-4 w-4 invert-0 brightness-0" /> Configurações
                  </Link>
                </DropdownMenuItem>
                <div className="mx-1 my-1 h-px bg-muted" />
                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/");
                  }}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop/Tablet: avatar is static (no menu) */}
          <div className="hidden md:flex relative h-10 w-10 items-center justify-center rounded-md bg-primary-foreground/20 text-primary-foreground">
            <User className="h-5 w-5" />
            <span className="absolute -top-1 -right-2 text-xs">💎</span>
          </div>

          {/* Stars */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+2px)] flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-[7px] w-[7px] fill-warning text-warning" />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

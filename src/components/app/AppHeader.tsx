import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ChevronDown, User, Building2, MessageCircle, Settings, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AppSidebarNav } from "./AppSidebar";
import timolLogoLight from "@/assets/logo-timol-azul-claro.svg";

interface AppHeaderProps {
  userName?: string;
  userId?: string;
}

export function AppHeader({ userName = "Lívia Serato", userId = "31" }: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between gap-4 bg-gradient-to-b from-app-header to-app-header-gradient px-5 pr-6 shadow-sm">
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="hidden max-lg:inline-flex items-center justify-center text-primary-foreground"
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[220px] bg-app-sidebar p-0 border-0">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <div className="pt-4">
              <AppSidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/app" className="block">
          <img
            src={timolLogoLight}
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
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-semibold text-primary-foreground max-w-[110px] truncate leading-tight">
            {userName}
          </span>

          {/* ID Switch */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 text-xs text-primary-foreground/75 hover:text-primary-foreground transition-colors">
                <span>ID {userId}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-85" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[100px]">
              <DropdownMenuItem>ID 1</DropdownMenuItem>
              <DropdownMenuItem>ID 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Avatar + badge + stars + menu */}
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-md bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 transition-colors">
                <User className="h-5 w-5" />
                {/* Diamond badge */}
                <span className="absolute -top-1 -right-2 text-xs">💎</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              <DropdownMenuItem asChild>
                <Link to="/app/cadastro" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Meus Dados
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/franquia" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Minha Franquia
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/suporte" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> Fale Conosco
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/configuracoes" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Configurações
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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

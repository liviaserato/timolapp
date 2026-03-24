import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, ChevronDown, User, Star, LogOut, Store, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebarState } from "@/pages/AppLayout";
import { useFranchise } from "@/contexts/FranchiseContext";
import { logout, getUserRole } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";
import timolLogoBranco from "@/assets/logo-timol-branco.svg";
import iconSuporte from "@/assets/icon-sidebar-suporte.svg";
import iconCadastro from "@/assets/icon-sidebar-cadastro.svg";
import iconConfiguracoes from "@/assets/icon-sidebar-configuracoes.svg";

// Maps route segments between /app and /internal when they differ
const routeMap: Record<string, string> = {
  "cadastro": "cadastros",
  "cadastros": "cadastro",
};

function mapRoute(currentPath: string, fromPrefix: string, toPrefix: string): string {
  const segment = currentPath.replace(fromPrefix, "").replace(/^\//, "");
  if (!segment) return toPrefix;
  const mapped = routeMap[segment] ?? segment;
  return `${toPrefix}/${mapped}`;
}

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggle } = useSidebarState();
  const { profiles, selected, setSelectedId, hasMultiple } = useFranchise();
  const { t, language, setLanguage } = useLanguage();

  const role = getUserRole();
  const isAdmin = role === "admin" || role === "superadmin";
  const isInternalView = location.pathname.startsWith("/internal");

  return (
    <header style={{ paddingTop: "env(safe-area-inset-top, 0px)" }} className="shrink-0 z-30 flex min-h-[70px] items-center justify-between gap-4 bg-gradient-to-b from-app-header to-app-header-gradient px-5 pr-6 shadow-sm">
      {/* Left: toggle + logo + admin switcher */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="hidden md:inline-flex items-center justify-center text-primary-foreground hover:text-primary-foreground/80 transition-colors"
          aria-label={t("header.toggleSidebar")}
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

        {/* Admin environment switcher — radio style */}
        {isAdmin && (
          <div className="hidden md:flex flex-col gap-0.5 ml-2 rounded-lg bg-primary-foreground/10 px-3 py-1.5">
            <label
              onClick={() => { if (isInternalView) navigate(mapRoute(location.pathname, "/internal", "/app")); }}
              className="flex items-center gap-2 cursor-pointer text-xs text-primary-foreground hover:text-primary-foreground/90 transition-colors"
            >
              <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${!isInternalView ? "border-primary-foreground bg-primary-foreground" : "border-primary-foreground/50"}`}>
                {!isInternalView && <span className="h-1.5 w-1.5 rounded-full bg-app-sidebar" />}
              </span>
              <Store className="h-3 w-3" />
              <span className="font-medium">Franqueado</span>
            </label>
            <label
              onClick={() => { if (!isInternalView) navigate(mapRoute(location.pathname, "/app", "/internal")); }}
              className="flex items-center gap-2 cursor-pointer text-xs text-primary-foreground hover:text-primary-foreground/90 transition-colors"
            >
              <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${isInternalView ? "border-primary-foreground bg-primary-foreground" : "border-primary-foreground/50"}`}>
                {isInternalView && <span className="h-1.5 w-1.5 rounded-full bg-app-sidebar" />}
              </span>
              <ShieldCheck className="h-3 w-3" />
              <span className="font-medium">Equipe Interna</span>
            </label>
          </div>
        )}
      </div>

      {/* Center: title (desktop only) */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-3">
        <p className="pointer-events-none whitespace-nowrap text-lg font-semibold text-primary-foreground">
          {t("header.digitalOffice")}
        </p>
      </div>

      {/* Right: user info + avatar */}
      <div className="flex items-center gap-4 shrink-0">
        {hasMultiple ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-end gap-0.5 hover:opacity-90 transition-opacity">
                <span className="text-sm font-semibold text-primary-foreground leading-tight md:whitespace-nowrap">
                  <span className="hidden md:inline">{selected?.name ?? t("header.user")}</span>
                  <span className="inline md:hidden">
                    {selected?.name
                      ? selected.name.split(" ").slice(0, 2).join(" ")
                      : t("header.user")}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-primary-foreground/75">
                  <span>ID {selected?.franchiseId}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-85" />
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-0 w-auto">
              {profiles.map((p) => (
                <DropdownMenuItem
                  key={p.franchiseId}
                  onClick={() => setSelectedId(p.franchiseId)}
                  className={`text-right ${p.franchiseId === selected?.franchiseId ? "font-semibold bg-accent" : ""}`}
                >
                  ID {p.franchiseId}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-sm font-semibold text-primary-foreground leading-tight md:whitespace-nowrap">
              <span className="hidden md:inline">{selected?.name ?? t("header.user")}</span>
              <span className="inline md:hidden">
                {selected?.name
                  ? selected.name.split(" ").slice(0, 2).join(" ")
                  : t("header.user")}
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
              <DropdownMenuContent align="end" sideOffset={12} className="min-w-[160px]">
                <DropdownMenuItem asChild>
                  <Link to="/app/cadastro" className="flex items-center gap-2">
                    <img src={iconCadastro} alt="" className="h-4 w-4 invert-0 brightness-0" /> {t("header.myData")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/suporte" className="flex items-center gap-2">
                    <img src={iconSuporte} alt="" className="h-4 w-4 invert-0 brightness-0" /> {t("nav.suporte")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/configuracoes" className="flex items-center gap-2">
                    <img src={iconConfiguracoes} alt="" className="h-4 w-4 invert-0 brightness-0" /> {t("nav.configuracoes")}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <div className="mx-1 my-1 h-px bg-muted" />
                    <DropdownMenuItem
                      onClick={() => navigate(isInternalView
                        ? mapRoute(location.pathname, "/internal", "/app")
                        : mapRoute(location.pathname, "/app", "/internal")
                      )}
                      className="flex items-center gap-2"
                    >
                      {isInternalView ? (
                        <><Store className="h-4 w-4" /> Franqueado</>
                      ) : (
                        <><ShieldCheck className="h-4 w-4" /> Equipe Interna</>
                      )}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> {t("nav.sair")}
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
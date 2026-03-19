import { useState, createContext, useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/app/AppHeader";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppFooter } from "@/components/app/AppFooter";
import { FranchiseProvider } from "@/contexts/FranchiseContext";
import { InviteProvider } from "@/contexts/InviteContext";

interface SidebarContextType {
  expanded: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType>({ expanded: true, toggle: () => {} });

export function useSidebarState() {
  return useContext(SidebarContext);
}

export default function AppLayout() {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const isImmersive = location.pathname.includes("/treinamentos/ao-vivo/");

  return (
    <SidebarContext.Provider value={{ expanded, toggle: () => setExpanded((v) => !v) }}>
      <FranchiseProvider>
        <InviteProvider>
          <div className="h-screen flex flex-col overflow-hidden bg-app-page-bg">
            <AppHeader />
            <div className="flex flex-1 min-h-0">
              <AppSidebar />
              <main className={`flex-1 ${isImmersive ? "overflow-hidden md:overflow-y-auto bg-[#0f1117]" : "overflow-y-auto p-6 pb-24 md:pb-6"}`}>
                <div className={`w-full mx-auto ${isImmersive ? "h-full md:h-auto" : "max-w-[900px]"}`}>
                  <Outlet />
                </div>
              </main>
            </div>
            <AppFooter />
          </div>
        </InviteProvider>
      </FranchiseProvider>
    </SidebarContext.Provider>
  );
}

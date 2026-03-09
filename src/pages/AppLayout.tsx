import { useState, createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/app/AppHeader";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppFooter } from "@/components/app/AppFooter";
import { FranchiseProvider } from "@/contexts/FranchiseContext";

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

  return (
    <SidebarContext.Provider value={{ expanded, toggle: () => setExpanded((v) => !v) }}>
      <FranchiseProvider>
        <div className="h-screen flex flex-col overflow-hidden bg-app-page-bg">
          <AppHeader />
          <div className="flex flex-1 min-h-0">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
              <div className="w-full max-w-[900px] mx-auto">
                <Outlet />
              </div>
            </main>
          </div>
          <AppFooter />
        </div>
      </FranchiseProvider>
    </SidebarContext.Provider>
  );
}

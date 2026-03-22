import { useState, createContext, useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/app/AppHeader";
import { InternalSidebar } from "@/components/internal/InternalSidebar";
import { AppFooter } from "@/components/app/AppFooter";

interface SidebarContextType {
  expanded: boolean;
  toggle: () => void;
}

const InternalSidebarContext = createContext<SidebarContextType>({ expanded: true, toggle: () => {} });

export function useInternalSidebarState() {
  return useContext(InternalSidebarContext);
}

export default function InternalLayout() {
  const [expanded, setExpanded] = useState(true);

  return (
    <InternalSidebarContext.Provider value={{ expanded, toggle: () => setExpanded((v) => !v) }}>
      <div className="h-screen flex flex-col overflow-hidden bg-app-page-bg">
        <AppHeader />
        <div className="flex flex-1 min-h-0">
          <InternalSidebar />
          <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
            <div className="w-full mx-auto max-w-[900px]">
              <Outlet />
            </div>
          </main>
        </div>
        <AppFooter />
      </div>
    </InternalSidebarContext.Provider>
  );
}

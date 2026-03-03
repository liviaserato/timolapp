import { useState, createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/app/AppHeader";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppFooter } from "@/components/app/AppFooter";

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
      <div className="h-screen flex flex-col overflow-hidden bg-app-page-bg">
        {/* Header - fixed, never scrolls */}
        <AppHeader />

        {/* Body: sidebar + scrollable content */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar (hidden on mobile < 768px) */}
          <AppSidebar />

          {/* Main content - only this scrolls */}
          <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
            <div className="w-full max-w-[900px]">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Footer (mobile only, smart hide/show) */}
        <AppFooter />
      </div>
    </SidebarContext.Provider>
  );
}

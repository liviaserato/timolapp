import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/app/AppHeader";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppFooter } from "@/components/app/AppFooter";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-app-page-bg">
      {/* Header - always fixed at top */}
      <AppHeader />

      <div className="flex flex-1">
        {/* Sidebar (desktop only) */}
        <AppSidebar />

        {/* Main content - add bottom padding on mobile for fixed footer */}
        <main className="flex-1 min-h-0 w-full p-6 pb-24 lg:pb-6 lg:max-w-[900px]">
          <Outlet />
        </main>
      </div>

      {/* Footer (mobile only, smart hide/show) */}
      <AppFooter />
    </div>
  );
}

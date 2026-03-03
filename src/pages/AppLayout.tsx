import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/app/AppHeader";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppFooter } from "@/components/app/AppFooter";

export default function AppLayout() {
  return (
    <div className="min-h-screen grid grid-cols-1 grid-rows-[70px_1fr_70px] lg:grid-cols-[200px_1fr] lg:grid-rows-[70px_1fr] bg-app-page-bg">
      {/* Header spans full width */}
      <div className="col-span-full">
        <AppHeader />
      </div>

      {/* Sidebar (desktop only) */}
      <AppSidebar />

      {/* Main content */}
      <main className="min-h-0 w-full p-6 lg:max-w-[900px]">
        <Outlet />
      </main>

      {/* Footer (mobile only) */}
      <div className="col-span-full lg:hidden">
        <AppFooter />
      </div>
    </div>
  );
}

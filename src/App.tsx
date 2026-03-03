import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Contract from "./pages/Contract";
import Continue from "./pages/Continue";
import PendingRegistrations from "./pages/PendingRegistrations";
import EmailPreviews from "./pages/EmailPreviews";
import AppLayout from "./pages/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import SectionPlaceholder from "./pages/app/SectionPlaceholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/cadastro" element={<Index />} />
            <Route path="/contrato" element={<Contract />} />
            <Route path="/continue/:token" element={<Continue />} />
            <Route path="/pendentes" element={<PendingRegistrations />} />
            <Route path="/emails" element={<EmailPreviews />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path=":section" element={<SectionPlaceholder />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

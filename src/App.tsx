import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthGate } from "@/components/auth/AuthGate";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Continue from "./pages/Continue";
import PendingRegistrations from "./pages/PendingRegistrations";

import AppLayout from "./pages/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import Cadastro from "./pages/app/Cadastro";
import Financeiro from "./pages/app/Financeiro";
import Suporte from "./pages/app/Suporte";
import Pedidos from "./pages/app/Pedidos";
import RealizarPedido from "./pages/app/RealizarPedido";
import Checkout from "./pages/app/Checkout";
import OrderPayment from "./pages/app/OrderPayment";
import SectionPlaceholder from "./pages/app/SectionPlaceholder";
import EmailPreviews from "./pages/app/EmailPreviews";
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
            <Route path="/" element={<AuthGate mode="guest"><Login /></AuthGate>} />
            <Route path="/cadastro" element={<Index />} />
            <Route path="/contrato" element={<Navigate to="/cadastro?contract=1" replace />} />
            <Route path="/continue/:token" element={<Continue />} />
            <Route path="/pendentes" element={<AuthGate mode="protected"><PendingRegistrations /></AuthGate>} />
            
            <Route path="/app" element={<AuthGate mode="protected"><AppLayout /></AuthGate>}>
              <Route index element={<Dashboard />} />
              <Route path="cadastro" element={<Cadastro />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="pedidos/realizar" element={<RealizarPedido />} />
              <Route path="pedidos/checkout" element={<Checkout />} />
              <Route path="pedidos/pagamento" element={<OrderPayment />} />
              <Route path="suporte" element={<Suporte />} />
              <Route path="configuracoes/emails" element={<EmailPreviews />} />
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

import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthGate } from "@/components/auth/AuthGate";
import { FullScreenTimolLoader } from "@/components/ui/full-screen-timol-loader";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Continue from "./pages/Continue";
import PendingRegistrations from "./pages/PendingRegistrations";

import AppLayout from "./pages/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import Cadastro from "./pages/app/Cadastro";
import Financeiro from "./pages/app/Financeiro";
import Suporte from "./pages/app/Suporte";
import Treinamentos from "./pages/app/Treinamentos";
import Pedidos from "./pages/app/Pedidos";
import RealizarPedido from "./pages/app/RealizarPedido";
import Checkout from "./pages/app/Checkout";
import OrderPayment from "./pages/app/OrderPayment";
import PaymentSelection from "./pages/app/PaymentSelection";
import SectionPlaceholder from "./pages/app/SectionPlaceholder";
import EmailPreviews from "./pages/app/EmailPreviews";
import AssistirAoVivo from "./pages/app/AssistirAoVivo";
import Rede from "./pages/app/Rede";
import Clientes from "./pages/app/Clientes";
import AtualizacaoCadastral from "./pages/app/AtualizacaoCadastral";
import Configuracoes from "./pages/app/Configuracoes";
import NotFound from "./pages/NotFound";

// Lazy-loaded internal (staff) pages — separate bundle
const InternalLayout = lazy(() => import("./pages/InternalLayout"));
const InternalDashboard = lazy(() => import("./pages/internal/InternalDashboard"));
const InternalCadastros = lazy(() => import("./pages/internal/InternalCadastros"));
const InternalFinanceiro = lazy(() => import("./pages/internal/InternalFinanceiro"));
const InternalRede = lazy(() => import("./pages/internal/InternalRede"));
const InternalClientes = lazy(() => import("./pages/internal/InternalClientes"));
const InternalProdutos = lazy(() => import("./pages/internal/InternalProdutos"));
const InternalPedidos = lazy(() => import("./pages/internal/InternalPedidos"));
const InternalTreinamentos = lazy(() => import("./pages/internal/InternalTreinamentos"));
const InternalComercial = lazy(() => import("./pages/internal/InternalComercial"));
const InternalRelatorios = lazy(() => import("./pages/internal/InternalRelatorios"));
const InternalSuporte = lazy(() => import("./pages/internal/InternalSuporte"));
const InternalConfiguracoes = lazy(() => import("./pages/internal/InternalConfiguracoes"));

const LazyFallback = () => (
  <FullScreenTimolLoader mode="page" title="Carregando..." className="bg-background" />
);

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
            
            {/* Franchisee routes */}
            <Route path="/app" element={<AuthGate mode="protected" allowedRoles="franchisee"><AppLayout /></AuthGate>}>
              <Route index element={<Dashboard />} />
              <Route path="cadastro" element={<Cadastro />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="pedidos/realizar" element={<RealizarPedido />} />
              <Route path="pedidos/checkout" element={<Checkout />} />
              <Route path="pedidos/pagamento" element={<PaymentSelection />} />
              <Route path="pedidos/pagamento/processar" element={<OrderPayment />} />
              <Route path="treinamentos" element={<Treinamentos />} />
              <Route path="treinamentos/ao-vivo/:eventId" element={<AssistirAoVivo />} />
              <Route path="suporte" element={<Suporte />} />
              <Route path="rede" element={<Rede />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="configuracoes" element={<Configuracoes />} />
              <Route path="configuracoes/emails" element={<EmailPreviews />} />
              <Route path="atualizacao-cadastral" element={<AtualizacaoCadastral />} />
              <Route path=":section" element={<SectionPlaceholder />} />
            </Route>

            {/* Internal (staff) routes — lazy loaded */}
            <Route path="/internal" element={
              <AuthGate mode="protected" allowedRoles="internal">
                <Suspense fallback={<LazyFallback />}>
                  <InternalLayout />
                </Suspense>
              </AuthGate>
            }>
              <Route index element={<Suspense fallback={<LazyFallback />}><InternalDashboard /></Suspense>} />
              <Route path="cadastros" element={<Suspense fallback={<LazyFallback />}><InternalCadastros /></Suspense>} />
              <Route path="financeiro" element={<Suspense fallback={<LazyFallback />}><InternalFinanceiro /></Suspense>} />
              <Route path="rede" element={<Suspense fallback={<LazyFallback />}><InternalRede /></Suspense>} />
              <Route path="clientes" element={<Suspense fallback={<LazyFallback />}><InternalClientes /></Suspense>} />
              <Route path="produtos" element={<Suspense fallback={<LazyFallback />}><InternalProdutos /></Suspense>} />
              <Route path="pedidos" element={<Suspense fallback={<LazyFallback />}><InternalPedidos /></Suspense>} />
              <Route path="treinamentos" element={<Suspense fallback={<LazyFallback />}><InternalTreinamentos /></Suspense>} />
              <Route path="comercial" element={<Suspense fallback={<LazyFallback />}><InternalComercial /></Suspense>} />
              <Route path="relatorios" element={<Suspense fallback={<LazyFallback />}><InternalRelatorios /></Suspense>} />
              <Route path="suporte" element={<Suspense fallback={<LazyFallback />}><InternalSuporte /></Suspense>} />
              <Route path="configuracoes" element={<Suspense fallback={<LazyFallback />}><InternalConfiguracoes /></Suspense>} />
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

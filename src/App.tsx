import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RadioProvider } from "@/contexts/RadioContext";
import Index from "./pages/Index";
import ProductPage from "./pages/ProductPage";
import QuienesSomos from "./pages/QuienesSomos";
import Checkout from "./pages/Checkout";
import CheckoutPayment from "./pages/CheckoutPayment";
import CheckoutPaymentResult from "./pages/CheckoutPaymentResult";
import OrderReview from "./pages/OrderReview";
import Sucursales from "./pages/Sucursales";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PoliciesAndReturns from "./pages/PoliciesAndReturns";
import OrderTracking from "./pages/OrderTracking";
import Garantias from "./pages/Garantias";
import EmprendimientoMadedera from "./pages/EmprendimientoMadedera";
import EmprendimientoJardinPaz from "./pages/EmprendimientoJardinPaz";
import EmprendimientoRinconPacifico from "./pages/EmprendimientoRinconPacifico";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RadioProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/pago" element={<CheckoutPayment />} />
            <Route path="/checkout/pago/resultado" element={<CheckoutPaymentResult />} />
            <Route path="/compra" element={<OrderReview />} />
            <Route path="/sucursales" element={<Sucursales />} />
            <Route path="/privacidad" element={<PrivacyPolicy />} />
            <Route path="/politicas" element={<PoliciesAndReturns />} />
            <Route path="/seguimiento" element={<OrderTracking />} />
            <Route path="/garantias" element={<Garantias />} />
            <Route path="/emprendimientos/madedera" element={<EmprendimientoMadedera />} />
            <Route path="/emprendimientos/jardin-de-la-paz" element={<EmprendimientoJardinPaz />} />
            <Route path="/emprendimientos/rincon-del-pacifico" element={<EmprendimientoRinconPacifico />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RadioProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

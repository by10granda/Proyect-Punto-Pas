import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RadioProvider } from "@/contexts/RadioContext";
import Index from "./pages/Index";
import QuienesSomos from "./pages/QuienesSomos";
import Checkout from "./pages/Checkout";
import Sucursales from "./pages/Sucursales";
import PrivacyPolicy from "./pages/PrivacyPolicy";
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
            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/sucursales" element={<Sucursales />} />
            <Route path="/privacidad" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RadioProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

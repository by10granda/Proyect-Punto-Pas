import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, PackageCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const OrderTracking = () => {
  const [orderId, setOrderId] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={0} onSearch={() => {}} onCartClick={() => {}} />

      <main className="max-w-3xl mx-auto px-4 pt-10 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 md:p-10 shadow-[0_24px_45px_-30px_rgba(0,0,0,0.35)]">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#FA003F]/10 flex items-center justify-center mx-auto mb-4">
              <PackageCheck className="w-7 h-7" style={{ color: "#FA003F" }} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900" style={{ fontFamily: "Nunito, sans-serif" }}>
              Seguimiento de pedido
            </h1>
            <p className="text-slate-600 mt-3">
              Ingresa tu número de pedido para consultar el estado de tu compra.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">Número de pedido</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Ej: PP-20260505-001"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <button
                onClick={() => setSearched(true)}
                className="px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 inline-flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" /> Consultar
              </button>
            </div>

            {searched && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700 text-sm">
                {orderId.trim()
                  ? `Solicitud recibida para el pedido ${orderId.trim()}. Si el estado no se muestra en línea, nuestro equipo de soporte te confirmará por WhatsApp o llamada.`
                  : "Ingresa un número de pedido válido para consultar el estado."}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTracking;

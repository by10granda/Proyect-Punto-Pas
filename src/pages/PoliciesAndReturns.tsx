import { Link } from "react-router-dom";
import { FileCheck, RefreshCcw, PackageSearch, Store, ShieldAlert } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const PoliciesAndReturns = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={0} onSearch={() => {}} onCartClick={() => {}} />

      <main className="max-w-5xl mx-auto px-4 pt-10 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 md:p-10 shadow-[0_24px_45px_-30px_rgba(0,0,0,0.35)]">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#FA003F]/10 flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-7 h-7" style={{ color: "#FA003F" }} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900" style={{ fontFamily: "Nunito, sans-serif" }}>
              Políticas de Compra, Cancelación y Devolución
            </h1>
            <p className="text-slate-600 mt-3 max-w-3xl mx-auto">
              Estas políticas aplican a todas las compras realizadas en Punto Pas y están diseñadas para darte un proceso
              claro y seguro antes, durante y después del pago.
            </p>
          </div>

          <div className="grid gap-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                <RefreshCcw className="w-5 h-5" style={{ color: "#FA003F" }} />
                1. Cancelación de pedidos
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>La compra se paga por adelantado antes del retiro en tienda.</li>
                <li>El cliente puede solicitar la cancelación antes de que el pedido sea marcado como listo para retiro.</li>
                <li>Si el pedido ya fue marcado como listo para retiro, no aplica cancelación.</li>
                <li>Para cancelar, debe contactarse por WhatsApp o teléfono oficial con su número de pedido.</li>
                <li>El plazo máximo para retirar el pedido es de 48 horas; pasado ese tiempo, el pedido puede anularse.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                <PackageSearch className="w-5 h-5" style={{ color: "#FA003F" }} />
                2. Devoluciones
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>No se aceptan cambios ni devoluciones en ninguna compra realizada.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Store className="w-5 h-5" style={{ color: "#FA003F" }} />
                3. Retiro en tienda
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Sucursal</th>
                      <th className="text-left px-4 py-3 font-semibold">Tiempo estimado de preparación</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    <tr className="border-t border-slate-200">
                      <td className="px-4 py-3">Esmeraldas</td>
                      <td className="px-4 py-3">2 a 24 horas hábiles</td>
                    </tr>
                    <tr className="border-t border-slate-200">
                      <td className="px-4 py-3">San Lorenzo</td>
                      <td className="px-4 py-3">Próximamente</td>
                    </tr>
                    <tr className="border-t border-slate-200">
                      <td className="px-4 py-3">Stihl San Lorenzo</td>
                      <td className="px-4 py-3">Próximamente</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-slate-600 mt-4">
                Actualmente no realizamos envíos a domicilio. Todas las compras se entregan exclusivamente por retiro en tienda.
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Requisitos para retirar: cédula y número de pedido. No se permite retiro por terceros autorizados.
              </p>
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                4. Atención al cliente
              </h2>
              <p className="text-slate-700">
                Canales activos: WhatsApp 095 999 0999 y correo variedadespas2025@gmail.com. Las solicitudes se
                atienden en horario laboral y se registran para seguimiento.
              </p>
            </section>
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

export default PoliciesAndReturns;

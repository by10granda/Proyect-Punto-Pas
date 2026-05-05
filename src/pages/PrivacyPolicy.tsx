import { Link } from "react-router-dom";
import { Shield, Lock, Eye, FileText } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header 
        cartCount={0}
        onSearch={() => {}}
        onCartClick={() => {}}
      />

      <main className="max-w-5xl mx-auto px-4 pt-12 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-7 md:p-10 shadow-[0_24px_45px_-30px_rgba(0,0,0,0.35)]">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-[#FA003F]/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7" style={{ color: "#FA003F" }} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900" style={{ fontFamily: "Nunito, sans-serif" }}>
              Politica de Privacidad
            </h1>
            <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
              En Punto Pas protegemos tu informacion personal y la tratamos de forma responsable.
            </p>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 mt-4">Ultima actualizacion: Febrero 2026</p>
          </div>

          <p className="text-slate-700 leading-relaxed mb-8">
            Esta Politica de Privacidad explica como recopilamos, usamos y protegemos la informacion personal obtenida a
            traves de nuestros servicios, aplicaciones y plataformas de Punto Pas.
          </p>

          <div className="grid gap-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-7">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" style={{ color: "#FA003F" }} />
              1. Información que recopilamos
              </h2>
              <p className="text-slate-600 mb-3">Podemos recopilar la siguiente información:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-800">
                <li>Datos de contacto como nombre, número de teléfono y correo electrónico.</li>
              <li>Información de envío y facturación.</li>
              <li>Historial de compras y preferencias de productos.</li>
              <li>Información necesaria para brindar soporte o mejorar la experiencia del usuario.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-7">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: "#FA003F" }} />
              2. Uso de la información
              </h2>
              <p className="text-slate-600 mb-3">La información recopilada se utiliza para:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-800">
              <li>Procesar y enviar tus pedidos de ferretería y construcción.</li>
              <li>Proveer y mantener el funcionamiento correcto de nuestros servicios.</li>
              <li>Contactar al usuario en relación con solicitudes, pedidos o soporte técnico.</li>
              <li>Mejorar la experiencia de usuario y optimizar nuestras plataformas.</li>
              <li>Enviar promociones y ofertas especiales (con tu consentimiento).</li>
              <li>Cumplir con requisitos legales o de seguridad cuando sea necesario.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-7">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" style={{ color: "#FA003F" }} />
              3. Compartición de información
              </h2>
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 mb-4">
                <p className="text-slate-900 font-semibold">
                No compartimos, vendemos ni alquilamos información personal a terceros.
                </p>
              </div>
              <p className="text-slate-600">
              Solo compartiremos datos cuando sea estrictamente necesario para cumplir con 
              una obligación legal, procesar pagos con instituciones bancarias autorizadas, 
              o proteger nuestros derechos y los de nuestros usuarios.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-7">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" style={{ color: "#FA003F" }} />
              4. Seguridad de la información
              </h2>
              <p className="text-slate-600">
              Implementamos medidas de seguridad técnicas y organizativas adecuadas para 
              proteger los datos personales frente a accesos no autorizados, pérdida, 
              alteración o divulgación. Esto incluye encriptación SSL, firewalls y 
              acceso restringido a la información.
              </p>
            </section>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

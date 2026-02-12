import { Link } from "react-router-dom";
import { Shield, Mail, Lock, Eye, FileText } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartCount={0}
        onSearch={() => {}}
        onCartClick={() => {}}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-foreground mb-4">
            Política de Privacidad
          </h1>
          <p className="text-muted-foreground text-lg">
            En Punto Pas valoramos y respetamos la privacidad de nuestros usuarios.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Última actualización: Febrero 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-card rounded-2xl shadow-lg p-8 space-y-8">
          {/* Intro */}
          <div className="prose prose-gray max-w-none">
            <p className="text-foreground leading-relaxed">
              Esta Política de Privacidad explica cómo recopilamos, utilizamos y protegemos 
              la información personal que se obtiene a través de nuestros servicios, aplicaciones 
              y plataformas de Punto Pas.
            </p>
          </div>

          {/* Section 1 */}
          <section className="border-l-4 border-primary pl-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              1. Información que recopilamos
            </h2>
            <p className="text-muted-foreground mb-3">
              Podemos recopilar la siguiente información:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground">
              <li>Datos de contacto como nombre, número de teléfono y correo electrónico.</li>
              <li>Información de envío y facturación.</li>
              <li>Historial de compras y preferencias de productos.</li>
              <li>Información necesaria para brindar soporte o mejorar la experiencia del usuario.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="border-l-4 border-primary pl-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              2. Uso de la información
            </h2>
            <p className="text-muted-foreground mb-3">
              La información recopilada se utiliza para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground">
              <li>Procesar y enviar tus pedidos de ferretería y construcción.</li>
              <li>Proveer y mantener el funcionamiento correcto de nuestros servicios.</li>
              <li>Contactar al usuario en relación con solicitudes, pedidos o soporte técnico.</li>
              <li>Mejorar la experiencia de usuario y optimizar nuestras plataformas.</li>
              <li>Enviar promociones y ofertas especiales (con tu consentimiento).</li>
              <li>Cumplir con requisitos legales o de seguridad cuando sea necesario.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="border-l-4 border-primary pl-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              3. Compartición de información
            </h2>
            <div className="bg-primary/5 rounded-lg p-4 mb-4">
              <p className="text-foreground font-semibold">
                No compartimos, vendemos ni alquilamos información personal a terceros.
              </p>
            </div>
            <p className="text-muted-foreground">
              Solo compartiremos datos cuando sea estrictamente necesario para cumplir con 
              una obligación legal, procesar pagos con instituciones bancarias autorizadas, 
              o proteger nuestros derechos y los de nuestros usuarios.
            </p>
          </section>

          {/* Section 4 */}
          <section className="border-l-4 border-primary pl-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              4. Seguridad de la información
            </h2>
            <p className="text-muted-foreground">
              Implementamos medidas de seguridad técnicas y organizativas adecuadas para 
              proteger los datos personales frente a accesos no autorizados, pérdida, 
              alteración o divulgación. Esto incluye encriptación SSL, firewalls y 
              acceso restringido a la información.
            </p>
          </section>

          {/* Section 5 */}
          <section className="border-l-4 border-primary pl-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              5. Cambios en esta política
            </h2>
            <p className="text-muted-foreground">
              Nos reservamos el derecho de actualizar esta política en cualquier momento. 
              Los cambios serán publicados en esta misma página con su fecha de revisión. 
              Te recomendamos revisarla periódicamente.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Contacto</h2>
            <p className="text-muted-foreground mb-3">
              Si tienes preguntas sobre esta Política de Privacidad, puedes escribirnos a:
            </p>
            <div className="space-y-2">
              <p className="text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <strong>Email:</strong>{" "}
                <a href="mailto:contacto@puntopas.com" className="text-primary hover:underline">
                  contacto@puntopas.com
                </a>
              </p>
              <p className="text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <strong>Dirección:</strong> Esmeraldas, Ecuador
              </p>
            </div>
          </section>
        </div>

        {/* Back button */}
        <div className="text-center mt-8">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

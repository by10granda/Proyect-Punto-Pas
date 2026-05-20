import { MapPin, Phone, Mail, Clock, Shield, Home, Info, ShoppingCart, FileText, PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import logoPuntoPas from "@/assets/logo-punto-pas.png";
import { paymentBadges } from "@/utils/paymentBadges";

interface FooterProps {
  onCartClick?: () => void;
}

export const Footer = ({ onCartClick }: FooterProps) => {
  return (
    <footer id="contacto" className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 shadow-lg">
                <img 
                  src={logoPuntoPas} 
                  alt="Punto Pas" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">PUNTO PAS</h3>
                <p className="text-xs text-white/80 font-medium tracking-wide">ENCUENTRA TODO EN UN SOLO LUGAR</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Tu ferretería de confianza en Ecuador. Calidad, variedad y los mejores precios del mercado.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/p/Punto-Pas-100063756541859/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#1877F2] flex items-center justify-center transition-all hover:scale-110"
              >
                <img src="/Icono_de_facebook.png" alt="Facebook" className="w-5 h-5 object-contain" />
              </a>
              <a
                href="https://www.tiktok.com/@punto_pas"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-black flex items-center justify-center transition-all hover:scale-110 border border-white/20"
              >
                <img src="/tik-tok.png" alt="TikTok" className="w-5 h-5 object-contain" />
              </a>
              <a
                href="https://wa.me/593959990999"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-green-500 flex items-center justify-center transition-all hover:scale-110"
              >
                <img src="/whatsapp.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
              </a>
            </div>
          </div>
          
          {/* Navigation */}
          <div>
            <h4 className="text-base font-bold mb-5 flex items-center gap-2 text-white">
              <span className="w-8 h-1 bg-white/30 rounded-full"></span>
              Navegación
            </h4>
            <div className="space-y-3">
              <Link 
                to="/" 
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="text-white">Inicio</span>
              </Link>
              <Link 
                to="/quienes-somos" 
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <span className="text-white">Quiénes Somos</span>
              </Link>
              <Link 
                to="/sucursales" 
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="text-white">Sucursales</span>
              </Link>
              <Link
                to="/politicas"
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-white">Políticas y devoluciones</span>
              </Link>
              <Link
                to="/seguimiento"
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <PackageSearch className="w-4 h-4 text-white" />
                </div>
                <span className="text-white">Seguimiento de pedido</span>
              </Link>
              {onCartClick ? (
                <button 
                  onClick={onCartClick}
                  className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group w-full"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white">Carrito de compras</span>
                </button>
              ) : (
                <Link 
                  to="/checkout" 
                  className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white">Carrito de compras</span>
                </Link>
              )}
            </div>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-base font-bold mb-5 flex items-center gap-2 text-white">
              <span className="w-8 h-1 bg-white/30 rounded-full"></span>
              Contáctanos
            </h4>
            <div className="space-y-4">
              <a 
                href="tel:+593959990999" 
                className="flex items-start gap-3 text-white/70 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-0.5">Teléfono</p>
                  <p className="font-semibold text-white">095 999 0999</p>
                </div>
              </a>
              
              <a 
                href="mailto:variedadespas2025@gmail.com" 
                className="flex items-start gap-3 text-white/70 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-0.5">Email</p>
                  <p className="font-semibold text-white">variedadespas2025@gmail.com</p>
                </div>
              </a>
              
              <div className="flex items-start gap-3 text-white/70">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-0.5">Horario de atención</p>
                  <p className="font-semibold text-white">Lun - Sáb: 8AM - 6PM</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* WhatsApp CTA */}
          <div>
            <h4 className="text-base font-bold mb-5 flex items-center gap-2 text-white">
              <span className="w-8 h-1 bg-white/30 rounded-full"></span>
              ¿Necesitas ayuda?
            </h4>
            <p className="text-white/70 text-sm mb-4">
              Contáctanos directamente por WhatsApp para una atención personalizada.
            </p>
            <div className="flex items-center gap-3 mb-4">
              <a
                href="https://wa.me/593959990999?text=Hola,%20me%20gustaría%20obtener%20más%20información"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-green-500 flex items-center justify-center transition-all hover:scale-110"
              >
                <img src="/whatsapp.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
              </a>
              <span className="text-white font-semibold">Chatea con nosotros</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-white/70">Compra segura y protegida</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <p className="mb-3 text-center text-sm font-semibold text-white">Tipos de pago</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {paymentBadges.map((badge) => (
              <img key={badge} src={badge} alt="Tipo de pago" className="h-14 w-auto rounded-md border border-white/20 bg-white p-1.5" />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <p className="text-sm text-white/50 text-center">
            © 2026 <span className="font-bold text-white">Punto Pas</span>. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

import { MapPin, Phone, Mail, Clock, ExternalLink, Shield, Home, Info, MapPin as MapPinIcon, ShoppingCart, FileText, Send, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import logoPuntoPas from "@/assets/logo-punto-pas.png";

interface FooterProps {
  onCartClick?: () => void;
}

export const Footer = ({ onCartClick }: FooterProps) => {
  return (
    <footer id="contacto" className="bg-gray-900 text-white">
      {/* Main footer content */}
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
                <h3 className="text-2xl font-black tracking-tight">PUNTO PAS</h3>
                <p className="text-xs text-gray-400 tracking-widest">ENCUENTRA TODO EN UN SOLO LUGAR</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Tu ferretería de confianza en Ecuador. Calidad, variedad y los mejores precios del mercado.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
               <a
                 href="https://www.facebook.com/p/Punto-Pas-100063756541859/"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all hover:scale-110"
               >
                 {/* Facebook icon - using external link instead */}
                 <ExternalLink className="w-5 h-5" />
               </a>
              <a
                href="https://www.tiktok.com/@punto_pas"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-black flex items-center justify-center transition-all hover:scale-110 border border-gray-700"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/593959990999"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-all hover:scale-110"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services / Links */}
          <div>
            <h4 className="text-base font-bold mb-5 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full"></span>
              Navegación
            </h4>
            <div className="space-y-3">
              <Link 
                to="/" 
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Home className="w-4 h-4" />
                </div>
                <span>Inicio</span>
              </Link>
              <Link 
                to="/quienes-somos" 
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Info className="w-4 h-4" />
                </div>
                <span>Quiénes Somos</span>
              </Link>
              <Link 
                to="/sucursales" 
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MapPinIcon className="w-4 h-4" />
                </div>
                <span>Sucursales</span>
              </Link>
              {onCartClick ? (
                <button 
                  onClick={onCartClick}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group w-full"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <span>Carrito de compras</span>
                </button>
              ) : (
                <Link 
                  to="/checkout" 
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <span>Carrito de compras</span>
                </Link>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base font-bold mb-5 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full"></span>
              Contáctanos
            </h4>
            <div className="space-y-4">
              <a 
                href="tel:+593959990999" 
                className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Teléfono</p>
                  <p className="font-semibold">+593 99 208 5931</p>
                </div>
              </a>

              <a 
                href="mailto:contacto@puntopas.com" 
                className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <p className="font-semibold">contacto@puntopas.com</p>
                </div>
              </a>

              <div className="flex items-start gap-3 text-gray-400">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Horario de atención</p>
                  <p className="font-semibold">Lun - Sáb: 8AM - 6PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter / WhatsApp CTA */}
          <div>
            <h4 className="text-base font-bold mb-5 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full"></span>
              ¿Necesitas ayuda?
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Contáctanos directamente por WhatsApp para una atención personalizada.
            </p>
            <a
              href="https://wa.me/593959990999?text=Hola,%20me%20gustaría%20obtener%20más%20información"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] mb-4"
            >
              <MessageCircle className="w-5 h-5" />
              Chatear por WhatsApp
            </a>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Compra segura y protegida</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/privacidad" className="text-sm text-gray-500 hover:text-white transition-colors">
              Política de Privacidad
            </Link>
            <Link to="/quienes-somos" className="text-sm text-gray-500 hover:text-white transition-colors">
              Términos y Condiciones
            </Link>
          </div>
          <p className="text-sm text-gray-500 text-center md:text-right">
            © 2024 <span className="font-bold text-primary">Punto Pas</span>. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

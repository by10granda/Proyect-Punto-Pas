import { MapPin, Phone, Mail, Clock, ExternalLink, Shield, Home, Info, MapPin as MapPinIcon, ShoppingCart, FileText, Send, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import logoPuntoPas from "@/assets/logo-punto-pas.png";

interface FooterProps {
  onCartClick?: () => void;
}

export const Footer = ({ onCartClick }: FooterProps) => {
  return (
    <footer id="contacto" className="bg-primary text-white">
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
                <h3 className="text-2xl font-black tracking-tight text-white">PUNTO PAS</h3>
                <p className="text-xs text-white/80 font-medium tracking-wide">ENCUENTRA TODO EN UN SOLO LUGAR</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Tu ferretería de confianza en Ecuador. Calidad, variedad y los mejores precios del mercado.
            </p>
            {/* Social Links - Minimalist */}
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
          
          {/* Navigation - Minimalist */}
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
                  <MapPinIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white">Sucursales</span>
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
          
          {/* Contact Info - Minimalist */}
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
          
          {/* WhatsApp CTA - Minimalist */}
          <div>
            <h4 className="text-base font-bold mb-5 flex items-center gap-2 text-white">
              <span className="w-8 h-1 bg-white/30 rounded-full"></span>
              ¿Necesitas ayuda?
            </h4>
            <p className="text-white/70 text-sm mb-4">
              Contáctanos directamente por WhatsApp para una atención personalizada.
            </p>
            <a
              href="https://www.flaticon.es/iconos-gratis/whatsapp" 
              target="_blank"
              rel="noopener noreferrer"
              title="whatsapp iconos"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] mb-4"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M17.472 14.382c-.262-.139-1.55-.771-1.79-.86-.24-.09-.415-.139-.59.14-.174.279-.673.85-1.026 1.026-.151.176-.241.195-.416.07-.78-.156-1.401-.49-2.378-1.55-3.827-1.549-2.003-.596-4.822-.298-4.822-.298-1.321.589-1.973 1.32-1.973 1.32-.24.416-.096.59-.174.278 1.026-.278 2.159-.973 2.159-.973.04-.24.416-.078.59-.139.24-.09.415-.139.59-.14.174-.07.415-.156.59-.278.139-.09 1.026.278 1.55 1.026.524.278 1.131.278 1.32.07.278-.09.59-.139.415-.195.174-.09 1.026.278 1.55 1.026.524.278 1.131.278 1.32.07.278-.09.59-.139.415-.195.174-.09 1.026.278 1.55 1.026zm-3.472-6.382c-.24 0-.48-.02-.72-.04-3.28-.24-6.28 1.68-6.28 4.88 0 1.88.82 3.56 2.12 4.72.68.56 1.24.92 1.24.92s-1.24.56-1.24 1.68c0 1.12 1.24 2.04 1.24 2.04s-2.04 1.36-4.68 1.36c-1.44 0-2.76-.52-3.72-1.36-.96-.84-1.44-2.04-1.44-3.52 0-3.68 3.24-6.68 7.24-6.68z"/>
              </svg>
              Chatear por WhatsApp
            </a>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-white/70">Compra segura y protegida</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom bar - Minimalist */}
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

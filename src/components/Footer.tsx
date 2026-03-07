import { MapPin, Phone, Mail, Clock, Facebook, ExternalLink, Shield, Home, Info, MapPin as MapPinIcon, ShoppingCart, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import logoPuntoPas from "@/assets/logo-punto-pas.png";

export const Footer = () => {
  return (
    <footer id="contacto" className="bg-slate-900 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 shadow-lg">
                <img 
                  src={logoPuntoPas} 
                  alt="Punto Pas" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">PUNTO PAS</h3>
                <p className="text-xs text-slate-400 tracking-widest">ENCUENTRA TODO EN UN SOLO LUGAR</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Tu ferretería de confianza.
            </p>
          </div>

          {/* Services / Links */}
          <div>
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-1 bg-primary rounded-full"></span>
              Servicios
            </h4>
            <div className="space-y-3">
              <Link 
                to="/" 
                className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Home className="w-4 h-4" />
                </div>
                <span>Inicio</span>
              </Link>
              <Link 
                to="/quienes-somos" 
                className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Info className="w-4 h-4" />
                </div>
                <span>Quiénes Somos</span>
              </Link>
              <Link 
                to="/sucursales" 
                className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MapPinIcon className="w-4 h-4" />
                </div>
                <span>Sucursales</span>
              </Link>
              <Link 
                to="/checkout" 
                className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span>Checkout</span>
              </Link>
              <Link 
                to="/privacidad" 
                className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <span>Política de Privacidad</span>
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-1 bg-primary rounded-full"></span>
              Contáctanos
            </h4>
            <div className="space-y-3">
              <a 
                href="tel:+593992085931" 
                className="flex items-center gap-2 text-slate-300 hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Teléfono</p>
                  <p className="text-sm font-medium">+593 99 208 5931</p>
                </div>
              </a>

              <a 
                href="mailto:contacto@puntopas.com" 
                className="flex items-center gap-2 text-slate-300 hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium">contacto@puntopas.com</p>
                </div>
              </a>

              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Horario</p>
                  <p className="text-sm font-medium">Lun - Sáb: 8AM - 6PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-1 bg-primary rounded-full"></span>
              Redes
            </h4>
            <div className="space-y-3">
              <a
                href="https://www.facebook.com/p/Punto-Pas-100063756541859/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-blue-600 transition-all group"
              >
                <Facebook className="w-6 h-6" />
                <div className="flex-1">
                  <span className="font-semibold block">Facebook</span>
                  <span className="text-xs text-slate-400 group-hover:text-white/70">@PuntoPas</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href="https://www.tiktok.com/@punto_pas"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-black transition-all group border border-slate-700 hover:border-white/20"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <div className="flex-1">
                  <span className="font-semibold block">TikTok</span>
                  <span className="text-xs text-slate-400 group-hover:text-white/70">@punto_pas</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500 text-center md:text-left">
            © 2024 <span className="font-bold text-primary">Punto Pas</span>. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link to="/privacidad" className="hover:text-primary transition-colors">
              Privacidad
            </Link>
            <span>Hecho en Ecuador</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

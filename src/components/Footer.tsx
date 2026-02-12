import { MapPin, Phone, Mail, Clock, Facebook, ExternalLink, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import logoPuntoPas from "@/assets/logo-punto-pas.png";

export const Footer = () => {
  return (
    <footer id="contacto" className="bg-slate-900 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 shadow-lg">
                <img 
                  src={logoPuntoPas} 
                  alt="Punto Pas" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">PUNTO PAS</h3>
                <p className="text-xs text-slate-400 tracking-widest">ENCUENTRA TODO EN UN SOLO LUGAR</p>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
              Tu ferretería de confianza. Ofrecemos productos de la más alta calidad 
              para construcción, hogar y proyectos profesionales.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full"></span>
              Contáctanos
            </h4>
            <div className="space-y-4">
              <a 
                href="tel:+593992085931" 
                className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Teléfono / WhatsApp</p>
                  <p className="font-medium">+593 99 208 5931</p>
                </div>
              </a>

              <a 
                href="mailto:contacto@puntopas.com" 
                className="flex items-center gap-3 text-slate-300 hover:text-primary transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-medium">contacto@puntopas.com</p>
                </div>
              </a>

              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Horario</p>
                  <p className="font-medium">Lun - Sáb: 8:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full"></span>
              Redes Sociales
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

          {/* Location */}
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full"></span>
              Ubicación
            </h4>
            <div className="flex items-start gap-3 text-slate-300 mb-4">
              <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
              <p className="text-sm">Ecuador - Tu ferretería de confianza cerca de ti</p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d10925.215127800555!2d-78.81681414407421!3d1.2804919531416215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sec!4v1770175357122!5m2!1ses!2sec" 
                width="100%" 
                height="180" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Punto Pas"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 text-center md:text-left">
            © 2024 <span className="font-bold text-primary">Punto Pas</span>. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link to="/privacidad" className="hover:text-primary transition-colors flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Política de Privacidad
            </Link>
            <span>Hecho con ❤️ en Ecuador</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

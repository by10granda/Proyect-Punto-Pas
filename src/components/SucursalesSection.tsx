import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import { forwardRef } from "react";

const SucursalesSection = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <section 
      ref={ref}
      id="sucursales-section"
      className="py-16 px-4 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 relative overflow-hidden scroll-mt-20"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-cyan-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-teal-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-4 shadow-md">
            <Navigation className="w-4 h-4 text-cyan-600" />
            <span className="text-cyan-700 text-sm font-semibold">Encuéntranos</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Nuestras Sucursales
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Visítanos en cualquiera de nuestras ubicaciones. ¡Te esperamos con los mejores productos!
          </p>
        </div>

        {/* Advertising Space - Top */}
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-4 text-center mb-8 shadow-lg">
          <p className="text-white/70 text-xs uppercase tracking-widest mb-2">Publicidad</p>
          <div className="h-16 bg-white/20 rounded-xl flex items-center justify-center border-2 border-dashed border-white/40">
            <span className="text-white/60 text-sm">Espacio Publicitario Premium</span>
          </div>
        </div>

        {/* Maps Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Sucursal 1 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border-4 border-cyan-100 hover:border-cyan-300 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-200/50">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-2xl">Sucursal Principal</h3>
                  <p className="text-white/80">Disensa - Punto Pas</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5321.005202825693!2d-78.81475189967422!3d1.2786868727469063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e2c85208bb6d559%3A0x1efbad64a4d44346!2sDisensa!5e0!3m2!1ses!2sec!4v1770566419524!5m2!1ses!2sec"
                width="100%"
                height="280"
                className="w-full border-0"
                loading="lazy"
                title="Sucursal Principal"
              ></iframe>
            </div>
            
            <div className="p-5 bg-cyan-50">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-cyan-600" />
                  <span className="text-gray-700">Lunes a Domingo: 8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-cyan-600" />
                  <span className="text-gray-700">+593 XXX XXX XXXX</span>
                </div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Visítanos en nuestra sucursal principal. ¡Te esperamos!</p>
            </div>
          </div>

          {/* Sucursal 2 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border-4 border-teal-100 hover:border-teal-300 transition-all duration-300 hover:scale-[1.02] hover:shadow-teal-200/50">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-2xl">Sucursal Centro</h3>
                  <p className="text-white/80">Ubicación Central</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3989.2917084934197!2d-79.67238277042144!3d0.9309174275936912!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sec!4v1770567372652!5m2!1ses!2sec"
                width="100%"
                height="280"
                className="w-full border-0"
                loading="lazy"
                title="Sucursal Centro"
              ></iframe>
            </div>
            
            <div className="p-5 bg-teal-50">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span className="text-gray-700">Lunes a Domingo: 8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-teal-600" />
                  <span className="text-gray-700">+593 XXX XXX XXXX</span>
                </div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Te esperamos en nuestra sucursal del centro. ¡No faltes!</p>
            </div>
          </div>
        </div>

        {/* Advertising Space - Middle */}
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 text-center mb-8 border border-blue-200">
          <p className="text-blue-600/60 text-xs uppercase tracking-widest mb-3">Publicidad</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-20 bg-white/80 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-300 shadow-sm">
              <span className="text-blue-400/60 text-sm">Espacio Publicitario 1</span>
            </div>
            <div className="h-20 bg-white/80 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-300 shadow-sm">
              <span className="text-blue-400/60 text-sm">Espacio Publicitario 2</span>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-cyan-100 hover:shadow-xl transition-all">
            <Clock className="w-10 h-10 text-cyan-500 mx-auto mb-3" />
            <h3 className="text-gray-900 font-bold text-xl mb-2">Horario Extendido</h3>
            <p className="text-gray-600">Atención todos los días de 8:00 AM a 8:00 PM</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-teal-100 hover:shadow-xl transition-all">
            <MapPin className="w-10 h-10 text-teal-500 mx-auto mb-3" />
            <h3 className="text-gray-900 font-bold text-xl mb-2">Ubicaciones</h3>
            <p className="text-gray-600">Fácil acceso y parqueo disponible</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-blue-100 hover:shadow-xl transition-all">
            <Phone className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <h3 className="text-gray-900 font-bold text-xl mb-2">Atención</h3>
            <p className="text-gray-600">Te ayudamos a encontrar lo que necesitas</p>
          </div>
        </div>

        {/* Advertising Space - Bottom */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-4 text-center shadow-lg">
          <p className="text-white/70 text-xs uppercase tracking-widest mb-2">Publicidad</p>
          <div className="h-20 bg-white/20 rounded-xl flex items-center justify-center border-2 border-dashed border-white/40">
            <span className="text-white/60 text-sm">Espacio Publicitario Destacado</span>
          </div>
        </div>
      </div>
    </section>
  );
});

SucursalesSection.displayName = 'SucursalesSection';

export default SucursalesSection;

import { MapPin, Clock, Phone, X, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function SucursalesPage() {
  const navigate = useNavigate();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate('/');
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => navigate('/')}
      />
      
      {/* Window Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Nuestras Sucursales</h2>
                <p className="text-white/90 text-sm">Encuentra tu tienda más cercana</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            {/* Advertising Space - Top */}
            <div className="bg-gradient-to-r from-cyan-100 to-blue-100 p-4 text-center border-b border-cyan-200">
              <p className="text-cyan-600/60 text-xs uppercase tracking-widest mb-2">Publicidad</p>
              <div className="h-16 bg-white/80 rounded-xl flex items-center justify-center border-2 border-dashed border-cyan-300">
                <span className="text-cyan-400/60 text-sm">Espacio Publicitario Premium</span>
              </div>
            </div>

            {/* Maps Grid */}
            <div className="p-6 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Sucursal 1 */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-xl border-4 border-cyan-100 hover:border-cyan-300 transition-all duration-300 hover:scale-[1.02]">
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-xl">Sucursal Principal</h3>
                        <p className="text-white/80 text-sm">Disensa - Punto Pas</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5321.005202825693!2d-78.81475189967422!3d1.2786868727469063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e2c85208bb6d559%3A0x1efbad64a4d44346!2sDisensa!5e0!3m2!1ses!2sec!4v1770566419524!5m2!1ses!2sec"
                      width="100%"
                      height="250"
                      className="w-full border-0"
                      loading="lazy"
                      title="Sucursal Principal"
                    ></iframe>
                  </div>
                  
                  <div className="p-4 bg-cyan-50">
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-600" />
                        <span className="text-gray-700 text-sm">Lunes a Domingo: 8:00 AM - 8:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-cyan-600" />
                        <span className="text-gray-700 text-sm">+593 XXX XXX XXXX</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">Visítanos en nuestra sucursal principal. ¡Te esperamos!</p>
                  </div>
                </div>

                {/* Sucursal 2 */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-xl border-4 border-teal-100 hover:border-teal-300 transition-all duration-300 hover:scale-[1.02]">
                  <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-xl">Sucursal Centro</h3>
                        <p className="text-white/80 text-sm">Ubicación Central</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3989.2917084934197!2d-79.67238277042144!3d0.9309174275936912!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sec!4v1770567372652!5m2!1ses!2sec"
                      width="100%"
                      height="250"
                      className="w-full border-0"
                      loading="lazy"
                      title="Sucursal Centro"
                    ></iframe>
                  </div>
                  
                  <div className="p-4 bg-teal-50">
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <span className="text-gray-700 text-sm">Lunes a Domingo: 8:00 AM - 8:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-teal-600" />
                        <span className="text-gray-700 text-sm">+593 XXX XXX XXXX</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">Te esperamos en nuestra sucursal del centro. ¡No faltes!</p>
                  </div>
                </div>
              </div>

              {/* Advertising Space - Middle */}
              <div className="mt-6 bg-gradient-to-r from-blue-200/50 to-cyan-200/50 rounded-2xl p-4 text-center border border-blue-200">
                <p className="text-blue-600/60 text-xs uppercase tracking-widest mb-2">Publicidad</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="h-20 bg-white/80 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-300">
                    <span className="text-blue-400/60 text-sm">Espacio Publicitario 1</span>
                  </div>
                  <div className="h-20 bg-white/80 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-300">
                    <span className="text-blue-400/60 text-sm">Espacio Publicitario 2</span>
                  </div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-xl p-4 text-center shadow-md">
                  <Clock className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Horario</h3>
                  <p className="text-gray-600 text-xs">8:00 AM - 8:00 PM</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-md">
                  <MapPin className="w-8 h-8 text-teal-500 mx-auto mb-2" />
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Parqueo</h3>
                  <p className="text-gray-600 text-xs">Disponible</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-md">
                  <Navigation className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Fácil Acceso</h3>
                  <p className="text-gray-600 text-xs">Ubicaciones centrales</p>
                </div>
              </div>
            </div>

            {/* Advertising Space - Bottom */}
            <div className="bg-gradient-to-r from-teal-100 to-cyan-100 p-4 text-center border-t border-teal-200">
              <p className="text-teal-600/60 text-xs uppercase tracking-widest mb-2">Publicidad</p>
              <div className="h-16 bg-white/80 rounded-xl flex items-center justify-center border-2 border-dashed border-teal-300">
                <span className="text-teal-400/60 text-sm">Espacio Publicitario Destacado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

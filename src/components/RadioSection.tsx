import { Radio, Play, Pause, Volume2, Headphones } from "lucide-react";
import { useRadio } from "@/contexts/RadioContext";
import { forwardRef } from "react";

const RadioSection = forwardRef<HTMLDivElement>((_, ref) => {
  const { isPlaying, toggleRadio } = useRadio();

  return (
    <section 
      ref={ref}
      id="radio-section"
      className="py-16 px-4 bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 relative overflow-hidden scroll-mt-20"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-violet-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-fuchsia-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-4 shadow-md">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-violet-700 text-sm font-semibold">En Vivo</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Radio Punto Pas
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tu música, tu estilo. Escucha nuestra programación las 24 horas del día
          </p>
        </div>

        {/* Main Player Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-violet-100 overflow-hidden">
          {/* Advertising Space - Top */}
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 text-center">
            <p className="text-white/70 text-xs uppercase tracking-widest mb-2">Publicidad</p>
            <div className="h-16 bg-white/20 rounded-xl flex items-center justify-center border-2 border-dashed border-white/40">
              <span className="text-white/60 text-sm">Espacio Publicitario Premium</span>
            </div>
          </div>

          {/* Player Section */}
          <div className="p-6 md:p-10">
            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-6 md:p-10 border border-violet-100">
              {/* Now Playing */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-xl mb-4">
                  <Radio className="w-10 h-10 text-white" />
                </div>
                <p className="text-violet-600/70 text-sm uppercase tracking-widest mb-2">Ahora Suena</p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Música en Vivo</h3>
                <p className="text-gray-600">Tu música, tu estilo - Punto Pas</p>
              </div>

              {/* Animated Visualizer */}
              <div className="flex items-center justify-center gap-1 mb-8 h-24 md:h-32 bg-white/50 rounded-2xl p-4">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 md:w-3 rounded-full transition-all duration-150 ${
                      isPlaying 
                        ? "bg-gradient-to-t from-violet-400 via-fuchsia-400 to-pink-300 animate-pulse" 
                        : "bg-gray-200"
                    }`}
                    style={{
                      height: isPlaying ? `${Math.random() * 80 + 20}%` : '20%',
                      animationDelay: `${i * 0.04}s`,
                      animationDuration: isPlaying ? `${0.3 + Math.random() * 0.4}s` : '0s'
                    }}
                  ></div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mb-8 max-w-xl mx-auto">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-300 rounded-full transition-all duration-1000 ${
                      isPlaying ? 'animate-pulse' : ''
                    }`} 
                    style={{ width: isPlaying ? '70%' : '0%' }}
                  ></div>
                </div>
                <div className="flex justify-between text-gray-500 text-sm mt-2">
                  <span>LIVE</span>
                  <span>Transmitiendo 24/7</span>
                  <span>∞</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-violet-600 hover:shadow-xl transition-all hover:scale-105 border border-gray-100">
                  <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                <button 
                  onClick={toggleRadio}
                  className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-fuchsia-500/30 hover:scale-105 transition-all border-4 border-white"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 md:w-10 md:h-10" />
                  ) : (
                    <Play className="w-8 h-8 md:w-10 md:h-10 ml-1" />
                  )}
                </button>

                <button className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-violet-600 hover:shadow-xl transition-all hover:scale-105 border border-gray-100">
                  <Headphones className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>

            {/* Info Cards */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-violet-50 rounded-xl p-4 text-center border border-violet-100">
                <Headphones className="w-6 h-6 md:w-8 md:h-8 text-violet-500 mx-auto mb-2" />
                <p className="text-gray-700 text-xs md:text-sm font-medium">Audio HD</p>
              </div>
              <div className="bg-fuchsia-50 rounded-xl p-4 text-center border border-fuchsia-100">
                <Radio className="w-6 h-6 md:w-8 md:h-8 text-fuchsia-500 mx-auto mb-2" />
                <p className="text-gray-700 text-xs md:text-sm font-medium">24/7</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-4 text-center border border-pink-100">
                <Volume2 className="w-6 h-6 md:w-8 md:h-8 text-pink-500 mx-auto mb-2" />
                <p className="text-gray-700 text-xs md:text-sm font-medium">Sin Cortes</p>
              </div>
            </div>
          </div>

          {/* Advertising Space - Bottom */}
          <div className="bg-gradient-to-r from-fuchsia-600 to-violet-600 p-4 text-center">
            <p className="text-white/70 text-xs uppercase tracking-widest mb-2">Publicidad</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-16 bg-white/20 rounded-xl flex items-center justify-center border-2 border-dashed border-white/40">
                <span className="text-white/60 text-sm">Espacio 1</span>
              </div>
              <div className="h-16 bg-white/20 rounded-xl flex items-center justify-center border-2 border-dashed border-white/40">
                <span className="text-white/60 text-sm">Espacio 2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

RadioSection.displayName = 'RadioSection';

export default RadioSection;

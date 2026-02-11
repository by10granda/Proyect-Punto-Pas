import { Radio, Play, Pause, Volume2, Headphones } from "lucide-react";
import { useRadio } from "@/contexts/RadioContext";
import { Helmet } from "react-helmet";

export default function Radio() {
  const { isPlaying, toggleRadio } = useRadio();

  return (
    <>
      <Helmet>
        <title>Radio Punto Pas - Música en Vivo</title>
        <meta name="description" content="Escucha Radio Punto Pas - Tu música, tu estilo. Transmitiendo en vivo las 24 horas." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="w-32 h-32 mx-auto bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center shadow-2xl mb-6">
              <Radio className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              Radio Punto Pas
            </h1>
            <div className="flex items-center justify-center gap-3">
              <span className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-white/90 font-medium text-xl">Transmitiendo En Vivo 24/7</span>
            </div>
          </div>

          {/* Main Player Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Advertising Space - Top */}
            <div className="bg-gradient-to-r from-red-700 to-red-800 p-4 text-center border-b border-white/10">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Publicidad</p>
              <div className="h-20 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white/40 text-sm">Espacio Publicitario Premium</span>
              </div>
            </div>

            {/* Player Section */}
            <div className="p-8 md:p-12">
              {/* Now Playing */}
              <div className="text-center mb-10">
                <p className="text-white/60 text-sm uppercase tracking-widest mb-3">Ahora Suena</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Música en Vivo</h2>
                <p className="text-white/70 text-lg">Tu música, tu estilo - Punto Pas</p>
              </div>

              {/* Animated Visualizer */}
              <div className="flex items-center justify-center gap-1 mb-10 h-40">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 md:w-4 rounded-full transition-all duration-150 ${
                      isPlaying 
                        ? "bg-gradient-to-t from-red-400 to-orange-300 animate-pulse" 
                        : "bg-white/20"
                    }`}
                    style={{
                      height: isPlaying ? `${Math.random() * 80 + 20}%` : '20%',
                      animationDelay: `${i * 0.03}s`,
                      animationDuration: isPlaying ? `${0.3 + Math.random() * 0.4}s` : '0s'
                    }}
                  ></div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mb-10 max-w-2xl mx-auto">
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-red-400 to-orange-300 rounded-full transition-all duration-1000 ${
                      isPlaying ? 'animate-pulse' : ''
                    }`} 
                    style={{ width: isPlaying ? '75%' : '0%' }}
                  ></div>
                </div>
                <div className="flex justify-between text-white/50 text-sm mt-3">
                  <span>LIVE</span>
                  <span>∞</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-8">
                <button className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all hover:scale-110">
                  <Volume2 className="w-8 h-8" />
                </button>

                <button 
                  onClick={toggleRadio}
                  className="w-28 h-28 bg-gradient-to-br from-red-500 to-orange-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-red-500/50 hover:scale-105 transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-14 h-14" />
                  ) : (
                    <Play className="w-14 h-14 ml-1" />
                  )}
                </button>

                <button className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all hover:scale-110">
                  <Headphones className="w-8 h-8" />
                </button>
              </div>
            </div>

            {/* Advertising Space - Bottom */}
            <div className="bg-gradient-to-r from-red-800 to-red-700 p-6 text-center border-t border-white/10">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Publicidad</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="h-24 bg-white/10 rounded-xl flex items-center justify-center">
                  <span className="text-white/40 text-sm">Espacio Publicitario 1</span>
                </div>
                <div className="h-24 bg-white/10 rounded-xl flex items-center justify-center">
                  <span className="text-white/40 text-sm">Espacio Publicitario 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
              <Headphones className="w-10 h-10 text-white/80 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">Audio HD</h3>
              <p className="text-white/60 text-sm">Calidad de sonido superior para tu experiencia</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
              <Radio className="w-10 h-10 text-white/80 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">24/7</h3>
              <p className="text-white/60 text-sm">Transmitiendo todo el día, todos los días</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
              <Volume2 className="w-10 h-10 text-white/80 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">Sin Interrupciones</h3>
              <p className="text-white/60 text-sm">Música continua sin cortes comerciales</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

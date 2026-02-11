import { Radio, Play, Pause, Volume2, Headphones, X } from "lucide-react";
import { useRadio } from "@/contexts/RadioContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function RadioPage() {
  const { isPlaying, toggleRadio } = useRadio();
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
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Radio className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Radio Punto Pas</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-white/90 text-sm">Transmitiendo En Vivo</span>
                </div>
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
            <div className="bg-gradient-to-r from-violet-100 to-fuchsia-100 p-4 text-center border-b border-violet-200">
              <p className="text-violet-600/60 text-xs uppercase tracking-widest mb-2">Publicidad</p>
              <div className="h-16 bg-white/80 rounded-xl flex items-center justify-center border-2 border-dashed border-violet-300">
                <span className="text-violet-400/60 text-sm">Espacio Publicitario Premium</span>
              </div>
            </div>

            {/* Player Section */}
            <div className="p-8 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
              {/* Now Playing */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center shadow-xl mb-4">
                  <Radio className="w-12 h-12 text-white" />
                </div>
                <p className="text-violet-600/70 text-sm uppercase tracking-widest mb-2">Ahora Suena</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Música en Vivo</h3>
                <p className="text-gray-600">Tu música, tu estilo - Punto Pas</p>
              </div>

              {/* Animated Visualizer */}
              <div className="flex items-center justify-center gap-1 mb-8 h-32 bg-white/50 rounded-2xl p-4">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 rounded-full transition-all duration-150 ${
                      isPlaying 
                        ? "bg-gradient-to-t from-violet-400 via-fuchsia-400 to-pink-300 animate-pulse" 
                        : "bg-gray-200"
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
                <button className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-violet-600 hover:shadow-xl transition-all hover:scale-105 border border-gray-100">
                  <Volume2 className="w-6 h-6" />
                </button>

                <button 
                  onClick={toggleRadio}
                  className="w-20 h-20 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-fuchsia-500/30 hover:scale-105 transition-all border-4 border-white"
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10" />
                  ) : (
                    <Play className="w-10 h-10 ml-1" />
                  )}
                </button>

                <button className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-violet-600 hover:shadow-xl transition-all hover:scale-105 border border-gray-100">
                  <Headphones className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-white border-t border-gray-100">
              <div className="bg-violet-50 rounded-xl p-4 text-center">
                <Headphones className="w-8 h-8 text-violet-500 mx-auto mb-2" />
                <p className="text-gray-700 text-sm font-medium">Audio HD</p>
              </div>
              <div className="bg-fuchsia-50 rounded-xl p-4 text-center">
                <Radio className="w-8 h-8 text-fuchsia-500 mx-auto mb-2" />
                <p className="text-gray-700 text-sm font-medium">24/7</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-4 text-center">
                <Volume2 className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <p className="text-gray-700 text-sm font-medium">Sin Cortes</p>
              </div>
            </div>

            {/* Advertising Space - Bottom */}
            <div className="bg-gradient-to-r from-fuchsia-100 to-violet-100 p-4 text-center border-t border-violet-200">
              <p className="text-violet-600/60 text-xs uppercase tracking-widest mb-2">Publicidad</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-white/80 rounded-xl flex items-center justify-center border-2 border-dashed border-violet-300">
                  <span className="text-violet-400/60 text-sm">Espacio 1</span>
                </div>
                <div className="h-16 bg-white/80 rounded-xl flex items-center justify-center border-2 border-dashed border-violet-300">
                  <span className="text-violet-400/60 text-sm">Espacio 2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

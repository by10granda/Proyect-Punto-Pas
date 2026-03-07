import { Radio, Play, Pause, X, Volume2 } from "lucide-react";
import { useRadio } from "@/contexts/RadioContext";
import { useState } from "react";

export default function RadioWidget() {
  const { isPlaying, setIsPlaying } = useRadio();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <div className={`bg-white rounded-2xl shadow-2xl border-2 border-red-100 overflow-hidden transition-all duration-300 ${
        isExpanded ? "w-80" : "w-72"
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Radio Punto Pas</h3>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs text-white/80">En Vivo</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/70 hover:text-white p-1 transition-colors"
            >
              {isExpanded ? (
                <span className="text-xs">▼</span>
              ) : (
                <span className="text-xs">▲</span>
              )}
            </button>
            <button 
              onClick={() => {
                setIsVisible(false);
                setIsPlaying(false);
              }}
              className="text-white/70 hover:text-white p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visualizer (Always visible) */}
        <div className="px-3 py-2 bg-gray-50">
          <div className="flex items-center justify-center gap-0.5 h-8">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-red-600 to-red-400 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 70 + 30}%`,
                  animationDelay: `${i * 0.05}s`,
                  animationDuration: `${0.4 + Math.random() * 0.4}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="p-3 bg-white">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl hover:scale-105 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600 transition-all">
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>LIVE</span>
              <span>∞</span>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-3 pb-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">Escuchando mientras navegas</p>
          </div>
        )}
      </div>
    </div>
  );
}

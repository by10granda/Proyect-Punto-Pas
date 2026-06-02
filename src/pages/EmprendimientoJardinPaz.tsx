import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const JARDIN_IMAGES_BASE_URL = "https://assets.distribuidor-puntopas.com/EMPRENDIMIENTOS_PRESENTACIONES";
const JARDIN_CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dx08ybps6/video/upload/v1780353801";

const portadaVideoCandidates = [
  `${JARDIN_CLOUDINARY_BASE_URL}/JARDIN_DE_LA_PAZ_PORTADA2.mp4`,
  `${JARDIN_IMAGES_BASE_URL}/JARDIN_DE_LA_PAZ_PORTADA2.mp4`,
];
const portadaImagen = `${JARDIN_IMAGES_BASE_URL}/Jardin_de_la_Paz_Portada1.png`;

const cuerpoImages = [
  `${JARDIN_IMAGES_BASE_URL}/CUERPO_1.png`,
  `${JARDIN_IMAGES_BASE_URL}/CUERPO_2.png`,
  `${JARDIN_IMAGES_BASE_URL}/CUERPO_3.png`,
];

const EmprendimientoJardinPaz = () => {
  const [activePortada, setActivePortada] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  useEffect(() => {
    if (activePortada === 0) {
      setActiveVideoIndex(0);
    }
  }, [activePortada]);

  const nextPortada = () => setActivePortada((prev) => (prev + 1) % 2);
  const prevPortada = () => setActivePortada((prev) => (prev - 1 + 2) % 2);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="sticky top-0 z-30 border-b border-red-700/40 rounded-b-2xl overflow-hidden" style={{ backgroundColor: "#ff0000" }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link
            to="/quienes-somos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 text-white hover:bg-white/15 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <h1 className="text-lg md:text-2xl font-black tracking-tight text-white">Jardín de la Paz</h1>
          <div className="w-[88px]" />
        </div>
      </header>

      <main className="w-full pt-0 pb-0 space-y-0">
        <section className="w-full">
          <div className="relative overflow-hidden">
            {activePortada === 0 ? (
              <video
                src={portadaVideoCandidates[activeVideoIndex]}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="block w-full h-auto bg-black"
                onError={(event) => {
                  const video = event.currentTarget;
                  const nextIndex = activeVideoIndex + 1;
                  if (nextIndex >= portadaVideoCandidates.length) return;
                  setActiveVideoIndex(nextIndex);
                  video.src = portadaVideoCandidates[nextIndex];
                  video.load();
                  video.play().catch(() => {});
                }}
              />
            ) : (
              <img
                src={portadaImagen}
                alt="Portada Jardín de la Paz"
                className="block w-full h-auto bg-black"
                loading="lazy"
              />
            )}

            <button onClick={prevPortada} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextPortada} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {[0, 1].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePortada(idx)}
                  className={`h-2.5 rounded-full transition-all ${activePortada === idx ? "w-7 bg-white" : "w-2.5 bg-white/70"}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="grid gap-0">
            {cuerpoImages.map((image, index) => (
              <div
                key={image}
                className="group overflow-hidden rounded-none bg-white animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <img
                  src={image}
                  alt={`Cuerpo Jardín de la Paz ${index + 1}`}
                  className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default EmprendimientoJardinPaz;

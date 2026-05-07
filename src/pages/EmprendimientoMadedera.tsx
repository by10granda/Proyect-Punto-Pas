import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const portadaImages = [
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778108826/Portada_Madedera_2.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778108823/Portada_Madedera_1.png",
];

const cuerpoImages = [
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778108829/Portada_Madedera_3.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778108827/Portada_Madedera_4.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778108830/Portada_Madedera_5.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778108824/Portada_Madedera_6.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778108831/Portada_Madedera_7.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778108830/Portada_Madedera_8.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778108833/Portada_Madedera_9.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778108826/Portada_Madedera_10.png",
];

const EmprendimientoMadedera = () => {
  const [activePortada, setActivePortada] = useState(0);

  const nextPortada = () => {
    setActivePortada((prev) => (prev + 1) % portadaImages.length);
  };

  const prevPortada = () => {
    setActivePortada((prev) => (prev - 1 + portadaImages.length) % portadaImages.length);
  };

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
          <h1 className="text-lg md:text-2xl font-black tracking-tight text-white">Madedera</h1>
          <div className="w-[88px]" />
        </div>
      </header>

      <main className="w-full pt-0 pb-8 md:pb-10 space-y-10">
        <section className="w-full">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_40px_-30px_rgba(0,0,0,0.35)]">
            <img src={portadaImages[activePortada]} alt="Portada Madedera" className="w-full h-auto object-contain" loading="lazy" />
            <button onClick={prevPortada} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextPortada} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {portadaImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePortada(idx)}
                  className={`h-2.5 rounded-full transition-all ${activePortada === idx ? "w-7 bg-white" : "w-2.5 bg-white/70"}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 md:px-6 space-y-4">
          <div className="max-w-6xl mx-auto grid gap-4 md:gap-6">
            {cuerpoImages.map((image, index) => (
              <div
                key={image}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_40px_-30px_rgba(0,0,0,0.35)] animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <img src={image} alt="Contenido Madedera" className="w-full h-auto object-contain" loading="lazy" />
                <div className="h-1 w-full bg-gradient-to-r from-red-500 via-red-400 to-red-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default EmprendimientoMadedera;

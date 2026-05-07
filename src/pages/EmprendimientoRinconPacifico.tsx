import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const portadaImages = [
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778181571/PORTADA_RINCON_1.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778181575/PORTAD_RINCON_2.png",
];

const cuerpoImages = [
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778181570/RINCON_1.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778181572/RINCON_2.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778181567/RINCON_3.png",
];

const EmprendimientoRinconPacifico = () => {
  const [activePortada, setActivePortada] = useState(0);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleImages, setVisibleImages] = useState<number[]>([]);
  const nextPortada = () => setActivePortada((prev) => (prev + 1) % portadaImages.length);
  const prevPortada = () => setActivePortada((prev) => (prev - 1 + portadaImages.length) % portadaImages.length);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idxRaw = entry.target.getAttribute("data-image-idx");
          const idx = idxRaw ? Number(idxRaw) : -1;
          if (idx >= 0) {
            setVisibleImages((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
          }
        });
      },
      { threshold: 0.2 }
    );

    imageRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

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
          <h1 className="text-sm md:text-xl font-black tracking-tight text-white text-center">
            Urbanización Rincón del Pacífico
          </h1>
          <div className="w-[88px]" />
        </div>
      </header>

      <main className="w-full pt-0 pb-0 space-y-0">
        <section className="w-full">
          <div className="relative overflow-hidden">
            <img
              key={portadaImages[activePortada]}
              src={portadaImages[activePortada]}
              alt="Portada Rincón del Pacífico"
              className="block w-full h-auto bg-black animate-in fade-in zoom-in-95 duration-500"
              loading="lazy"
            />

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

        <section className="w-full">
          <div className="grid gap-0">
            {cuerpoImages.map((image, index) => (
              <div
                key={image}
                ref={(node) => {
                  imageRefs.current[index] = node;
                }}
                data-image-idx={index}
                className={`group overflow-hidden rounded-none bg-white transition-all duration-700 ${
                  visibleImages.includes(index)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <img
                  src={image}
                  alt={`Rincón del Pacífico ${index + 1}`}
                  className="w-full h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-[1.025] group-hover:-translate-y-1"
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

export default EmprendimientoRinconPacifico;

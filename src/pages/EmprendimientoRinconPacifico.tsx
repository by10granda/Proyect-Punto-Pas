import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const RINCON_IMAGES_BASE_URL = "https://assets.distribuidor-puntopas.com/EMPRENDIMIENTOS_PRESENTACIONES";
const portadaImage = `${RINCON_IMAGES_BASE_URL}/RINCON_PORTADA.png`;

const cuerpoImages = [
  `${RINCON_IMAGES_BASE_URL}/RINCON_1.png`,
  `${RINCON_IMAGES_BASE_URL}/RINCON_2.png`,
  `${RINCON_IMAGES_BASE_URL}/RINCON_3.png`,
];

const EmprendimientoRinconPacifico = () => {
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleImages, setVisibleImages] = useState<number[]>([]);

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
              src={portadaImage}
              alt="Portada Rincón del Pacífico"
              className="block w-full h-auto bg-black animate-in fade-in zoom-in-95 duration-500"
              loading="lazy"
            />
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

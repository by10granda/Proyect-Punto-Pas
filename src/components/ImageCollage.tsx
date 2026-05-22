import { memo } from "react";

interface ImageCollageProps {
  images: string[];
  onImageClick?: (index: number) => void;
}

const ASSETS_BASE = "https://assets.distribuidor-puntopas.com";

const collageCandidates = [1, 2, 3, 4, 5, 6].map((index) => [
  `${ASSETS_BASE}/IMAGENES_CATEGORIAS/IMAGEN_${index}.png`,
  `${ASSETS_BASE}/Images/IMAGEN_${index}.png`,
  `${ASSETS_BASE}/img/IMAGEN_${index}.png`,
  `${ASSETS_BASE}/IMAGENES_CATEGORIAS/IMAGEN ${index}.png`,
  `${ASSETS_BASE}/Images/IMAGEN ${index}.png`,
  `${ASSETS_BASE}/img/IMAGEN ${index}.png`,
]);

const DEFAULT_IMAGES = collageCandidates.map((candidates) => candidates[0]);

const handleCollageFallback = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  const fallbackValue = image.dataset.fallbacks;
  if (!fallbackValue) return;

  const fallbacks = fallbackValue.split("|");
  const currentIndex = Number(image.dataset.fallbackIndex || "0");
  const nextIndex = currentIndex + 1;

  if (nextIndex >= fallbacks.length) {
    image.removeAttribute("data-fallbacks");
    return;
  }

  image.dataset.fallbackIndex = String(nextIndex);
  image.src = fallbacks[nextIndex];
};

export const ImageCollage = memo(({ images = DEFAULT_IMAGES, onImageClick }: ImageCollageProps) => {
  const displayImages = images.slice(0, 6);
  
  return (
    <section className="w-full" style={{ marginTop: 0, paddingTop: 0 }}>
      <div 
        className="w-full"
        style={{
          height: "500px",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "20% 40% 40%",
          gridTemplateRows: "55% 45%",
          gap: "6px",
          backgroundColor: "#e5e5e5",
          padding: 0,
          margin: 0
        }}
      >
        {/* img1 - Left column, spans both rows */}
        <div style={{ gridRow: "1 / span 2", position: "relative", backgroundColor: "white", overflow: "hidden" }}>
            <img
              src={displayImages[0]}
              data-fallbacks={collageCandidates[0].join("|")}
              data-fallback-index="0"
              alt="Marca 1"
              onClick={() => onImageClick?.(0)}
              onError={handleCollageFallback}
              className="transition-transform duration-300 hover:scale-105"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                cursor: onImageClick ? "pointer" : "default"
              }}
            />
        </div>

        {/* img2 - Top center */}
        <div style={{ position: "relative", backgroundColor: "white", overflow: "hidden" }}>
          <img
            src={displayImages[1]}
            data-fallbacks={collageCandidates[1].join("|")}
            data-fallback-index="0"
            alt="Marca 2"
            onClick={() => onImageClick?.(1)}
            onError={handleCollageFallback}
            className="transition-transform duration-300 hover:scale-105"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              cursor: onImageClick ? "pointer" : "default"
            }}
          />
        </div>
        
        {/* img3 - Top right */}
        <div style={{ position: "relative", backgroundColor: "white", overflow: "hidden" }}>
          <img
            src={displayImages[2]}
            data-fallbacks={collageCandidates[2].join("|")}
            data-fallback-index="0"
            alt="Marca 3"
            onClick={() => onImageClick?.(2)}
            onError={handleCollageFallback}
            className="transition-transform duration-300 hover:scale-105"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              cursor: onImageClick ? "pointer" : "default"
            }}
          />
        </div>

        {/* Bottom row - Nested grid with 3 equal columns spanning columns 2 and 3 */}
        <div style={{ gridColumn: "2 / span 2", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", backgroundColor: "#e5e5e5" }}>
          <div style={{ position: "relative", backgroundColor: "white", overflow: "hidden" }}>
            <img
              src={displayImages[3]}
              data-fallbacks={collageCandidates[3].join("|")}
              data-fallback-index="0"
              alt="Marca 4"
              onClick={() => onImageClick?.(3)}
              onError={handleCollageFallback}
              className="transition-transform duration-300 hover:scale-105"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                cursor: onImageClick ? "pointer" : "default"
              }}
            />
          </div>
          <div style={{ position: "relative", backgroundColor: "white", overflow: "hidden" }}>
            <img
              src={displayImages[4]}
              data-fallbacks={collageCandidates[4].join("|")}
              data-fallback-index="0"
              alt="Marca 5"
              onClick={() => onImageClick?.(4)}
              onError={handleCollageFallback}
              className="transition-transform duration-300 hover:scale-105"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                cursor: onImageClick ? "pointer" : "default"
              }}
            />
          </div>
          <div style={{ position: "relative", backgroundColor: "white", overflow: "hidden" }}>
            <img
              src={displayImages[5]}
              data-fallbacks={collageCandidates[5].join("|")}
              data-fallback-index="0"
              alt="Marca 6"
              onClick={() => onImageClick?.(5)}
              onError={handleCollageFallback}
              className="transition-transform duration-300 hover:scale-105"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                cursor: onImageClick ? "pointer" : "default"
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
});

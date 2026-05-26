import { memo } from "react";

interface ImageCollageProps {
  images: string[];
  imageCandidatesBySlot?: string[][];
  linkTargetsBySlot?: string[];
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

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const buildImageFallbacks = (sourceUrl: string | undefined, index: number): string[] => {
  const fallbackPool = collageCandidates[index] || [];
  if (!sourceUrl) return fallbackPool;

  const decoded = decodeURIComponent(sourceUrl);
  const variants = unique([
    sourceUrl,
    decoded,
    decoded.replace(/HONOR/g, "HONNOR"),
    decoded.replace(/HONNOR/g, "HONOR"),
    decoded.replace(/_/g, " "),
    decoded.replace(/\s/g, "%20"),
  ]);

  return unique([...variants, ...fallbackPool]);
};

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

export const ImageCollage = memo(({ images = DEFAULT_IMAGES, imageCandidatesBySlot, linkTargetsBySlot, onImageClick }: ImageCollageProps) => {
  const displayImages = images.slice(0, 6);
  const getLinkTarget = (index: number) => linkTargetsBySlot?.[index] || "";
  const displayFallbacks = displayImages.map((image, index) => {
    const providedCandidates = imageCandidatesBySlot?.[index];
    if (providedCandidates && providedCandidates.length > 0) {
      return unique([...providedCandidates, ...buildImageFallbacks(image, index)]);
    }
    return buildImageFallbacks(image, index);
  });
  
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
            <a href={getLinkTarget(0) || undefined} target={getLinkTarget(0) ? "_blank" : undefined} rel={getLinkTarget(0) ? "noopener noreferrer" : undefined}>
              <img
                src={displayImages[0]}
                data-fallbacks={displayFallbacks[0].join("|")}
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
            </a>
        </div>

        {/* img2 - Top center */}
        <div style={{ position: "relative", backgroundColor: "white", overflow: "hidden" }}>
          <a href={getLinkTarget(1) || undefined} target={getLinkTarget(1) ? "_blank" : undefined} rel={getLinkTarget(1) ? "noopener noreferrer" : undefined}><img
            src={displayImages[1]}
            data-fallbacks={displayFallbacks[1].join("|")}
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
          /></a>
        </div>
        
        {/* img3 - Top right */}
        <div style={{ position: "relative", backgroundColor: "white", overflow: "hidden" }}>
          <a href={getLinkTarget(2) || undefined} target={getLinkTarget(2) ? "_blank" : undefined} rel={getLinkTarget(2) ? "noopener noreferrer" : undefined}><img
            src={displayImages[2]}
            data-fallbacks={displayFallbacks[2].join("|")}
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
          /></a>
        </div>

        {/* Bottom row - Nested grid with 3 equal columns spanning columns 2 and 3 */}
        <div style={{ gridColumn: "2 / span 2", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", backgroundColor: "#e5e5e5" }}>
          <div style={{ position: "relative", backgroundColor: "white", overflow: "hidden" }}>
            <a href={getLinkTarget(3) || undefined} target={getLinkTarget(3) ? "_blank" : undefined} rel={getLinkTarget(3) ? "noopener noreferrer" : undefined}><img
              src={displayImages[3]}
              data-fallbacks={displayFallbacks[3].join("|")}
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
            /></a>
          </div>
          <div style={{ position: "relative", backgroundColor: "white", overflow: "hidden" }}>
            <a href={getLinkTarget(4) || undefined} target={getLinkTarget(4) ? "_blank" : undefined} rel={getLinkTarget(4) ? "noopener noreferrer" : undefined}><img
              src={displayImages[4]}
              data-fallbacks={displayFallbacks[4].join("|")}
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
            /></a>
          </div>
          <div style={{ position: "relative", backgroundColor: "white", overflow: "hidden" }}>
            <a href={getLinkTarget(5) || undefined} target={getLinkTarget(5) ? "_blank" : undefined} rel={getLinkTarget(5) ? "noopener noreferrer" : undefined}><img
              src={displayImages[5]}
              data-fallbacks={displayFallbacks[5].join("|")}
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
            /></a>
          </div>
        </div>
      </div>
    </section>
  );
});

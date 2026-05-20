import { memo } from "react";

interface ImageCollageProps {
  images: string[];
  onImageClick?: (index: number) => void;
}

const DEFAULT_IMAGES = [
  "https://assets.distribuidor-puntopas.com/image/upload/v1777305703/IMAGEN_1.png",
  "https://assets.distribuidor-puntopas.com/image/upload/v1777305710/IMAGEN_2.png",
  "https://assets.distribuidor-puntopas.com/image/upload/v1777306355/IMAGEN_3.png",
  "https://assets.distribuidor-puntopas.com/image/upload/v1777301931/IMAGEN_4.png",
  "https://assets.distribuidor-puntopas.com/image/upload/v1777302069/IMAGEN_5.png",
  "https://assets.distribuidor-puntopas.com/image/upload/v1777301925/IMAGEN_6.png",
];

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
              alt="Marca 1"
              onClick={() => onImageClick?.(0)}
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
            alt="Marca 2"
            onClick={() => onImageClick?.(1)}
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
            alt="Marca 3"
            onClick={() => onImageClick?.(2)}
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
              alt="Marca 4"
              onClick={() => onImageClick?.(3)}
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
              alt="Marca 5"
              onClick={() => onImageClick?.(4)}
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
              alt="Marca 6"
              onClick={() => onImageClick?.(5)}
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
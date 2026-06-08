import { ImgHTMLAttributes, useEffect, useState } from "react";

type AutoFitImageProps = ImgHTMLAttributes<HTMLImageElement>;

export const AutoFitImage = ({ className = "", onLoad, ...props }: AutoFitImageProps) => {
  const [objectFit, setObjectFit] = useState<"contain" | "cover">("contain");

  useEffect(() => {
    setObjectFit("contain");
  }, [props.src]);

  const updateFit = (image: HTMLImageElement) => {
    const container = image.parentElement;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const containerRatio = container && container.clientHeight > 0
      ? container.clientWidth / container.clientHeight
      : imageRatio;
    const ratioDifference = Math.abs(imageRatio - containerRatio) / containerRatio;

    setObjectFit(ratioDifference <= 0.18 ? "cover" : "contain");
  };

  return (
    <img
      {...props}
      className={`${className} ${objectFit === "cover" ? "object-cover" : "object-contain"}`.trim()}
      onLoad={(event) => {
        updateFit(event.currentTarget);
        onLoad?.(event);
      }}
    />
  );
};

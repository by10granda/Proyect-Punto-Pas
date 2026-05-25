import { useEffect, useMemo, useState } from "react";

interface UseImageCandidateFallbackOptions {
  resetKey: string;
  candidates: string[];
}

export const useImageCandidateFallback = ({ resetKey, candidates }: UseImageCandidateFallbackOptions) => {
  const [imageError, setImageError] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    setImageError(false);
    setImageIndex(0);
    setRetryAttempt(0);
  }, [resetKey]);

  const currentImage = candidates[imageIndex] || candidates[0] || "";

  const resolvedImageSrc = useMemo(() => {
    if (!currentImage) return "";
    return retryAttempt > 0
      ? `${currentImage}${currentImage.includes("?") ? "&" : "?"}r=${Date.now()}`
      : currentImage;
  }, [currentImage, retryAttempt]);

  const handleImageError = () => {
    if (retryAttempt === 0) {
      setRetryAttempt(1);
      return;
    }

    if (imageIndex < candidates.length - 1) {
      setImageIndex((prev) => prev + 1);
      setRetryAttempt(0);
      return;
    }

    setImageError(true);
  };

  return {
    imageError,
    resolvedImageSrc,
    handleImageError,
  };
};

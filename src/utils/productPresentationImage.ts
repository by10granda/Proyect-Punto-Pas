const PRESENTATION_EXCLUDED_SUFFIX = /_E[234]\.(png|jpg|jpeg|webp)(\?|$)/i;

export const isExcludedPresentationImage = (image: string) => PRESENTATION_EXCLUDED_SUFFIX.test(image);

export const getPresentationImageCandidates = (images: string[]) => {
  const validImages = images.filter(Boolean);
  const presentationImages = validImages.filter((image) => !isExcludedPresentationImage(image));

  return presentationImages.length > 0 ? presentationImages : validImages;
};

export const getHoverImageCandidates = (images: string[], primaryImages: string[]) => {
  const validImages = images.filter(Boolean);
  const primarySet = new Set(primaryImages);
  const alternateImages = validImages.filter((image) => isExcludedPresentationImage(image));
  const otherImages = validImages.filter((image) => !primarySet.has(image) && !isExcludedPresentationImage(image));

  return [...alternateImages, ...otherImages];
};

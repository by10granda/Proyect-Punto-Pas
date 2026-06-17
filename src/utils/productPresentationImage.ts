const PRESENTATION_EXCLUDED_SUFFIX = /_E[234]\.(png|jpg|jpeg|webp)(\?|$)/i;

export const getPresentationImageCandidates = (images: string[]) => {
  const validImages = images.filter(Boolean);
  const presentationImages = validImages.filter((image) => !PRESENTATION_EXCLUDED_SUFFIX.test(image));

  return presentationImages.length > 0 ? presentationImages : validImages;
};

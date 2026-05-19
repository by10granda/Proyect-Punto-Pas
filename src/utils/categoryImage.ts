import type { SyntheticEvent } from "react";

const stripAccents = (value: string): string => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const toSingleSpaces = (value: string): string => value.toUpperCase().trim().replace(/\s+/g, " ");

const unique = (values: string[]): string[] => {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

const buildFileNameVariants = (categoryName: string): string[] => {
  const base = toSingleSpaces(categoryName);
  const noCommas = base.replace(/,/g, "");
  const noAccents = stripAccents(base);
  const noAccentsNoCommas = stripAccents(noCommas);

  return unique([
    `${base}_123.png`,
    `${base.replace(/\s+/g, "_")}_123.png`,
    `${noCommas}_123.png`,
    `${noCommas.replace(/\s+/g, "_")}_123.png`,
    `${noAccents}_123.png`,
    `${noAccents.replace(/\s+/g, "_")}_123.png`,
    `${noAccentsNoCommas}_123.png`,
    `${noAccentsNoCommas.replace(/\s+/g, "_")}_123.png`,
  ]);
};

export const buildCategoryImageCandidates = (
  categoryName: string,
  categoryBaseUrl: string,
  cloudinaryVersion: string,
): string[] => {
  const fileNameVariants = buildFileNameVariants(categoryName);
  const base = categoryBaseUrl.replace(/\/$/, "");

  if (base) {
    return fileNameVariants.map((fileName) => `${base}/${encodeURIComponent(fileName)}`);
  }

  return fileNameVariants.map(
    (fileName) =>
      `https://res.cloudinary.com/dbbkpdhze/image/upload/${cloudinaryVersion}/${encodeURIComponent(fileName)}`,
  );
};

export const handleCategoryImageFallback = (event: SyntheticEvent<HTMLImageElement>): void => {
  const image = event.currentTarget;
  const fallbackValue = image.dataset.fallbacks;

  if (!fallbackValue) {
    return;
  }

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

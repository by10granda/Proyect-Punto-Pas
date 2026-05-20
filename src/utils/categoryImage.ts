import type { SyntheticEvent } from "react";

const stripAccents = (value: string): string => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const toSingleSpaces = (value: string): string => value.trim().replace(/\s+/g, " ");

const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(" ")
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(" ");

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

const appendSuffixVariants = (baseName: string): string[] => [
  `${baseName}_123.png`,
  `${baseName} 123.png`,
];

const buildFileNameVariants = (categoryName: string): string[] => {
  const baseOriginal = toSingleSpaces(categoryName);
  const baseUpper = baseOriginal.toUpperCase();
  const baseTitle = toTitleCase(baseOriginal);

  const baseForms = unique([baseOriginal, baseUpper, baseTitle]);

  const variants = baseForms.flatMap((base) => {
    const noCommas = base.replace(/,/g, "");
    const noAccents = stripAccents(base);
    const noAccentsNoCommas = stripAccents(noCommas);

    const nameForms = unique([
      base,
      base.replace(/\s+/g, "_"),
      noCommas,
      noCommas.replace(/\s+/g, "_"),
      noAccents,
      noAccents.replace(/\s+/g, "_"),
      noAccentsNoCommas,
      noAccentsNoCommas.replace(/\s+/g, "_"),
    ]);

    return nameForms.flatMap((name) => appendSuffixVariants(name));
  });

  return unique(variants);
};

export const buildCategoryImageCandidates = (
  categoryName: string,
  categoryBaseUrl: string,
  assetVersion: string,
): string[] => {
  const fileNameVariants = buildFileNameVariants(categoryName);
  const base = categoryBaseUrl.replace(/\/$/, "");

  if (base) {
    return fileNameVariants.map((fileName) => `${base}/${encodeURIComponent(fileName)}`);
  }

  return fileNameVariants.map(
    (fileName) =>
      `https://assets.distribuidor-puntopas.com/image/upload/${assetVersion}/${encodeURIComponent(fileName)}`,
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

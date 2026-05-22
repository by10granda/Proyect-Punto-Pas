import type { SyntheticEvent } from "react";

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const variantsForToken = (value: string): string[] => {
  const trimmed = value.trim();
  return unique([
    trimmed,
    trimmed.replace(/\s+/g, "_"),
    trimmed.replace(/_/g, " "),
  ]);
};

export const buildAssetCandidates = (baseUrl: string, folder: string, fileName: string): string[] => {
  const cleanBase = baseUrl.replace(/\/$/, "");
  const folderVariants = variantsForToken(folder);
  const nameVariants = variantsForToken(fileName);

  const urls: string[] = [];
  for (const currentFolder of folderVariants) {
    for (const currentName of nameVariants) {
      urls.push(`${cleanBase}/${encodeURIComponent(currentFolder)}/${encodeURIComponent(currentName)}`);
    }
  }

  return unique(urls);
};

export const handleAssetFallback = (event: SyntheticEvent<HTMLImageElement>): void => {
  const image = event.currentTarget;
  const fallbackValue = image.dataset.fallbacks;
  if (!fallbackValue) return;

  const candidates = fallbackValue.split("|");
  const currentIndex = Number(image.dataset.fallbackIndex || "0");
  const nextIndex = currentIndex + 1;

  if (nextIndex >= candidates.length) {
    image.removeAttribute("data-fallbacks");
    return;
  }

  image.dataset.fallbackIndex = String(nextIndex);
  image.src = candidates[nextIndex];
};

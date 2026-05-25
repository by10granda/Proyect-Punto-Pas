import { buildCategoryImageCandidates } from "@/utils/categoryImage";

export const CATEGORY_IMAGES_BASE_URL = "https://assets.distribuidor-puntopas.com/CATEGORIAS_PRINCIPAL";
export const CATEGORY_CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dx08ybps6/image/upload/v1779574030";
export const CATEGORY_CLOUDINARY_ALT_BASE_URL = "https://res.cloudinary.com/dx08ybps6/image/upload/v1779574028";
export const CATEGORY_CLOUDINARY_ALT2_BASE_URL = "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573805";
export const CATEGORY_IMAGE_VERSION = "v1775785362";

export const CATEGORY_DEFAULT_FALLBACK =
  "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573805/TODOS_123.png";

export const CATEGORY_FIXED_FILES: Record<string, string> = {
  all: "TODOS_123.png",
  TODOS: "TODOS_123.png",
  TELEVISORES: "TELEVISORES_123.png",
  "MUEBLERIA COMEDORES Y MESAS": "MUEBLERIA_COMEDORES_Y_MESAS_123.png",
  "LAVADORAS Y SECADORAS": "LAVADORAS Y SECADORAS_123.png",
  "COCINAS Y CAMPANAS": "COCINAS_Y_CAMPANAS_123.png",
  CELULARES: "CELULARES_123.png",
  "CONGELADORES Y NEVERAS": "CONGELADORES Y NEVERAS_123.png",
};

export const CATEGORY_CLOUDINARY_FIXED_URLS: Record<string, string> = {
  all: "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573805/TODOS_123.png",
  TODOS: "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573805/TODOS_123.png",
  "LAVADORAS Y SECADORAS":
    "https://res.cloudinary.com/dx08ybps6/image/upload/v1779575546/LAVADORAS_Y_SECADORAS_123.png",
  "CONGELADORES Y NEVERAS":
    "https://res.cloudinary.com/dx08ybps6/image/upload/v1779575547/CONGELADORES_Y_NEVERAS_123.png",
};

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const normalizeCategoryKey = (categoryName: string): string => {
  if (categoryName === "all") return "all";
  const normalized = categoryName.toUpperCase().trim();
  return CATEGORY_FIXED_FILES[normalized] ? normalized : categoryName;
};

export const buildCategoryAssetCandidates = (
  categoryName: string,
  envBaseUrl?: string,
  localFallback?: string,
): string[] => {
  const fixedKey = normalizeCategoryKey(categoryName);
  const fixedFile = CATEGORY_FIXED_FILES[fixedKey];
  const fixedAsset = fixedFile
    ? `${CATEGORY_IMAGES_BASE_URL}/${encodeURIComponent(fixedFile)}`
    : "";
  const fixedCloudinary = CATEGORY_CLOUDINARY_FIXED_URLS[fixedKey]
    ? CATEGORY_CLOUDINARY_FIXED_URLS[fixedKey]
    : fixedFile
      ? `${CATEGORY_CLOUDINARY_ALT2_BASE_URL}/${encodeURIComponent(fixedFile)}`
      : "";

  const primary = buildCategoryImageCandidates(categoryName, CATEGORY_IMAGES_BASE_URL, CATEGORY_IMAGE_VERSION);
  const cloudinaryPrimary = buildCategoryImageCandidates(
    categoryName,
    CATEGORY_CLOUDINARY_BASE_URL,
    CATEGORY_IMAGE_VERSION,
  );
  const cloudinaryAlt = buildCategoryImageCandidates(
    categoryName,
    CATEGORY_CLOUDINARY_ALT_BASE_URL,
    CATEGORY_IMAGE_VERSION,
  );
  const cloudinaryAlt2 = buildCategoryImageCandidates(
    categoryName,
    CATEGORY_CLOUDINARY_ALT2_BASE_URL,
    CATEGORY_IMAGE_VERSION,
  );
  const envCandidates =
    envBaseUrl && envBaseUrl !== CATEGORY_IMAGES_BASE_URL
      ? buildCategoryImageCandidates(categoryName, envBaseUrl, CATEGORY_IMAGE_VERSION)
      : [];

  return unique([
    fixedAsset,
    fixedCloudinary,
    ...primary,
    ...cloudinaryPrimary,
    ...cloudinaryAlt,
    ...cloudinaryAlt2,
    ...envCandidates,
    localFallback || "",
    CATEGORY_DEFAULT_FALLBACK,
  ]);
};

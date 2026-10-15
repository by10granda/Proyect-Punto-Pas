export type BranchKey = "almacen-pas" | "variedades-pas" | "sucursal-3";

export interface BranchConfig {
  key: BranchKey;
  label: string;
  location: string;
  apiBaseUrl: string;
  username: string;
  password: string;
}

export interface BranchOption {
  key: BranchKey;
  label: string;
  location: string;
}

const BRANCH_STORAGE_KEY = "puntopas_selected_branch";

const env = import.meta.env as Record<string, string | undefined>;

const getEnv = (key: string) => env[key];

const branchConfigs: Record<BranchKey, BranchConfig> = {
  "almacen-pas": {
    key: "almacen-pas",
    label: "Almacen Pas",
    location: "Esmeraldas",
    apiBaseUrl: getEnv("VITE_BRANCH1_API_BASE_URL") || getEnv("VITE_API_BASE_URL") || "https://api.distribuidor-puntopas.com/api",
    username: getEnv("VITE_BRANCH1_API_USERNAME") || getEnv("VITE_SIAPE_USERNAME") || "Yuberin",
    password: getEnv("VITE_BRANCH1_API_PASSWORD") || getEnv("VITE_SIAPE_PASSWORD") || "2015",
  },
  "variedades-pas": {
    key: "variedades-pas",
    label: "Variedades Pas",
    location: "San Lorenzo",
    apiBaseUrl: getEnv("VITE_BRANCH2_API_BASE_URL") || "https://api-sucursal2.distribuidor-puntopas.com/api",
    username: getEnv("VITE_BRANCH2_API_USERNAME") || "Byron10",
    password: getEnv("VITE_BRANCH2_API_PASSWORD") || "1998",
  },
  "sucursal-3": {
    key: "sucursal-3",
    label: "Sucursal 3",
    location: "Por definir",
    apiBaseUrl: getEnv("VITE_BRANCH3_API_BASE_URL") || "https://api-sucursal3.distribuidor-puntopas.com/api",
    username: getEnv("VITE_BRANCH3_API_USERNAME") || "bayrong",
    password: getEnv("VITE_BRANCH3_API_PASSWORD") || "1998",
  },
};

export const getBranchOptions = (): BranchOption[] =>
  [branchConfigs["almacen-pas"]].map(({ key, label, location }) => ({ key, label, location }));

export const getSelectedBranchKey = (): BranchKey => {
  if (typeof window === "undefined") return "almacen-pas";

  const stored = window.localStorage.getItem(BRANCH_STORAGE_KEY);
  if (stored !== null && stored !== "almacen-pas") {
    window.localStorage.setItem(BRANCH_STORAGE_KEY, "almacen-pas");
  }

  return "almacen-pas";
};

export const setSelectedBranchKey = (key: BranchKey) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BRANCH_STORAGE_KEY, "almacen-pas");
};

export const getSelectedBranchConfig = (): BranchConfig => branchConfigs[getSelectedBranchKey()];

export const getBranchConfigByKey = (key: BranchKey): BranchConfig => branchConfigs[key];

// Keep browser requests on the website origin; the server handles the SIAPE tunnel.
export const getApiBaseUrl = (): string => `/api/${getSelectedBranchKey()}`;

export const shouldHideProductImages = (): boolean => getSelectedBranchKey() === "variedades-pas";

export const getApiConfig = () => {
  const branch = getSelectedBranchConfig();

  return {
    username: branch.username,
    password: branch.password,
    IdPuntoVenta: 1,
    IdNivelPrecio: 1,
    timeout: 10000,
  };
};

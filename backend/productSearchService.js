const normalize = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const STOPWORDS = new Set([
  "tienes",
  "tiene",
  "hay",
  "busco",
  "buscar",
  "quiero",
  "necesito",
  "de",
  "la",
  "el",
  "los",
  "las",
  "un",
  "una",
  "por",
  "favor",
  "me",
  "para",
]);

const SYNONYMS = {
  nevera: ["nevera", "neveras", "refrigeradora", "refrigerador", "congelador", "congeladores"],
  paila: ["paila", "pailas", "cocina", "cocinas", "estufa", "estufas"],
  lavadora: ["lavadora", "lavadoras", "secadora", "secadoras"],
  televisor: ["tv", "televisor", "televisores", "pantalla", "pantallas"],
  celular: ["cel", "celular", "celulares", "telefono", "telefonos", "smartphone"],
};

const tokenize = (query = "") => {
  const raw = normalize(query)
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !STOPWORDS.has(token));

  const expanded = new Set(raw);
  Object.values(SYNONYMS).forEach((group) => {
    if (group.some((item) => raw.includes(item))) {
      group.forEach((item) => expanded.add(item));
    }
  });

  return [...expanded];
};

const getPrice = (product) => {
  const value = product.puntoPasPrice || product.pvpPrice || product.price;
  return Number.isFinite(value) && value > 0 ? value : null;
};

export const searchProducts = (query, products = []) => {
  const q = normalize(query);
  if (!q) return [];
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  return products
    .filter((p) => p?.isActive)
    .map((product) => {
      const blob = normalize(`${product.name} ${product.brand} ${product.category} ${product.type} ${product.code || ""}`);
      const tokenHits = tokens.reduce((acc, token) => (blob.includes(token) ? acc + 1 : acc), 0);
      const phraseHit = blob.includes(q) ? 2 : 0;
      const score = tokenHits + phraseHit;
      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product)
    .slice(0, 8);
};

export const getProductDetails = (productId, products = []) =>
  products.find((product) => product.id === productId);

export const getCategories = (products = []) =>
  [...new Set(products.filter((p) => p?.isActive).map((p) => p.category).filter(Boolean))];

export const getPromotions = (products = []) =>
  products.filter((product) => product?.isActive && ((product.discount || 0) > 0 || (product.puntoPasPrice || 0) > 0));

export const getContactInfo = () => ({
  phone: "095 9990 999",
  branches: ["Esmeraldas", "San Lorenzo", "Sucursal Stihl"],
});

export const suggestSimilarProducts = (query, products = []) => {
  const q = normalize(query);
  const tokens = tokenize(query);
  const categories = getCategories(products);
  const category = categories.find((entry) => {
    const normalizedCategory = normalize(entry);
    return normalizedCategory.includes(q) || tokens.some((token) => normalizedCategory.includes(token));
  });
  if (!category) return [];
  return products.filter((product) => product?.isActive && product.category === category).slice(0, 6);
};

export const toProductCard = (product) => ({
  id: product.id,
  code: product.code,
  name: product.name,
  brand: product.brand,
  category: product.category,
  stock: product.stock,
  image: product.image,
  price: getPrice(product),
});

import { Product } from "@/data/products";
import { buildSearchSuggestions } from "@/application/use-cases/searchSuggestions";

export interface ChatReply {
  text: string;
  products?: Product[];
  source?: "openai" | "openai-unavailable" | "ollama" | "fallback" | "ollama-unavailable";
}

export interface ChatTurn {
  role: "assistant" | "user";
  text: string;
}

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const isGreeting = (value: string): boolean => {
  const text = normalize(value);
  return ["hola", "buenas", "buen dia", "buenos dias", "hey", "hello"].includes(text);
};

const getPrice = (product: Product): number | null => {
  const price = product.puntoPasPrice || product.pvpPrice || product.price;
  return Number.isFinite(price) && price > 0 ? price : null;
};

export const searchProducts = (query: string, products: Product[]): Product[] => {
  const suggestions = buildSearchSuggestions(products.filter((p) => p.isActive), query, 12);
  const ids = new Set<string>();
  const results: Product[] = [];
  suggestions.forEach((suggestion) => {
    if (suggestion.product && !ids.has(suggestion.product.id)) {
      ids.add(suggestion.product.id);
      results.push(suggestion.product);
    }
  });
  return results;
};

export const getProductDetails = (productId: string, products: Product[]): Product | undefined =>
  products.find((product) => product.id === productId);

export const getCategories = (products: Product[]): string[] =>
  [...new Set(products.filter((p) => p.isActive).map((p) => p.category).filter(Boolean))];

export const getPromotions = (products: Product[]): Product[] =>
  products.filter((product) => product.isActive && ((product.discount || 0) > 0 || (product.puntoPasPrice || 0) > 0));

export const getContactInfo = () => ({
  phone: "095 9990 999",
  branches: ["Esmeraldas", "San Lorenzo", "Sucursal Stihl"],
});

export const suggestSimilarProducts = (query: string, products: Product[]): Product[] => {
  const normalized = normalize(query);
  const categories = getCategories(products);
  const matchedCategory = categories.find((category) => normalize(category).includes(normalized));
  if (!matchedCategory) return [];
  return products.filter((product) => product.isActive && product.category === matchedCategory).slice(0, 6);
};

export const fallbackChatReply = (message: string, products: Product[]): ChatReply => {
  const clean = message.trim();
  if (!clean) {
    return { text: "Te puedo ayudar a encontrar el producto ideal. Cuentame que estas buscando." };
  }

  if (isGreeting(clean)) {
    return {
      text: "Hola, soy Asesor Punto PAS. Estoy aqui para ayudarte a comprar facil y rapido. Puedes decirme que producto buscas y te muestro opciones reales.",
    };
  }

  if (clean.length > 280) {
    return { text: "Tu mensaje es muy largo. Podrias resumirlo en una sola consulta para ayudarte mejor?" };
  }

  const normalized = normalize(clean);
  const contact = getContactInfo();

  if (normalized.includes("contact") || normalized.includes("asesor")) {
    return {
      text: `Puedes contactarnos al ${contact.phone}. Si deseas, tambien te guio por categorias o marcas para avanzar en tu compra.`,
    };
  }

  if (normalized.includes("informacion") || normalized.includes("info") || normalized.includes("ayuda")) {
    return {
      text: "Claro, te ayudo con gusto. Puedo darte informacion de productos, precios, marcas, categorias, promociones, sucursales y como comprar. Dime por cual quieres empezar.",
    };
  }

  if (normalized.includes("promoc") || normalized.includes("oferta") || normalized.includes("descuento")) {
    const promos = getPromotions(products).slice(0, 3);
    if (promos.length === 0) {
      return {
        text: "Ahora no veo promociones confirmadas en el sistema. Para confirmar precio actualizado, comunicate con un asesor.",
      };
    }
    return {
      text: "Tenemos varias opciones disponibles en promocion. Te puedo mostrar alternativas por categoria o marca.",
      products: promos,
    };
  }

  if (normalized.includes("categoria") || normalized.includes("categorias")) {
    const categories = getCategories(products).slice(0, 8);
    return {
      text: `Estas son algunas categorias disponibles: ${categories.join(", ")}. Te puedo ayudar a encontrar el producto ideal dentro de una categoria especifica.`,
    };
  }

  if (normalized.includes("marca") || normalized.includes("marcas")) {
    const brands = [...new Set(products.filter((p) => p.isActive).map((p) => p.brand).filter(Boolean))].slice(0, 8);
    return {
      text: `Trabajamos con marcas como ${brands.join(", ")}. Tenemos varias opciones disponibles segun tu presupuesto.`,
    };
  }

  if (normalized.includes("sucursal") || normalized.includes("tienda")) {
    return {
      text: `Tenemos sucursales en ${contact.branches.join(", ")}. Te puedo ayudar con productos, precios, categorias y promociones de Punto PAS.`,
    };
  }

  const matches = searchProducts(clean, products).slice(0, 4);
  if (matches.length > 0) {
    const first = matches[0];
    const price = getPrice(first);
    if (!price) {
      return {
        text: `Si, tenemos opciones en ${first.category}. Para confirmar precio actualizado, comunicate con un asesor. Te puedo mostrarte alternativas similares.`,
        products: matches,
      };
    }
    return {
      text: `Si, tenemos varias opciones disponibles. Por ejemplo ${first.name} por $${price.toFixed(2)}. Te puedo ayudar a encontrar el producto ideal por marca, tamano o precio.`,
      products: matches,
    };
  }

  const alternatives = suggestSimilarProducts(clean, products);
  if (alternatives.length > 0) {
    return {
      text: "No encontre exactamente ese producto, pero puedo mostrarte alternativas similares.",
      products: alternatives,
    };
  }

  if (
    normalized.includes("clima") ||
    normalized.includes("politica") ||
    normalized.includes("deporte") ||
    normalized.includes("viaje")
  ) {
    return {
      text: "Puedo ayudarte con productos, precios, categorias y promociones de Punto PAS. Si me dices que deseas comprar, te asesoro enseguida.",
    };
  }

  return {
    text: "No encontre informacion exacta en este momento. Te puedo ayudar a buscar por categoria, marca o rango de precio.",
  };
};

export const askAssistant = async (message: string, products: Product[], history: ChatTurn[] = []): Promise<ChatReply> => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, products, history }),
    });

    if (!response.ok) {
      return fallbackChatReply(message, products);
    }

    const data = (await response.json()) as ChatReply;
    if (!data?.text) {
      return fallbackChatReply(message, products);
    }
    return data;
  } catch {
    return fallbackChatReply(message, products);
  }
};

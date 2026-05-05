import {
  searchProducts,
  getPromotions,
  getCategories,
  getContactInfo,
  suggestSimilarProducts,
  toProductCard,
} from "./productSearchService.js";
import { companyContext } from "./companyContext.js";

const ASSISTANT_MODE = process.env.ASSISTANT_MODE || "hybrid";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || "";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 45000);
const REQUIRE_OLLAMA = (process.env.ASSISTANT_REQUIRE_OLLAMA || "false").toLowerCase() === "true";

const normalize = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const isOutOfScope = (message) => {
  const text = normalize(message);
  return ["clima", "politica", "futbol", "series", "pelicula"].some((item) => text.includes(item));
};

const isGreeting = (message = "") => {
  const text = normalize(message);
  return ["hola", "buenas", "buen dia", "buenos dias", "hey", "hello"].includes(text);
};

const CTA_OPTIONS = [
  "Quieres que te muestre opciones por marca o por precio?",
  "Prefieres que te recomiende 3 opciones concretas?",
  "Te ayudo a filtrar por presupuesto o por categoria?",
];

const addHumanClose = (text) => {
  const clean = (text || "").trim();
  if (!clean) return clean;
  if (/[?]$/.test(clean)) return clean;
  const pick = CTA_OPTIONS[Math.floor(Math.random() * CTA_OPTIONS.length)];
  return `${clean} ${pick}`;
};

const buildHistoryContext = (history = []) => {
  if (!Array.isArray(history) || history.length === 0) return "";
  return history
    .slice(-6)
    .map((turn) => `${turn.role === "assistant" ? "Asistente" : "Cliente"}: ${String(turn.text || "").slice(0, 220)}`)
    .join("\n");
};

const isSimpleGreeting = (message = "") => {
  const text = normalize(message);
  return ["hola", "buenas", "buen dia", "buenos dias", "hey"].includes(text);
};

const buildCatalogContext = (products = [], message = "") => {
  const text = normalize(message);
  const active = products
    .filter((p) => p?.isActive)
    .sort((a, b) => {
      const aBlob = normalize(`${a.name} ${a.brand} ${a.category} ${a.type}`);
      const bBlob = normalize(`${b.name} ${b.brand} ${b.category} ${b.type}`);
      const aScore = text && aBlob.includes(text) ? 1 : 0;
      const bScore = text && bBlob.includes(text) ? 1 : 0;
      return bScore - aScore;
    })
    .slice(0, 12);
  return active
    .map((p) => {
      const price = p.puntoPasPrice || p.pvpPrice || p.price || 0;
      return `- ${p.name} | marca: ${p.brand} | categoria: ${p.category} | precio: ${price || "N/D"} | stock: ${p.stock}`;
    })
    .join("\n");
};

const buildCompanyContext = () => {
  const branches = companyContext.branches
    .map((b) => `- ${b.name} (${b.city}) | telefono: ${b.phone} | horario: ${b.hours}`)
    .join("\n");

  return [
    `Empresa: ${companyContext.name}`,
    `Quienes somos: ${companyContext.whoWeAre}`,
    `Mision: ${companyContext.mission}`,
    `Vision: ${companyContext.vision}`,
    "Sucursales:",
    branches,
  ].join("\n");
};

const tryOllamaReply = async ({ message, products = [], history = [] }) => {
  if (ASSISTANT_MODE !== "ollama") return null;

  const lightweight = isSimpleGreeting(message);
  const topMatches = searchProducts(message, products).slice(0, 8);
  const relevantProducts = topMatches.length > 0 ? topMatches : products;

  const prompt = [
    "Eres Russo, asesor de ventas de Punto PAS.",
    "Responde como humano: cercano, claro, amable, profesional y vendedor sin ser agresivo.",
    "Usa frases cortas y naturales, evita sonar robotico.",
    "No inventes precios, stock ni promociones.",
    "Si no hay dato exacto, dilo con transparencia y guia al cliente.",
    "Si falta informacion, di: Para confirmar precio actualizado, comunicate con un asesor.",
    "Si la pregunta no es de tienda, responde: Puedo ayudarte con productos, precios, categorias y promociones de Punto PAS.",
    "Cierra con una pregunta breve para continuar la compra.",
    "Contexto institucional:",
    buildCompanyContext(),
    ...(lightweight
      ? []
      : ["Catalogo disponible (resumen relevante):", buildCatalogContext(relevantProducts, message)]),
    "Contexto reciente de conversacion:",
    buildHistoryContext(history),
    `Pregunta del cliente: ${message}`,
  ].join("\n\n");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);
    const headers = { "Content-Type": "application/json" };
    if (OLLAMA_API_KEY) {
      headers.Authorization = `Bearer ${OLLAMA_API_KEY}`;
    }

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 220,
        },
      }),
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const data = await response.json();
    const text = typeof data?.response === "string" ? data.response.trim() : "";
    if (!text) return null;
    return { text: addHumanClose(text), source: "ollama" };
  } catch {
    return null;
  }
};

export const assistantService = async ({ message, products = [], history = [] }) => {
  const clean = (message || "").trim();
  if (!clean) {
    return { text: "Te puedo ayudar a encontrar el producto ideal. Dime que producto buscas.", source: "fallback" };
  }
  if (clean.length > 280) {
    return { text: "Tu mensaje es muy largo. Enviame una consulta mas corta para ayudarte mejor.", source: "fallback" };
  }

  const normalized = normalize(clean);
  const contact = getContactInfo();

  const ollamaReply = await tryOllamaReply({ message: clean, products, history });
  if (ollamaReply?.text) {
    return ollamaReply;
  }
  if (ASSISTANT_MODE === "ollama" && REQUIRE_OLLAMA) {
    return {
      text: "Russo esta conectando con IA en este momento. Intenta nuevamente en unos segundos.",
      source: "ollama-unavailable",
    };
  }

  if (isGreeting(clean)) {
    return {
      text: "Hola, soy Russo. Que bueno tenerte aqui. Te ayudo con productos, precios, categorias, promociones y sucursales.",
      source: "fallback",
    };
  }

  if (isOutOfScope(clean)) {
    return {
      text: "Puedo ayudarte con productos, precios, categorias y promociones de Punto PAS. Cuentame que producto deseas revisar.",
      source: "fallback",
    };
  }

  if (normalized.includes("contact") || normalized.includes("asesor")) {
    return {
      text: addHumanClose(`Para atencion directa puedes comunicarte al ${contact.phone}. Tambien puedo orientarte por categoria, marca o presupuesto.`),
      source: "fallback",
    };
  }

  if (
    normalized.includes("informacion") ||
    normalized.includes("informacion de") ||
    normalized.includes("necesito info") ||
    normalized.includes("ayuda")
  ) {
    return {
      text: addHumanClose(
        "Claro, con gusto. Te puedo ayudar con productos, precios, categorias, marcas, promociones, sucursales y como comprar."
      ),
      source: "fallback",
    };
  }

  if (normalized.includes("promoc") || normalized.includes("descuento") || normalized.includes("oferta")) {
    const promotions = getPromotions(products).slice(0, 3).map(toProductCard);
    if (promotions.length === 0) {
      return { text: addHumanClose("No encuentro promociones confirmadas en este momento. Para confirmar precio actualizado, comunicate con un asesor."), source: "fallback" };
    }
    return {
      text: addHumanClose("Tenemos varias opciones disponibles en promocion. Te muestro algunas para ayudarte a comprar."),
      products: promotions,
      source: "fallback",
    };
  }

  if (normalized.includes("categoria")) {
    const categories = getCategories(products).slice(0, 8);
    return {
      text: addHumanClose(`Categorias destacadas: ${categories.join(", ")}. Te puedo mostrar modelos por marca, tamano o precio.`),
      source: "fallback",
    };
  }

  if (normalized.includes("sucursal") || normalized.includes("tienda")) {
    return {
      text: addHumanClose(`Tenemos sucursales en ${contact.branches.join(", ")}. Si deseas, te recomiendo la mas cercana segun tu consulta.`),
      source: "fallback",
    };
  }

  const matches = searchProducts(clean, products).map(toProductCard);
  if (matches.length > 0) {
    const first = matches[0];
    if (!first.price) {
      return {
        text: addHumanClose(`Encontramos ${matches.length} opciones relacionadas. Para confirmar precio actualizado, comunicate con un asesor.`),
        products: matches,
        source: "fallback",
      };
    }
    return {
      text: addHumanClose(`Si, tenemos varias opciones disponibles. Por ejemplo ${first.name} de ${first.brand} por $${first.price.toFixed(2)}. Te puedo ayudar a elegir la mejor opcion.`),
      products: matches,
      source: "fallback",
    };
  }

  const alternatives = suggestSimilarProducts(clean, products).map(toProductCard);
  if (alternatives.length > 0) {
    return {
      text: addHumanClose("No encontre exactamente ese producto, pero puedo mostrarte alternativas similares disponibles."),
      products: alternatives,
      source: "fallback",
    };
  }

  return {
    text: addHumanClose("No encuentro informacion exacta en este momento. Te puedo ayudar a buscar por categoria, marca o precio para encontrar la mejor opcion."),
    source: "fallback",
  };
};

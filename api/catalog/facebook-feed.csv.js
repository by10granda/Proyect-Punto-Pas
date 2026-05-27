const SIAPE_BASE_URL = process.env.SIAPE_BASE_URL || "http://26.65.247.204:91/api";

const normalizeBaseUrl = () =>
  SIAPE_BASE_URL.endsWith("/") ? SIAPE_BASE_URL.slice(0, -1) : SIAPE_BASE_URL;

const normalizeCode = (value) => String(value || "").trim().padStart(8, "0").substring(0, 8);

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const csvEscape = (value) => {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const detectCurrency = () => (process.env.FACEBOOK_FEED_CURRENCY || "USD").toUpperCase();

const getPublicBaseUrl = (req) => {
  const configured = process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  if (configured) return configured.replace(/\/$/, "");

  const host = req.headers["x-forwarded-host"] || req.headers.host || "www.distribuidor-puntopas.com";
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`.replace(/\/$/, "");
};

const buildProductImageUrl = (code) =>
  `https://assets.distribuidor-puntopas.com/PRODUCTOS_ESMERALDAS2/${code}_E.png`;

const fetchJson = async (url) => {
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(`Upstream error ${response.status} at ${url}`);
  }
  return response.json();
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const base = normalizeBaseUrl();
    const [items, inventory] = await Promise.all([
      fetchJson(`${base}/item/search3`),
      fetchJson(`${base}/item/inventario`).catch(() => []),
    ]);

    const inventoryMap = new Map();
    if (Array.isArray(inventory)) {
      inventory.forEach((entry) => {
        inventoryMap.set(normalizeCode(entry?.codigo), toNumber(entry?.disponible));
      });
    }

    const siteBaseUrl = getPublicBaseUrl(req);
    const currency = detectCurrency();

    const headers = [
      "id",
      "title",
      "description",
      "availability",
      "condition",
      "price",
      "link",
      "image_link",
      "brand",
    ];

    const rows = [headers.join(",")];

    if (Array.isArray(items)) {
      const activeItems = items.filter((item) => String(item?.estado || "").toUpperCase() === "A");

      activeItems.forEach((item) => {
        const code = normalizeCode(item?.codigo);
        const title = String(item?.descripcionItem || "Producto").trim() || `Producto ${code}`;
        const description = String(item?.descripcionLarga || item?.descripcionItem || title).trim();
        const brand = String(item?.descripcionMarca || "Generica").trim() || "Generica";
        const stock = inventoryMap.get(code) ?? 0;
        const availability = stock > 0 ? "in stock" : "out of stock";
        const priceValue = toNumber(item?.precioVentaConImpuestos) || toNumber(item?.precioVentaSinImpuestos);
        const price = `${priceValue.toFixed(2)} ${currency}`;
        const link = `${siteBaseUrl}/product/${encodeURIComponent(String(item?.codigo || code))}`;
        const imageLink = buildProductImageUrl(code);

        const line = [
          code,
          title,
          description,
          availability,
          "new",
          price,
          link,
          imageLink,
          brand,
        ]
          .map(csvEscape)
          .join(",");

        rows.push(line);
      });
    }

    res.status(200);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=900, s-maxage=900");
    res.send(rows.join("\n"));
  } catch (error) {
    res.status(500).json({
      error: "No se pudo generar el feed de Facebook",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}

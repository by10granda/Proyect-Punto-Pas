const SIAPE_BASE_URL = process.env.SIAPE_BASE_URL || "http://26.65.247.204:91/api";

const normalizeBaseUrl = () =>
  SIAPE_BASE_URL.endsWith("/") ? SIAPE_BASE_URL.slice(0, -1) : SIAPE_BASE_URL;

const normalizeCodeVariants = (value) => {
  const raw = String(value || "").trim();
  const padded = raw.padStart(8, "0").substring(0, 8);
  const numericLike = /^\d+$/.test(raw) ? String(Number(raw)) : raw;
  return [...new Set([raw, padded, numericLike])].filter(Boolean);
};

const fetchItemByCode = async (authorization, code) => {
  const base = normalizeBaseUrl();
  const targetUrl = `${base}/item?code=${encodeURIComponent(code)}`;
  const headers = {};
  if (authorization) headers.Authorization = authorization;

  const upstream = await fetch(targetUrl, {
    method: "GET",
    headers,
  });

  return {
    status: upstream.status,
    contentType: upstream.headers.get("content-type") || "application/json",
    buffer: Buffer.from(await upstream.arrayBuffer()),
  };
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const code = req.query?.code;
  if (!code) {
    res.status(400).json({
      type: "ValidationFailure",
      title: "Validacion de datos",
      status: 400,
      detail: "El parametro code es obligatorio",
    });
    return;
  }

  try {
    const variants = normalizeCodeVariants(code);
    let lastResponse = null;

    for (const candidate of variants) {
      const response = await fetchItemByCode(req.headers.authorization, candidate);
      lastResponse = response;
      if (response.status < 400) {
        res.status(response.status);
        res.setHeader("Content-Type", response.contentType);
        res.setHeader("Cache-Control", "no-store");
        res.send(response.buffer);
        return;
      }
    }

    if (lastResponse) {
      res.status(lastResponse.status);
      res.setHeader("Content-Type", lastResponse.contentType);
      res.setHeader("Cache-Control", "no-store");
      res.send(lastResponse.buffer);
      return;
    }

    res.status(404).json({ error: "Not found" });
  } catch (error) {
    res.status(500).json({
      error: "Proxy SIAPE no disponible",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}

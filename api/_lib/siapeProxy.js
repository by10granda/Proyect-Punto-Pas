const DEFAULT_SIAPE_BASE_URL = "https://api.distribuidor-puntopas.com/api";
const LEGACY_SIAPE_BASE_URL = "http://26.65.247.204:91/api";
const REQUEST_TIMEOUT_MS = 12000;

const getBaseUrls = () => {
  const configuredBaseUrls = (process.env.SIAPE_BASE_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  return Array.from(new Set([...configuredBaseUrls, DEFAULT_SIAPE_BASE_URL, LEGACY_SIAPE_BASE_URL]))
    .map((url) => (url.endsWith("/") ? url.slice(0, -1) : url));
};

const buildUrl = (base, path, query = {}) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, String(entry)));
    } else {
      params.append(key, String(value));
    }
  });

  const withPath = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const queryString = params.toString();
  return queryString ? `${withPath}?${queryString}` : withPath;
};

const fetchWithTimeout = async (url, options) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const readRawBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

export const proxyToSiape = async (req, res, path, options = {}) => {
  const { method = req.method || "GET", query = req.query || {} } = options;

  const headers = {};
  if (req.headers.authorization) headers.Authorization = req.headers.authorization;
  if (req.headers["content-type"]) headers["Content-Type"] = req.headers["content-type"];

  let body;
  if (!(method === "GET" || method === "HEAD")) {
    if (req.body !== undefined && req.body !== null) {
      if (Buffer.isBuffer(req.body)) body = req.body;
      else if (typeof req.body === "string") body = req.body;
      else body = JSON.stringify(req.body);
    } else {
      body = await readRawBody(req);
    }
  }

  const baseUrls = getBaseUrls();
  let upstream;
  let lastError;

  for (const baseUrl of baseUrls) {
    try {
      upstream = await fetchWithTimeout(buildUrl(baseUrl, path, query), {
        method,
        headers,
        body,
      });

      if (![502, 503, 504].includes(upstream.status)) break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!upstream) {
    throw lastError || new Error("No se pudo conectar con SIAPE");
  }

  const contentType = upstream.headers.get("content-type") || "application/json";
  const responseBuffer = Buffer.from(await upstream.arrayBuffer());

  res.status(upstream.status);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "no-store");
  res.send(responseBuffer);
};

const SIAPE_BASE_URL = process.env.SIAPE_BASE_URL || "http://26.65.247.204:91/api";

const normalizeBaseUrl = () => {
  const base = SIAPE_BASE_URL.endsWith("/") ? SIAPE_BASE_URL.slice(0, -1) : SIAPE_BASE_URL;
  return base;
};

const buildUrl = (path, query = {}) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, String(entry)));
    } else {
      params.append(key, String(value));
    }
  });

  const base = normalizeBaseUrl();
  const withPath = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const queryString = params.toString();
  return queryString ? `${withPath}?${queryString}` : withPath;
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
  const targetUrl = buildUrl(path, query);

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

  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body,
  });

  const contentType = upstream.headers.get("content-type") || "application/json";
  const responseBuffer = Buffer.from(await upstream.arrayBuffer());

  res.status(upstream.status);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "no-store");
  res.send(responseBuffer);
};

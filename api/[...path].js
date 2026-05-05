const SIAPE_BASE_URL = process.env.SIAPE_BASE_URL || "http://26.65.247.204:91";

const buildTargetUrl = (pathSegments, query) => {
  const path = Array.isArray(pathSegments) ? pathSegments.join("/") : "";
  const normalizedBase = SIAPE_BASE_URL.endsWith("/") ? SIAPE_BASE_URL.slice(0, -1) : SIAPE_BASE_URL;
  const url = `${normalizedBase}/${path}`;
  if (!query || Object.keys(query).length === 0) return url;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, String(entry)));
    } else {
      params.append(key, String(value));
    }
  });
  return `${url}?${params.toString()}`;
};

const readRawBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    const targetUrl = buildTargetUrl(req.query.path, { ...req.query, path: undefined });

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
  } catch (error) {
    res.status(500).json({
      error: "Proxy SIAPE no disponible",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}

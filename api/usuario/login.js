import { proxyToSiape } from "../_lib/siapeProxy.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    await proxyToSiape(req, res, "/usuario/login", { method: "POST", query: {} });
  } catch (error) {
    res.status(500).json({
      error: "Proxy SIAPE no disponible",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}

import { proxyToSiape } from "../_lib/siapeProxy.js";

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
    await proxyToSiape(req, res, "/item", {
      method: "GET",
      query: { code },
    });
  } catch (error) {
    res.status(500).json({
      error: "Proxy SIAPE no disponible",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}

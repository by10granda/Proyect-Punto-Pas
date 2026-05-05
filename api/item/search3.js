const { proxyToSiape } = require("../_lib/siapeProxy");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    await proxyToSiape(req, res, "/item/search3", {
      method: "GET",
      query: {
        IdPuntoVenta: req.query.IdPuntoVenta,
        IdNivelPrecio: req.query.IdNivelPrecio,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Proxy SIAPE no disponible",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

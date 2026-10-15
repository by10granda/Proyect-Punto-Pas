import { proxyToSiape } from "./_lib/siapeProxy.js";
import { fetchSiape } from "./_lib/siapeTransport.js";

const branchUrls = {
  "almacen-pas": process.env.SIAPE_BRANCH1_BASE_URL || "https://api.distribuidor-puntopas.com/api",
  "variedades-pas": process.env.SIAPE_BRANCH2_BASE_URL || "https://api-sucursal2.distribuidor-puntopas.com/api",
  "sucursal-3": process.env.SIAPE_BRANCH3_BASE_URL || "https://api-sucursal3.distribuidor-puntopas.com/api",
};

const methods = {
  "usuario/login": "POST",
  "item/search3": "GET",
  "item/inventario": "GET",
  "item/reporteinventario": "GET",
  "clasificacionitem/search": "GET",
  item: "GET",
  factura: "POST",
};

export default async function handler(req, res) {
  const { branch, endpoint, ...query } = req.query || {};
  if (typeof branch !== "string" || typeof endpoint !== "string" ||
      !Object.hasOwn(branchUrls, branch) || !Object.hasOwn(methods, endpoint)) {
    return res.status(404).json({ detail: "Ruta SIAPE no encontrada" });
  }
  if (req.method !== methods[endpoint]) {
    res.setHeader("Allow", methods[endpoint]);
    return res.status(405).json({ detail: "Metodo no permitido" });
  }

  try {
    // A branch must never fall back to another branch's catalog or inventory.
    await proxyToSiape(req, res, `/${endpoint}`, {
      method: req.method,
      query,
      baseUrl: branchUrls[branch],
      transport: fetchSiape,
    });
  } catch (error) {
    console.error("Error de conexion SIAPE", branch, endpoint, error instanceof Error ? error.name : "Error");
    res.status(502).json({ detail: "No se pudo conectar con la API de la sucursal. Intenta nuevamente." });
  }
}

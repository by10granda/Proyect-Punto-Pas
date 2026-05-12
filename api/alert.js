const TELEGRAM_API_BASE = "https://api.telegram.org";

const safeString = (value, fallback = "") => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    res.status(500).json({ error: "Telegram is not configured" });
    return;
  }

  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const event = safeString(body.event, "productos_no_disponibles");
    const site = safeString(body.site, "distribuidor-puntopas");
    const status = safeString(body.apiStatus, "error");
    const detail = safeString(body.detail, "Fallo al cargar productos");
    const apiUrl = safeString(body.apiUrl, "N/A");
    const timestamp = safeString(body.timestamp, new Date().toISOString());

    const message = [
      "ALERTA DE CATALOGO",
      `Evento: ${event}`,
      `Sitio: ${site}`,
      `Estado API: ${status}`,
      `Detalle: ${detail}`,
      `Endpoint: ${apiUrl}`,
      `Hora: ${timestamp}`,
    ].join("\n");

    const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      res.status(502).json({ error: "Telegram request failed", details: errorBody });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({
      error: "Failed to send alert",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

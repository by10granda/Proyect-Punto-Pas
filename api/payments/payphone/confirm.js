const PAYPHONE_CONFIRM_URL = "https://paymentbox.payphonetodoesposible.com/api/confirm";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const token = process.env.PAYPHONE_TOKEN;
    if (!token) {
      res.status(500).json({ error: "PAYPHONE_TOKEN no configurado" });
      return;
    }

    const id = Number(req.body?.id || 0);
    const clientTxId = String(req.body?.clientTxId || "").trim();

    if (!Number.isInteger(id) || id <= 0 || !clientTxId) {
      res.status(400).json({ error: "Parametros invalidos para confirmacion" });
      return;
    }

    const upstream = await fetch(PAYPHONE_CONFIRM_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, clientTxId }),
    });

    const raw = await upstream.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { raw };
    }

    if (!upstream.ok) {
      res.status(upstream.status).json({
        error: "Error confirmando transaccion Payphone",
        details: data?.message || data?.error || "Respuesta no exitosa",
      });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "No se pudo confirmar transaccion Payphone",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}

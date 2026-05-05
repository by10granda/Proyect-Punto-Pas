import http from "http";
import { assistantService } from "./assistantService.js";
import { URL } from "url";
import crypto from "crypto";

const PORT = Number(process.env.CHAT_PORT || 8787);
const DATAFAST_BASE_URL = process.env.DATAFAST_BASE_URL || "https://eu-test.oppwa.com";
const DATAFAST_ENTITY_ID = process.env.DATAFAST_ENTITY_ID || "";
const DATAFAST_BEARER = process.env.DATAFAST_BEARER || "";
const DATAFAST_SHOPPER_RESULT_URL = process.env.DATAFAST_SHOPPER_RESULT_URL || "http://localhost:8080/checkout/pago/resultado";
const DATAFAST_SHOPPER_MID = process.env.DATAFAST_SHOPPER_MID || "1003346";
const DATAFAST_SHOPPER_TID = process.env.DATAFAST_SHOPPER_TID || "6000000";
const DATAFAST_USER_DATA2 = process.env.DATAFAST_USER_DATA2 || "PUNTO PAS";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:8080,http://127.0.0.1:8080")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const MAX_BODY_BYTES = 25_000;
const MAX_PAYMENT_AMOUNT = Number(process.env.DATAFAST_MAX_PAYMENT_AMOUNT || 5000);

const checkoutRegistry = new Map();

const getCorsHeaders = (req) => {
  const origin = req.headers.origin || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Vary": "Origin",
  };
};

const sendJson = (req, res, status, payload) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    ...getCorsHeaders(req),
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
};

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
        reject(new Error("Request demasiado grande"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });

const hasDatafastConfig = () => DATAFAST_ENTITY_ID && DATAFAST_BEARER;

const isValidDatafastBaseUrl = () => {
  try {
    const parsed = new URL(DATAFAST_BASE_URL);
    return parsed.protocol === "https:" && parsed.hostname.endsWith("oppwa.com");
  } catch {
    return false;
  }
};

const isValidCheckoutId = (checkoutId) => /^[A-Za-z0-9.-]{20,120}$/.test(checkoutId);

const getApprovedPaymentState = (code) => {
  const normalized = String(code || "");
  if (/^(000\.000\.|000\.100\.1|000\.[36])/.test(normalized)) return "approved";
  if (/^(000\.200\.|800\.400\.5)/.test(normalized)) return "pending";
  return "rejected";
};

const sanitizeError = (message) => String(message || "Error desconocido").replace(DATAFAST_BEARER, "[redacted]");

const requestDatafast = async (path, method, bodyParams) => {
  const serializedParams = new URLSearchParams(bodyParams).toString();
  const isGet = method.toUpperCase() === "GET";
  const requestUrl = isGet
    ? `${DATAFAST_BASE_URL}${path}${path.includes("?") ? "&" : "?"}${serializedParams}`
    : `${DATAFAST_BASE_URL}${path}`;
  const response = await fetch(requestUrl, {
    method,
    headers: {
      Authorization: `Bearer ${DATAFAST_BEARER}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: isGet ? undefined : serializedParams,
  });

  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    const message = payload?.result?.description || payload?.description || "Error consultando Datafast";
    throw new Error(message);
  }

  return payload;
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    return sendJson(req, res, 204, {});
  }

  if (parsedUrl.pathname === "/api/chat" && req.method === "POST") {
    parseBody(req)
      .then(async (body) => {
        const message = typeof body.message === "string" ? body.message : "";
        const products = Array.isArray(body.products) ? body.products : [];
        const history = Array.isArray(body.history) ? body.history : [];

        const reply = await assistantService({ message, products, history });
        console.log(`[chat] source=${reply.source || "unknown"} products=${products.length} q="${message.slice(0, 80)}"`);
        return sendJson(req, res, 200, reply);
      })
      .catch(() => {
        return sendJson(req, res, 200, {
          text: "No pude procesar tu consulta en este momento. Te puedo ayudar con categorias, marcas o productos especificos.",
        });
      });
    return;
  }

  if (parsedUrl.pathname === "/api/payments/datafast/create-checkout" && req.method === "POST") {
    parseBody(req)
      .then(async (body) => {
        if (!hasDatafastConfig()) {
          return sendJson(req, res, 500, {
            error: "Datafast no configurado",
            details: "Define DATAFAST_ENTITY_ID y DATAFAST_BEARER en variables de entorno.",
          });
        }

        if (!isValidDatafastBaseUrl()) {
          return sendJson(req, res, 500, { error: "Host de Datafast invalido" });
        }

        const amount = Number(body.amount || 0);
        const currency = typeof body.currency === "string" ? body.currency : "USD";
        const paymentType = typeof body.paymentType === "string" ? body.paymentType : "DB";
        const customerDocType = typeof body.customerDocType === "string" ? body.customerDocType : "IDCARD";

        if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_PAYMENT_AMOUNT) {
          return sendJson(req, res, 400, { error: "Monto invalido" });
        }

        if (currency !== "USD" || paymentType !== "DB" || !["IDCARD", "PASSPORT", "TAXSTATEMENT"].includes(customerDocType)) {
          return sendJson(req, res, 400, { error: "Parametros de pago invalidos" });
        }

        const total = amount.toFixed(2);
        const merchantTransactionId = `PUNTOPAS-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
        const payload = await requestDatafast("/v1/checkouts", "POST", {
          entityId: DATAFAST_ENTITY_ID,
          amount: total,
          currency,
          paymentType,
          merchantTransactionId,
          "customer.identificationDocType": customerDocType,
          "customParameters[SHOPPER_MID]": DATAFAST_SHOPPER_MID,
          "customParameters[SHOPPER_TID]": DATAFAST_SHOPPER_TID,
          "customParameters[SHOPPER_ECI]": "0103910",
          "customParameters[SHOPPER_PSERV]": "1791314",
          "customParameters[SHOPPER_VAL_BASE0]": "0.00",
          "customParameters[SHOPPER_VAL_BASEIMP]": total,
          "customParameters[SHOPPER_VAL_IVA]": "0.00",
          "risk.parameters[USER_DATA2]": DATAFAST_USER_DATA2,
        });

        if (!payload?.id || !isValidCheckoutId(payload.id)) {
          return sendJson(req, res, 502, { error: "Respuesta invalida de Datafast" });
        }

        checkoutRegistry.set(payload.id, {
          amount: total,
          currency,
          merchantTransactionId,
          createdAt: Date.now(),
        });

        return sendJson(req, res, 200, {
          checkoutId: payload.id,
          result: payload.result,
          scriptUrl: `${DATAFAST_BASE_URL}/v1/paymentWidgets.js?checkoutId=${payload.id}`,
          shopperResultURL: DATAFAST_SHOPPER_RESULT_URL,
        });
      })
      .catch((error) => {
        return sendJson(req, res, 500, { error: "No se pudo crear checkout", details: sanitizeError(error?.message) });
      });
    return;
  }

  if (parsedUrl.pathname === "/api/payments/datafast/status" && req.method === "GET") {
    const checkoutId = parsedUrl.searchParams.get("checkoutId") || "";
    const resourcePath = parsedUrl.searchParams.get("resourcePath") || "";
    if (!checkoutId || !resourcePath) {
      return sendJson(req, res, 400, { error: "checkoutId y resourcePath son requeridos" });
    }

    if (!isValidCheckoutId(checkoutId) || !resourcePath.startsWith(`/v1/checkouts/${checkoutId}/payment`)) {
      return sendJson(req, res, 400, { error: "Parametros de validacion invalidos" });
    }

    if (!hasDatafastConfig()) {
      return sendJson(req, res, 500, {
        error: "Datafast no configurado",
        details: "Define DATAFAST_ENTITY_ID y DATAFAST_BEARER en variables de entorno.",
      });
    }

    requestDatafast(`${resourcePath}`, "GET", { entityId: DATAFAST_ENTITY_ID })
      .then((payload) => {
        const resultCode = payload?.result?.code || "";
        const paymentState = getApprovedPaymentState(resultCode);
        const originalCheckout = checkoutRegistry.get(checkoutId) || null;
        return sendJson(req, res, 200, {
          ...payload,
          paymentState,
          verified: paymentState === "approved",
          originalCheckout,
        });
      })
      .catch((error) => sendJson(req, res, 500, { error: "No se pudo consultar estado", details: sanitizeError(error?.message) }));
    return;
  }

  return sendJson(req, res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Chat backend listening on http://localhost:${PORT}`);
});

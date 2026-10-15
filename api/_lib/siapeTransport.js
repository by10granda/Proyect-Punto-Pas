import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

export const fetchSiape = (url, options) => new Promise((resolve, reject) => {
  const target = new URL(url);
  const request = target.protocol === "https:" ? httpsRequest : httpRequest;
  const headers = { ...options.headers };
  if (options.body !== undefined) headers["Content-Length"] = Buffer.byteLength(options.body);
  const req = request(target, {
    method: options.method,
    headers,
    signal: options.signal,
  }, (res) => {
    const chunks = [];
    res.on("data", (chunk) => chunks.push(chunk));
    res.on("error", reject);
    res.on("end", () => resolve(new Response(
      [204, 304].includes(res.statusCode) ? null : Buffer.concat(chunks),
      { status: res.statusCode, headers: { "Content-Type": res.headers["content-type"] || "application/json" } },
    )));
  });
  req.on("error", reject);
  req.end(options.body);
});

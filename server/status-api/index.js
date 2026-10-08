// Live status for the portfolio's own services (GET /status, proxied as /api/status).
//
// It checks the health URLs listed in services.config.js, with a timeout, caches the result for
// 60 seconds, and returns only { name, status, latencyMs, checkedAt, history } per service.
// `history` is the last 30 results ({ status, latencyMs }, oldest first), kept in memory: the
// heartbeat strip on the rack is drawn from it. A check also runs every TTL with nobody
// watching, so the history is a steady timeline, not just "whenever someone looked". No URLs,
// no IPs and no error text ever leave this process. The URLs live here, on the server, not in
// the client.
//
//   up        answered 2xx/3xx within SLOW_MS
//   degraded  answered, but slowly (over SLOW_MS) or with a 4xx
//   down      no answer in TIMEOUT_MS, a connection error, or a 5xx
//
// No dependencies. Env (all optional): PORT (4003), ALLOWED_ORIGINS, CACHE_TTL_MS (60000),
// TIMEOUT_MS (3000), SLOW_MS (1500).
import http from "node:http";
import services from "./services.config.js";

const PORT = Number(process.env.PORT) || 4003;
const TTL = Number(process.env.CACHE_TTL_MS) || 60_000;
const TIMEOUT = Number(process.env.TIMEOUT_MS) || 3_000;
const SLOW = Number(process.env.SLOW_MS) || 1_500;
const ORIGINS = (process.env.ALLOWED_ORIGINS || "https://avinashgupta.in").split(",").map((s) => s.trim());

const check = async (svc) => {
  const started = performance.now();
  try {
    const res = await fetch(svc.url, { signal: AbortSignal.timeout(TIMEOUT) });
    await res.arrayBuffer().catch(() => {}); // finish the request so latency covers the whole answer
    const latencyMs = Math.round(performance.now() - started);
    const status = res.status >= 500 ? "down" : res.status >= 400 || latencyMs > SLOW ? "degraded" : "up";
    return { name: svc.name, status, latencyMs };
  } catch {
    return { name: svc.name, status: "down", latencyMs: null };
  }
};

const HISTORY = 30;
const history = new Map(); // name -> [{ status, latencyMs }], oldest first, in memory only

let cache = { at: 0, data: null };
let pending = null;

const refresh = () => {
  if (!pending) {
    pending = Promise.all(services.map(check))
      .then((results) => {
        const checkedAt = new Date().toISOString();
        for (const r of results) {
          const list = history.get(r.name) ?? [];
          list.push({ status: r.status, latencyMs: r.latencyMs });
          history.set(r.name, list.slice(-HISTORY));
        }
        cache = { at: Date.now(), data: results.map((r) => ({ ...r, checkedAt, history: history.get(r.name) })) };
        return cache.data;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
};

const getStatus = () => (cache.data && Date.now() - cache.at < TTL ? Promise.resolve(cache.data) : refresh());

// Keep the timeline going when nobody is looking.
refresh().catch(() => {});
setInterval(() => {
  if (Date.now() - cache.at >= TTL * 0.9) refresh().catch(() => {});
}, TTL);

const send = (req, res, code, body) => {
  const origin = req.headers.origin;
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...(origin && ORIGINS.includes(origin) ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
  });
  res.end(JSON.stringify(body));
};

http
  .createServer(async (req, res) => {
    const path = new URL(req.url, "http://localhost").pathname;
    if (req.method !== "GET") return send(req, res, 405, { error: "method not allowed" });
    if (path === "/health") return send(req, res, 200, { ok: true });
    if (path === "/status") {
      try {
        return send(req, res, 200, { services: await getStatus() });
      } catch {
        return send(req, res, 502, { error: "status unavailable" });
      }
    }
    return send(req, res, 404, { error: "not found" });
  })
  .listen(PORT, "127.0.0.1", () => console.log(`[status-api] listening on 127.0.0.1:${PORT}, ${services.length} services`));

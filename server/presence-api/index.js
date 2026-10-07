// Visitor presence for the portfolio: other visitors' daemons, drawn as faint ghosts.
//
// Socket.IO, namespace /presence. Everything lives in memory and is gone on restart. Nothing
// about a visitor is stored or logged: no IP, no user agent, no cookies. A visitor is a random
// id and a random name like "daemon-4f2" for as long as the connection lasts.
//
//   client -> server   page {page}            which page I am on (every client)
//                      pos {page, x, y}       my pointer, 0-1 of the viewport, max 10/s
//                      presence {on}          show or hide my daemon from others
//   server -> client   hello {id, name, online}
//                      online {total, pages}  when someone joins, leaves or changes page
//                      peers [{id, name, x, y}]  others on my page, batched every 100 ms
//                      presence:off           the server is full, presence is off for you
//
// Limits: 50 connections, a token bucket per socket, malformed messages are dropped, and a
// socket that sends nothing for 10 minutes is disconnected.
//
// GET /counts  ->  { total, pages: { "/": 2, "/notes": 1 } }     GET /health
//
// Env (optional): PORT (4004), ALLOWED_ORIGINS, MAX_CONNECTIONS (50), IDLE_MS (600000)
import http from "node:http";
import { randomBytes } from "node:crypto";
import { Server } from "socket.io";

const PORT = Number(process.env.PORT) || 4004;
const MAX = Number(process.env.MAX_CONNECTIONS) || 50;
const IDLE_MS = Number(process.env.IDLE_MS) || 10 * 60 * 1000;
const TICK_MS = 100;
const ORIGINS = (process.env.ALLOWED_ORIGINS || "https://avinashgupta.in").split(",").map((s) => s.trim());

const visitors = new Map(); // socket.id -> { id, name, page, x, y, draws, shown, tokens, last, dirty, strikes }

const clamp01 = (n) => Math.min(1, Math.max(0, n));
const validPage = (p) => typeof p === "string" && p.length <= 100 && /^\/[A-Za-z0-9\-_./]*$/.test(p);

const makeName = () => {
  const taken = new Set([...visitors.values()].map((v) => v.name));
  for (let i = 0; i < 20; i++) {
    const name = `daemon-${randomBytes(2).toString("hex").slice(0, 3)}`;
    if (!taken.has(name)) return name;
  }
  return `daemon-${randomBytes(3).toString("hex")}`;
};

const counts = () => {
  const pages = {};
  for (const v of visitors.values()) if (v.page) pages[v.page] = (pages[v.page] ?? 0) + 1;
  return { total: visitors.size, pages };
};

const server = http.createServer((req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  const json = (code, body) => {
    res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    res.end(JSON.stringify(body));
  };
  if (req.method !== "GET") return json(405, { error: "method not allowed" });
  if (path === "/counts") return json(200, counts());
  if (path === "/health") return json(200, { ok: true });
  return json(404, { error: "not found" });
});

const io = new Server(server, {
  serveClient: false,
  cors: { origin: ORIGINS },
  maxHttpBufferSize: 2_000, // our messages are tiny
  pingInterval: 25_000,
  pingTimeout: 20_000,
});
const presence = io.of("/presence");

let onlineDirty = false;
const markOnline = () => {
  onlineDirty = true;
};

// A token bucket per socket: 20 messages of burst, 15 a second after that. Beyond it: dropped.
const allow = (v) => {
  const now = Date.now();
  v.tokens = Math.min(20, v.tokens + ((now - v.last) / 1000) * 15);
  v.last = now;
  if (v.tokens < 1) {
    v.strikes += 1;
    return false;
  }
  v.tokens -= 1;
  return true;
};

presence.on("connection", (socket) => {
  if (visitors.size >= MAX) {
    socket.emit("presence:off");
    socket.disconnect(true);
    return;
  }

  const v = {
    id: randomBytes(6).toString("hex"),
    name: makeName(),
    page: null,
    x: 0.5,
    y: 0.5,
    draws: socket.handshake.auth?.passive !== true, // touch and reduced-motion visitors only count
    shown: true,
    tokens: 20,
    last: Date.now(),
    active: Date.now(),
    dirty: false,
    strikes: 0,
  };
  visitors.set(socket.id, v);
  socket.emit("hello", { id: v.id, name: v.name, online: counts() });
  markOnline();

  const touch = () => {
    v.active = Date.now();
    return allow(v);
  };

  socket.on("page", (msg) => {
    if (!touch() || !msg || !validPage(msg.page)) return;
    if (v.page !== msg.page) {
      v.page = msg.page;
      v.dirty = true;
      markOnline();
    }
  });

  socket.on("pos", (msg) => {
    if (!v.draws || !touch() || !msg || !validPage(msg.page)) return;
    if (typeof msg.x !== "number" || typeof msg.y !== "number" || !Number.isFinite(msg.x) || !Number.isFinite(msg.y)) return;
    if (v.page !== msg.page) {
      v.page = msg.page;
      markOnline();
    }
    v.x = clamp01(msg.x);
    v.y = clamp01(msg.y);
    v.dirty = true;
  });

  socket.on("presence", (msg) => {
    if (!touch() || !msg || typeof msg.on !== "boolean") return;
    v.shown = msg.on;
    v.dirty = true;
  });

  socket.on("disconnect", () => {
    visitors.delete(socket.id);
    markOnline();
  });
});

// Every 100 ms: tell each visitor who else is on their page. Only pages that changed.
let lastKey = new Map(); // socket.id -> last payload sent
setInterval(() => {
  const now = Date.now();
  const byPage = new Map();
  let anyDirty = false;
  for (const [sid, v] of visitors) {
    if (now - v.active > IDLE_MS || v.strikes > 300) {
      presence.sockets.get(sid)?.disconnect(true);
      continue;
    }
    if (v.dirty) anyDirty = true;
    if (!v.page || !v.draws || !v.shown) continue;
    if (!byPage.has(v.page)) byPage.set(v.page, []);
    byPage.get(v.page).push({ sid, id: v.id, name: v.name, x: Math.round(v.x * 1000) / 1000, y: Math.round(v.y * 1000) / 1000 });
  }

  if (anyDirty || onlineDirty) {
    for (const [sid, v] of visitors) {
      if (!v.draws || !v.page) continue;
      const others = (byPage.get(v.page) ?? []).filter((p) => p.sid !== sid).map(({ id, name, x, y }) => ({ id, name, x, y }));
      const key = JSON.stringify(others);
      if (lastKey.get(sid) !== key) {
        lastKey.set(sid, key);
        presence.sockets.get(sid)?.volatile.emit("peers", others);
      }
    }
    for (const v of visitors.values()) v.dirty = false;
  }
  for (const sid of lastKey.keys()) if (!visitors.has(sid)) lastKey.delete(sid);

  if (onlineDirty) {
    onlineDirty = false;
    presence.emit("online", counts());
  }
}, TICK_MS);

server.listen(PORT, "127.0.0.1", () => console.log(`[presence-api] listening on 127.0.0.1:${PORT}`));

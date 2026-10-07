// Service status from /api/status (server/status-api). A short shared cache means the rack and
// the terminal commands do not each hit the server.
import { getJson } from "./api";

const FRESH_MS = 30_000;
let cache = null; // { at, services }
let inflight = null;

const STATES = new Set(["up", "degraded", "down"]);

export const loadStatus = ({ force = false } = {}) => {
  if (!force && cache && Date.now() - cache.at < FRESH_MS) return Promise.resolve(cache.services);
  if (inflight) return inflight;
  inflight = getJson("/api/status", { timeout: 6000 })
    .then((data) => {
      const list = data?.services;
      if (!Array.isArray(list)) throw new Error("bad response");
      // Keep only what we expect, so nothing unexpected ever gets rendered.
      const services = list
        .filter((s) => s && typeof s.name === "string" && STATES.has(s.status))
        .map((s) => ({
          name: s.name,
          status: s.status,
          latencyMs: Number.isFinite(s.latencyMs) ? s.latencyMs : null,
          checkedAt: s.checkedAt,
        }));
      cache = { at: Date.now(), services };
      return services;
    })
    .catch((err) => {
      cache = null; // an old answer must never be shown as current
      throw err;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
};

export const agoText = (iso, now = Date.now()) => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "just now";
  const s = Math.max(0, Math.round((now - t) / 1000));
  return s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`;
};

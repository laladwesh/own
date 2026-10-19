import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { getJson } from "./api";
import { repoLink } from "../constants";

// "Follow me on GitHub" cannot happen on this site: following needs the visitor's own GitHub login.
// Everything here only opens the profile in a new tab, and the follower count is read from the
// existing GitHub proxy (/api/github/stats, cached on the server). Nothing here says anyone followed.
export const GITHUB_URL = repoLink;
export const GITHUB_USER = "laladwesh";

const KEY = "gh-followers";
const TTL = 15 * 60 * 1000;
let pending = null;

// A whole number, or null when the proxy did not answer. One request per tab: the answer is kept
// in memory and in sessionStorage for 15 minutes, like the other GitHub numbers.
export const loadFollowers = () => {
  try {
    const hit = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (hit && Number.isInteger(hit.n) && Date.now() - hit.at < TTL) return Promise.resolve(hit.n);
  } catch {
    /* sessionStorage can be blocked */
  }
  if (!pending) {
    pending = getJson("/api/github/stats")
      .then((d) => {
        if (!Number.isInteger(d?.followers)) throw new Error("no followers");
        try {
          sessionStorage.setItem(KEY, JSON.stringify({ n: d.followers, at: Date.now() }));
        } catch {
          /* ignore */
        }
        return d.followers;
      })
      .catch(() => null)
      .finally(() => {
        pending = null;
      });
  }
  return pending;
};

// undefined while loading, null if it failed, otherwise the count.
export const useFollowers = () => {
  const [n, setN] = useState(undefined);
  useEffect(() => {
    let live = true;
    loadFollowers().then((v) => live && setN(v));
    return () => {
      live = false;
    };
  }, []);
  return n;
};

// Props for every invite link: it only opens the profile in a new tab.
export const ghLink = { href: GITHUB_URL, target: "_blank", rel: "noopener noreferrer" };

// The count if it is already known (no request), otherwise null. Used where output is typed once.
export const cachedFollowers = () => {
  try {
    const hit = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (hit && Number.isInteger(hit.n)) return hit.n;
  } catch {
    /* ignore */
  }
  return null;
};

// "42 followers" / "1 follower", or "" when the count is not known (the number is then left out).
export const followersText = (n) => (typeof n === "number" ? `${n} ${n === 1 ? "follower" : "followers"}` : "");

// ───────────── at most two invites in one viewport ─────────────
// Every invite registers its element and a priority (lower is more relevant). Of the ones on screen
// only the two most relevant stay visible; the others get `visibility: hidden`, so nothing moves.
const items = new Map(); // id -> { el, p, vis, order }
const subs = new Set();
let version = 0;
let order = 0;
let io = null;
const bump = () => {
  version += 1;
  subs.forEach((fn) => fn());
};
const observer = () => {
  if (!io && typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver((entries) => {
      let changed = false;
      for (const e of entries) {
        for (const it of items.values()) {
          if (it.el === e.target && it.vis !== e.isIntersecting) {
            it.vis = e.isIntersecting;
            changed = true;
          }
        }
      }
      if (changed) bump();
    });
  }
  return io;
};
const shown = () =>
  new Set(
    [...items.entries()]
      .filter(([, v]) => v.vis)
      .sort((a, b) => a[1].p - b[1].p || a[1].order - b[1].order)
      .slice(0, 2)
      .map(([id]) => id)
  );

const subscribe = (fn) => {
  subs.add(fn);
  return () => subs.delete(fn);
};
const getVersion = () => version;

// Returns a ref for the invite's element and whether it should stay quiet right now.
export const useInvite = (priority) => {
  const id = useId();
  const ref = useRef(null);
  useSyncExternalStore(subscribe, getVersion);
  useEffect(() => {
    const el = ref.current;
    const o = observer();
    if (!el || !o) return undefined;
    items.set(id, { el, p: priority, vis: false, order: (order += 1) });
    o.observe(el);
    return () => {
      o.unobserve(el);
      items.delete(id);
      bump();
    };
  }, [id, priority]);
  const it = items.get(id);
  return [ref, Boolean(it?.vis) && !shown().has(id)];
};

// Which page background is showing: "git" (the default, a git graph down the side margins) or "paper"
// (graph paper). Remembered for the session. The infra map that used to be a third choice was retired;
// "infra" and "plain" are still understood so old values and old habits do not break.
import { useSyncExternalStore } from "react";

export const BACKGROUNDS = ["git", "paper"];
export const ALIASES = { plain: "paper" };
const KEY = "site-bg";

const stored = () => {
  try {
    const v = sessionStorage.getItem(KEY);
    return BACKGROUNDS.includes(v) ? v : ALIASES[v] ?? null;
  } catch {
    return null;
  }
};

let current = stored() ?? "git";
const listeners = new Set();

export const getBg = () => current;

export const setBg = (next) => {
  next = ALIASES[next] ?? next;
  if (!BACKGROUNDS.includes(next) || next === current) return;
  current = next;
  try {
    sessionStorage.setItem(KEY, next);
  } catch {
    /* sessionStorage can be blocked: the choice then lasts until the page closes */
  }
  listeners.forEach((fn) => fn());
};

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const useBg = () => useSyncExternalStore(subscribe, getBg);

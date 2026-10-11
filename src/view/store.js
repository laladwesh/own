// How the site is tuned: "engineer" (the site as it always was) or "human" (the same site, with
// plain-English help). The choice lives for the session. Links can set it: `?tune=human` or
// `?tune=engineer`. The older `?view=everyone` and `?view=engineer` links still work as aliases.
import { useSyncExternalStore } from "react";

const KEY = "site-tune";
const MODES = ["engineer", "human"];
const ALIAS = { engineer: "engineer", human: "human", everyone: "human" };

const fromUrl = () => {
  try {
    const q = new URLSearchParams(window.location.search);
    return ALIAS[q.get("tune")] ?? ALIAS[q.get("view")] ?? null;
  } catch {
    return null;
  }
};

const fromSession = () => {
  try {
    const v = sessionStorage.getItem(KEY);
    return MODES.includes(v) ? v : null;
  } catch {
    return null;
  }
};

let mode = fromUrl() ?? fromSession() ?? "engineer";
const listeners = new Set();

const apply = () => {
  document.documentElement.dataset.tune = mode;
};
apply();

export const getTune = () => mode;

export const setTune = (next) => {
  if (!MODES.includes(next) || next === mode) return;
  mode = next;
  try {
    sessionStorage.setItem(KEY, mode);
  } catch {
    /* sessionStorage can be blocked: the choice then lasts until the page closes */
  }
  apply();
  listeners.forEach((fn) => fn(mode));
};

// A link with ?tune= is remembered too, so moving to another page keeps it.
if (fromUrl()) {
  try {
    sessionStorage.setItem(KEY, mode);
  } catch {
    /* ignore */
  }
}

export const subscribeTune = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const useTune = () => useSyncExternalStore(subscribeTune, getTune);
export const useHuman = () => useTune() === "human";

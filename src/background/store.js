// Which page background is showing: "infra" (the default), "git" or "plain". Remembered for the
// session. Nothing else reads the mouse, the scroll or the keyboard: the backgrounds are still.
import { useSyncExternalStore } from "react";

export const BACKGROUNDS = ["infra", "git", "plain"];
const KEY = "site-bg";

const stored = () => {
  try {
    const v = sessionStorage.getItem(KEY);
    return BACKGROUNDS.includes(v) ? v : null;
  } catch {
    return null;
  }
};

let current = stored() ?? "infra";
const listeners = new Set();

export const getBg = () => current;

export const setBg = (next) => {
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

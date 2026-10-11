// One shared state for every block that has two forms (the [ -o yaml ] / [ -o wide ] toggles, the
// "?" bubble's view button and the "show the engineer version" links).
//
//   default   comes from the tuning dial: ENGINEER shows the engineer version ("yaml"), HUMAN the
//             simple one ("wide")
//   override  a click on a block's own toggle: that block keeps the choice whatever the dial says,
//             until the dial is turned again
//
// Turning the dial clears every override. Overrides live in memory only (nothing is stored).
import { useLayoutEffect, useSyncExternalStore } from "react";
import { getTune, subscribeTune } from "../view/store";

const overrides = new Map(); // block id -> "yaml" | "wide" | "diagram"
const defaults = new Map(); // block id -> { engineer, human }, registered by the block itself
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

subscribeTune(() => {
  overrides.clear();
  emit();
});

const FALLBACK = { engineer: "yaml", human: "wide" };

export const viewOf = (id) => overrides.get(id) ?? (defaults.get(id) ?? FALLBACK)[getTune()];

export const setBlockView = (id, view) => {
  overrides.set(id, view);
  emit();
};

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

// For a block: [view, setView]. `def` is that block's default per tuning.
export const useBlockView = (id, def) => {
  useLayoutEffect(() => {
    const had = defaults.has(id);
    defaults.set(id, def);
    if (!had) emit();
  });
  const view = useSyncExternalStore(subscribe, () => overrides.get(id) ?? def[getTune()]);
  return [view, (next) => setBlockView(id, next)];
};

// For anything that only reads a block's view (the "?" bubble).
export const useBlockViewOf = (id) => useSyncExternalStore(subscribe, () => (id ? viewOf(id) : null));

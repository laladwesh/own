// Keeps the oscilloscope in step with the tuning dial: CH1 morphs between the raw wave and a clean
// sine over about 600ms, and the readout in the corner says which one it is. With reduced motion
// the change is instant.
import { scope } from "../scope/scopeStore.js";
import { getTune, subscribeTune } from "../view/store.js";

const MS = 600;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let raf = 0;

const label = () => {
  if (scope.hud?.mode) scope.hud.mode.textContent = scope.mix > 0.5 ? "MODE: CLEAN" : "MODE: RAW";
};

const go = (to) => {
  cancelAnimationFrame(raf);
  const from = scope.mix;
  if (reduced() || from === to) {
    scope.mix = to;
    scope.glitch = 0;
    scope.set({});
    label();
    return;
  }
  const t0 = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - t0) / MS);
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; // ease in-out
    scope.mix = from + (to - from) * e;
    scope.glitch = Math.sin(Math.PI * t); // rough in the middle of the turn, calm at both ends
    scope.set({});
    label();
    if (t < 1) raf = requestAnimationFrame(step);
    else scope.glitch = 0;
  };
  raf = requestAnimationFrame(step);
};

// A page that opens already tuned to human starts clean (no morph).
scope.mix = getTune() === "human" ? 1 : 0;
subscribeTune((mode) => go(mode === "human" ? 1 : 0));

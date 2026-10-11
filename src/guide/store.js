// State of the guide: the first-visit offer, a "?" explanation, or the 60-second tour.
// Plain module state with subscribers, so any component (a "?" button, the navbar, a terminal
// command) can open it without props.
import { useSyncExternalStore } from "react";

let state = { kind: null, id: null, anchor: null, step: 0, from: null };
const listeners = new Set();

const set = (next) => {
  state = { ...state, ...next };
  listeners.forEach((fn) => fn());
};

export const getGuide = () => state;
const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const useGuide = () => useSyncExternalStore(subscribe, getGuide);

const focused = () => (document.activeElement && document.activeElement !== document.body ? document.activeElement : null);

export const guide = {
  // The first-visit offer. It never takes focus.
  openOffer: () => {
    if (!state.kind) set({ kind: "offer", id: null, anchor: null, from: null });
  },
  // The "?" bubble for one part of the page. `anchor` is the button that was pressed.
  openExplain: (id, anchor) => set({ kind: "explain", id, anchor, from: anchor ?? focused() }),
  // "Need a tour?" right after the dial has been turned.
  openTourOffer: () => set({ kind: "tourOffer", id: null, anchor: null, from: null }),
  startTour: () => set({ kind: "tour", id: null, anchor: null, step: 0, from: focused() }),
  tourTo: (step) => set({ step }),
  close: () => {
    const { from } = state;
    set({ kind: null, id: null, anchor: null, from: null });
    // Put focus back where it was.
    if (from && document.contains(from)) from.focus?.({ preventScroll: true });
  },
};

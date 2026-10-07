// Shared state for visitor presence: whether the socket is up, how many are online and on which
// pages, my own anonymous name, and whether I have switched myself off. Not React: the terminal
// commands read it directly, and components subscribe with useSyncExternalStore.
const KEY = "presence-off";

const readOff = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

let state = {
  connected: false,
  online: { total: 0, pages: {} },
  you: null, // { id, name }
  enabled: !readOff(),
};

const listeners = new Set();

export const getPresence = () => state;

export const subscribePresence = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const patchPresence = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
};

// Show or hide my daemon from other visitors. Remembered for this session only.
export const setPresenceEnabled = (on) => {
  try {
    if (on) sessionStorage.removeItem(KEY);
    else sessionStorage.setItem(KEY, "1");
  } catch {
    /* sessionStorage can be blocked; it then lasts until the page closes */
  }
  patchPresence({ enabled: on });
};

// "/" -> "~", "/notes" -> "~/notes"
export const pageLabel = (path) => (path === "/" ? "~" : `~${path}`);

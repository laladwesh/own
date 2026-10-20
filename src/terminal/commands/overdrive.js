import { scope } from "../../scope/scopeStore.js";

// Unlocked by the konami code; only listed in `help --all`.
export default {
  name: "overdrive",
  group: "fun",
  secret: true,
  summary: "secret: push the scope to its limits",
  usage: "overdrive",
  run() {
    scope.set({ wave: "square", freq: 240, amp: 2.4, ch2: true, running: true, fft: false });
    return "overdrive engaged. try 'scope reset' to calm it down.";
  },
};

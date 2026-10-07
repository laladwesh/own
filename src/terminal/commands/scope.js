import { h } from "../h.js";
import { Lines, Muted } from "../ui.jsx";
import { scope, WAVES, formatFreq, vpp } from "../../scope/scopeStore.js";

const state = () => {
  const p = scope.params;
  return h(Lines, {
    lines: [
      `wave   ${p.wave}`,
      `freq   ${formatFreq(p.freq)}`,
      `amp    ${p.amp.toFixed(2)} div (Vpp ${vpp(p).toFixed(1)}V)`,
      `ch2    ${p.ch2 ? "on" : "off"}`,
      `mode   ${p.fft ? "fft" : "time"} / ${p.running ? "run" : "stop"}`,
    ],
  });
};

const num = (v, lo, hi) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= lo && n <= hi ? n : null;
};

export default {
  name: "scope",
  group: "ece",
  summary: "change the oscilloscope trace behind the page",
  usage: "scope freq <hz> | amp <div> | wave sine|square|triangle|sawtooth | ch2 on|off | freeze | run | fft | reset",
  subcommands: ["freq", "amp", "wave", "ch2", "freeze", "run", "fft", "reset"],
  run(args) {
    const [sub, arg] = args;
    switch (sub) {
      case undefined:
        return state();
      case "freq": {
        const n = num(arg, 10, 2000);
        if (n === null) return h(Muted, null, "scope freq <10-2000>   frequency in Hz");
        scope.set({ freq: n });
        return `freq = ${formatFreq(n)}`;
      }
      case "amp": {
        const n = num(arg, 0.2, 3);
        if (n === null) return h(Muted, null, "scope amp <0.2-3>   amplitude in divisions");
        scope.set({ amp: n });
        return `amp = ${n} div (Vpp ${(2 * n * 2).toFixed(1)}V)`;
      }
      case "wave":
        if (!WAVES.includes(arg)) return h(Muted, null, `scope wave ${WAVES.join("|")}`);
        scope.set({ wave: arg });
        return `wave = ${arg}`;
      case "ch2":
        if (arg !== "on" && arg !== "off") return h(Muted, null, "scope ch2 on|off");
        scope.set({ ch2: arg === "on" });
        return `ch2 ${arg}`;
      case "freeze":
        scope.set({ running: false });
        return "stopped";
      case "run":
        scope.set({ running: true });
        return "running";
      case "fft":
        scope.set({ fft: arg ? arg === "on" : !scope.params.fft });
        return scope.params.fft ? "fft on (spectrum of CH1)" : "fft off";
      case "reset":
        scope.reset();
        return "scope reset";
      default:
        return h(Muted, null, `scope: unknown option '${sub}'. try 'man scope'`);
    }
  },
};

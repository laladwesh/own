import { h } from "../h.js";
import { Muted } from "../ui.jsx";

const DIGIT = { black: 0, brown: 1, red: 2, orange: 3, yellow: 4, green: 5, blue: 6, violet: 7, grey: 8, gray: 8, white: 9 };
const MULT = { ...DIGIT, gold: -1, silver: -2 };
const TOL = { brown: 1, red: 2, green: 0.5, blue: 0.25, violet: 0.1, grey: 0.05, gray: 0.05, gold: 5, silver: 10 };

const fmt = (ohms) => {
  if (ohms >= 1e6) return `${+(ohms / 1e6).toPrecision(3)}MΩ`;
  if (ohms >= 1e3) return `${+(ohms / 1e3).toPrecision(3)}kΩ`;
  return `${+ohms.toPrecision(3)}Ω`;
};

export default {
  name: "resistor",
  group: "ece",
  summary: "decode resistor colour bands",
  usage: "resistor <band> <band> <band> [tolerance]   e.g. resistor brown black red",
  example: "resistor brown black red",
  run(args) {
    const bands = args.map((a) => a.toLowerCase());
    if (bands.length < 3 || bands.length > 5) return h(Muted, null, "usage: resistor brown black red   (3 to 5 bands)");
    const five = bands.length === 5;
    const digits = bands.slice(0, five ? 3 : 2).map((b) => DIGIT[b]);
    const mult = MULT[bands[five ? 3 : 2]];
    const tolBand = bands[five ? 4 : 3];
    const bad = bands.find((b) => !(b in MULT));
    if (digits.some((d) => d === undefined) || mult === undefined || bad) {
      return h(Muted, null, `resistor: unknown band '${bad ?? bands.find((b) => !(b in DIGIT))}'`);
    }
    const base = Number(digits.join(""));
    const ohms = base * 10 ** mult;
    const tol = tolBand ? TOL[tolBand] : 20;
    if (tol === undefined) return h(Muted, null, `resistor: '${tolBand}' is not a tolerance band`);
    return `${fmt(ohms)} ±${tol}%`;
  },
};

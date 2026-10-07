import { h } from "../h.js";
import { Lines, Muted } from "../ui.jsx";

const si = (v, unit) => {
  const a = Math.abs(v);
  if (a >= 1e6) return `${+(v / 1e6).toPrecision(4)}M${unit}`;
  if (a >= 1e3) return `${+(v / 1e3).toPrecision(4)}k${unit}`;
  if (a >= 1 || a === 0) return `${+v.toPrecision(4)}${unit}`;
  if (a >= 1e-3) return `${+(v * 1e3).toPrecision(4)}m${unit}`;
  return `${+(v * 1e6).toPrecision(4)}µ${unit}`;
};

export default {
  name: "ohm",
  group: "ece",
  summary: "Ohm's law: give any two of v, i, r",
  usage: "ohm v=5 r=220",
  example: "ohm v=5 r=220",
  run(args) {
    const vals = {};
    for (const a of args) {
      const [k, v] = a.toLowerCase().split("=");
      if (["v", "i", "r"].includes(k) && Number.isFinite(Number(v)) && v !== "") vals[k] = Number(v);
    }
    const given = Object.keys(vals);
    if (given.length !== 2) return h(Muted, null, "usage: ohm v=5 r=220   (any two of v, i, r)");
    let { v, i, r } = vals;
    if (v === undefined) v = i * r;
    else if (i === undefined) i = v / r;
    else if (r === undefined) r = v / i;
    if (![v, i, r].every(Number.isFinite)) return h(Muted, null, "ohm: cannot divide by zero");
    return h(Lines, {
      lines: [`V = ${si(v, "V")}`, `I = ${si(i, "A")}`, `R = ${si(r, "Ω")}`, `P = ${si(v * i, "W")}`],
    });
  },
};

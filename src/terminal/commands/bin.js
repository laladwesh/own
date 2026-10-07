import { h } from "../h.js";
import { Lines, Muted } from "../ui.jsx";

export const parseNumber = (s) => {
  if (s === undefined) return null;
  const t = s.toLowerCase();
  const n = t.startsWith("0x") ? parseInt(t.slice(2), 16) : t.startsWith("0b") ? parseInt(t.slice(2), 2) : Number(t);
  return Number.isInteger(n) && n >= 0 ? n : null;
};

export const base = (n) =>
  h(Lines, {
    lines: [
      `dec  ${n}`,
      `bin  0b${n.toString(2)}`,
      `hex  0x${n.toString(16).toUpperCase()}`,
      `oct  0o${n.toString(8)}`,
    ],
  });

export default {
  name: "bin",
  group: "ece",
  summary: "show a number in binary, hex and octal",
  usage: "bin <n>   (accepts 42, 0x2a, 0b101010)",
  example: "bin 42",
  run(args) {
    const n = parseNumber(args[0]);
    if (n === null) return h(Muted, null, "usage: bin <non-negative integer>");
    return base(n);
  },
};

import { h } from "../h.js";
import { Muted } from "../ui.jsx";

// cowsay, with the daemon mascot.
const GHOST = [
  "     .-''''-.",
  "    /  o  o  \\",
  "   |    __    |",
  "   |   \\__/   |",
  "   '-.._  _..-'",
  "     \\/\\/\\/\\/",
];

const wrap = (text, width = 34) => {
  const out = [];
  let cur = "";
  for (const w of text.split(/\s+/)) {
    if ((cur + " " + w).trim().length > width) {
      out.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out;
};

export default {
  name: "daemonsay",
  group: "fun",
  summary: "the daemon says it for you",
  usage: "daemonsay <text>",
  description: "Like cowsay, but with an ASCII version of the daemon mascot.",
  example: "daemonsay hello",
  run(args) {
    const text = args.join(" ").trim();
    if (!text) return h(Muted, null, "usage: daemonsay <text>");
    const lines = wrap(text);
    const w = Math.max(...lines.map((l) => l.length));
    const bubble = [
      ` ${"_".repeat(w + 2)}`,
      ...lines.map((l, i) => {
        const [a, b] = lines.length === 1 ? ["<", ">"] : i === 0 ? ["/", "\\"] : i === lines.length - 1 ? ["\\", "/"] : ["|", "|"];
        return `${a} ${l.padEnd(w)} ${b}`;
      }),
      ` ${"-".repeat(w + 2)}`,
      "      \\",
      "       \\",
    ];
    return h("pre", { className: "term-pre" }, [...bubble, ...GHOST].join("\n"));
  },
};

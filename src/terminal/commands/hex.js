import { h } from "../h.js";
import { Muted } from "../ui.jsx";
import { base, parseNumber } from "./bin.js";

export default {
  name: "hex",
  group: "ece",
  summary: "convert a number (decimal or 0x-prefixed hex)",
  usage: "hex <n>   e.g. hex 255  or  hex 0xff",
  run(args) {
    const raw = args[0];
    // Bare hex digits like "ff" are read as hex.
    const n = parseNumber(raw) ?? (/^[0-9a-f]+$/i.test(raw ?? "") ? parseInt(raw, 16) : null);
    if (n === null) return h(Muted, null, "usage: hex <n>");
    return base(n);
  },
};

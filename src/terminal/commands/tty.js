import { h } from "../h.js";
import { Lines, Strong } from "../ui.jsx";

// tty, the guide's little CRT monitor, in ASCII.
const ART = [
  "  .--------------.",
  "  | >_           |",
  "  |              |",
  "  '--[ tty ]--o--'",
  "      /______\\",
  "     /________\\",
];

export default {
  name: "tty",
  group: "fun",
  hidden: true,
  easter: true,
  summary: "meet the guide",
  usage: "tty",
  run() {
    return h(Lines, { lines: [...ART, " ", h(Strong, null, "hi, I'm tty. I explain things.")] });
  },
};

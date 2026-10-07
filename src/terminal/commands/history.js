import { h } from "../h.js";
import { Lines, Muted, Run } from "../ui.jsx";

export default {
  name: "history",
  group: "navigate",
  summary: "list previous commands (click to run again)",
  usage: "history",
  run(args, ctx) {
    if (!ctx.history.length) return h(Muted, null, "no history yet");
    return h(Lines, {
      lines: ctx.history.map((c, i) =>
        h("span", { key: i }, h(Muted, null, `${String(i + 1).padStart(3)}  `), h(Run, { cmd: c, run: ctx.run }, c))
      ),
    });
  },
};

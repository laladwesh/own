import { h } from "../h.js";
import { Muted } from "../ui.jsx";
import { Timeline } from "../funUi.jsx";

// Hidden joke command: not in `help`, listed in `help --all`.
export default {
  name: "kill",
  group: "fun",
  hidden: true,
  easter: true,
  summary: "kill -9 bugs",
  usage: "kill -9 bugs",
  run(args, ctx) {
    if (!args.includes("bugs")) return h(Muted, null, "usage: kill -9 bugs");
    ctx.discover?.("kill");
    return h(Timeline, {
      items: [
        { at: 0, node: "Killed 3 bugs." },
        { at: 600, node: "5 respawned with new PIDs." },
      ],
    });
  },
};

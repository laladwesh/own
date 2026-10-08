import { h } from "../h.js";
import { Run } from "../ui.jsx";
import { Mover, SL_ART } from "../funUi.jsx";

// `sl` is what you get when you type `ls` too fast. A small steam train crosses the terminal.
export default {
  name: "sl",
  group: "fun",
  hidden: true,
  easter: true,
  summary: "a train, for people who type ls too fast",
  usage: "sl",
  run(args, ctx) {
    ctx.discover?.("train");
    return h(Mover, {
      art: SL_ART,
      ms: 2000,
      after: h("span", null, "did you mean ", h(Run, { cmd: "ls", run: ctx.run }, "ls"), "?"),
    });
  },
};

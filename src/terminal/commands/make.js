import { h } from "../h.js";
import { Muted, Run } from "../ui.jsx";
import { Chai } from "../funUi.jsx";

export default {
  name: "make",
  group: "fun",
  hidden: true,
  easter: true,
  summary: "make chai (make coffee does not work)",
  usage: "make chai",
  run(args, ctx) {
    const target = args[0];
    if (target === "coffee") {
      ctx.discover?.("teapot");
      return h(
        "span",
        null,
        "418 I'm a teapot. Try ",
        h(Run, { cmd: "make chai", run: ctx.run }, "`make chai`"),
        "."
      );
    }
    if (target === "chai") {
      ctx.discover?.("chai");
      return h(Chai);
    }
    if (!target) return h(Muted, null, "make: *** No targets specified. Stop.");
    return h(Muted, null, `make: *** No rule to make target '${target}'. Stop.`);
  },
};

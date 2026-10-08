import { h } from "../h.js";
import { Run } from "../ui.jsx";
import { CAR_ART, Mover } from "../funUi.jsx";

export default {
  name: "gti",
  group: "fun",
  hidden: true,
  easter: true,
  summary: "a car, for people who type git too fast",
  usage: "gti",
  run(args, ctx) {
    ctx.discover?.("car");
    return h(Mover, {
      art: CAR_ART,
      ms: 1500,
      after: h("span", null, "vroom. did you mean ", h(Run, { cmd: "git log", run: ctx.run }, "git"), "?"),
    });
  },
};

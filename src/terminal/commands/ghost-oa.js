import { h } from "../h.js";
import { Lines, Run } from "../ui.jsx";
import { DIAGRAM_ASCII } from "../../lib/incidents.js";

export default {
  name: "ghost-oa",
  group: "me",
  summary: "one online assessment, three roles: the fan-out diagram",
  usage: "ghost-oa",
  example: "ghost-oa",
  description: "Prints a short version of the Ghost OA fan-out. The full write-up is INC-002.",
  run(args, ctx) {
    return h(Lines, {
      lines: [
        ...DIAGRAM_ASCII["ghost-oa-fanout"].map((l) => (l === "" ? " " : l)),
        " ",
        h("span", { key: "see" }, "see ", h(Run, { cmd: "cat incidents/INC-002.md", run: ctx.run, title: "cat incidents/INC-002.md" }, "INC-002")),
      ],
    });
  },
};

import { h } from "../h.js";
import { Lines, Run } from "../ui.jsx";
import { CASE_ASCII } from "../../lib/caseAscii.js";

export default {
  name: "oa-check",
  group: "me",
  summary: "how the pre-assessment laptop check works",
  usage: "oa-check",
  example: "oa-check",
  description: "Prints a short version of the OA Check flow. The full case study is at /projects/oa-check.",
  run(args, ctx) {
    const cmd = "open case-studies/oa-check.md";
    return h(Lines, {
      lines: [
        ...CASE_ASCII["oa-check-flow"],
        " ",
        h("span", { key: "see" }, h(Run, { cmd, run: ctx.run, title: cmd }, "read the case study \u2192 /projects/oa-check")),
      ],
    });
  },
};

import { h } from "../h.js";
import { Lines, Run } from "../ui.jsx";
import { Timeline } from "../funUi.jsx";
import { CASE_ASCII } from "../../lib/caseAscii.js";

export default {
  name: "oa-check",
  group: "me",
  summary: "how the pre-assessment laptop check works",
  usage: "oa-check",
  example: "oa-check",
  description: "Prints a short version of the OA Check flow. The full case study is at /projects/oa-check.",
  run(args, ctx) {
    // Not in the usage line on purpose: a joke for people who try it.
    if (args.includes("--scan-me")) {
      ctx.discover?.("scan");
      return h(Timeline, {
        items: [
          { at: 0, node: "scanning your laptop..." },
          { at: 400, node: "listing running processes..." },
          { at: 800, node: "looking for forbidden software..." },
          { at: 1150, node: "reading browser history..." },
          { at: 1500, node: "just kidding. I'd never." },
        ],
      });
    }
    const cmd = "open case-studies/oa-check.md";
    return h(Lines, {
      lines: [
        ...CASE_ASCII["oa-check-flow"],
        " ",
        h("span", { key: "see" }, h(Run, { cmd, run: ctx.run, title: cmd }, "read the case study → /projects/oa-check")),
      ],
    });
  },
};

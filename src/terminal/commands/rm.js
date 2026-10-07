import { h } from "../h.js";
import { Muted, Reveal, Run } from "../ui.jsx";
import { root } from "../fs.js";
import { daemonEvent } from "../../daemon/state.js";

export default {
  name: "rm",
  group: "fun",
  summary: "remove files (not really)",
  usage: "rm -rf /",
  example: "rm -rf /",
  run(args, ctx) {
    const flags = args.filter((a) => a.startsWith("-")).join("");
    const target = args.find((a) => !a.startsWith("-"));
    if (flags.includes("r") && flags.includes("f") && target === "/") {
      daemonEvent("rm");
      ctx.discover?.("rm");
      const lines = [
        ...root.children.map((c) => `removing ${c.name}${c.type === "dir" ? "/" : ""} ...`),
        "removing /dev/null ...",
        "just kidding.",
      ];
      return h(Reveal, { lines, interval: 150 });
    }
    if (flags.includes("r") && flags.includes("f") && (target === "~" || target === "~/")) {
      daemonEvent("error");
      return h(
        "span",
        null,
        "not again. ",
        h(Run, { cmd: "cat incidents/INC-001.md", run: ctx.run, title: "cat incidents/INC-001.md" }, "INC-001")
      );
    }
    return h(Muted, null, "rm: permission denied");
  },
};

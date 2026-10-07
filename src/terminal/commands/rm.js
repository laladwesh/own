import { h } from "../h.js";
import { Muted, Reveal } from "../ui.jsx";
import { root } from "../fs.js";
import { daemonEvent } from "../../daemon/state.js";

export default {
  name: "rm",
  group: "fun",
  summary: "remove files (not really)",
  usage: "rm -rf /",
  run(args) {
    const flags = args.filter((a) => a.startsWith("-")).join("");
    const target = args.find((a) => !a.startsWith("-"));
    if (flags.includes("r") && flags.includes("f") && target === "/") {
      daemonEvent("rm");
      const lines = [
        ...root.children.map((c) => `removing ${c.name}${c.type === "dir" ? "/" : ""} ...`),
        "removing /dev/null ...",
        "just kidding.",
      ];
      return h(Reveal, { lines, interval: 150 });
    }
    return h(Muted, null, "rm: permission denied");
  },
};

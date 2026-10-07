import { h } from "../h.js";
import { Lines, Muted } from "../ui.jsx";
import { resolve, isDir } from "../fs.js";

export default {
  name: "sort",
  group: "navigate",
  summary: "sort lines alphabetically",
  usage: "sort [-r] [file]   |   ls | sort -r",
  description: "Sorts the lines of a file or of piped input. -r reverses the order.",
  example: "ls | sort -r",
  run(args, ctx) {
    const reverse = args.includes("-r");
    const file = args.find((a) => !a.startsWith("-"));
    let text = ctx.stdin;
    if (file) {
      const res = resolve(ctx.cwd, file);
      if (!res || isDir(res.node)) return h(Muted, null, `sort: ${file}: no such file`);
      text = res.node.content;
    }
    if (text === undefined || text === null) return h(Muted, null, "usage: sort [-r] [file]   (or pipe into it)");
    const lines = text.split("\n").filter((l) => l !== "").sort((a, b) => a.localeCompare(b));
    if (reverse) lines.reverse();
    return h(Lines, { lines });
  },
};

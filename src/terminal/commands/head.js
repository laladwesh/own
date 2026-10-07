import { h } from "../h.js";
import { Lines, Muted } from "../ui.jsx";
import { resolve, isDir } from "../fs.js";

export default {
  name: "head",
  group: "navigate",
  summary: "show the first lines",
  usage: "head [-n N] [file]   |   git log | head -n 3",
  description: "Prints the first N lines (default 10) of a file or of piped input.",
  example: "git log | head -n 3",
  run(args, ctx) {
    let n = 10;
    const rest = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-n" && args[i + 1]) n = Number(args[++i]);
      else if (/^-\d+$/.test(args[i])) n = Number(args[i].slice(1));
      else rest.push(args[i]);
    }
    if (!Number.isFinite(n) || n < 0) return h(Muted, null, "head: invalid number of lines");
    let text = ctx.stdin;
    if (rest[0]) {
      const res = resolve(ctx.cwd, rest[0]);
      if (!res || isDir(res.node)) return h(Muted, null, `head: ${rest[0]}: no such file`);
      text = res.node.content;
    }
    if (text === undefined || text === null) return h(Muted, null, "usage: head [-n N] [file]   (or pipe into it)");
    return h(Lines, { lines: text.split("\n").slice(0, n).map((l) => l || " ") });
  },
};

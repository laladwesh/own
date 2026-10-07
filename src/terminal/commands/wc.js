import { h } from "../h.js";
import { Muted } from "../ui.jsx";
import { resolve, isDir } from "../fs.js";

export default {
  name: "wc",
  group: "navigate",
  summary: "count lines, words and characters",
  usage: "wc [-l] [-w] [-c] [file]   |   ls projects | wc -l",
  description: "Counts what it is given: a file, or piped input. With no flag it prints lines, words and characters.",
  example: "ls projects | wc -l",
  run(args, ctx) {
    const flags = args.filter((a) => /^-[lwc]+$/.test(a)).join("");
    const file = args.find((a) => !a.startsWith("-"));
    let text = ctx.stdin;
    if (file) {
      const res = resolve(ctx.cwd, file);
      if (!res || isDir(res.node)) return h(Muted, null, `wc: ${file}: no such file`);
      text = res.node.content;
    }
    if (text === undefined || text === null) return h(Muted, null, "usage: wc [-l|-w|-c] [file]   (or pipe into it)");
    const lines = text === "" ? 0 : text.split("\n").length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    if (flags.includes("l")) return String(lines);
    if (flags.includes("w")) return String(words);
    if (flags.includes("c")) return String(chars);
    return `${lines} ${words} ${chars}`;
  },
};

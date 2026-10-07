import { h } from "../h.js";
import { Lines, Muted } from "../ui.jsx";
import { resolve, isDir } from "../fs.js";

// grep [-i] [-v] [-c] pattern [file]   (also reads piped input)
// Smart case: a pattern with no capital letters matches case-insensitively.
export default {
  name: "grep",
  group: "navigate",
  summary: "keep only the lines that match a pattern",
  usage: "grep [-i] [-v] [-c] <pattern> [file]   |   cat Dockerfile | grep docker",
  description: "Reads a file or piped input and prints the matching lines. A lowercase pattern matches any case.",
  example: "cat Dockerfile | grep docker",
  run(args, ctx) {
    const flags = args.filter((a) => /^-[ivc]+$/.test(a)).join("");
    const rest = args.filter((a) => !/^-[ivc]+$/.test(a));
    const [pattern, file] = rest;
    if (!pattern) return h(Muted, null, "usage: grep [-i] [-v] [-c] <pattern> [file]");

    let text = ctx.stdin;
    if (file) {
      const res = resolve(ctx.cwd, file);
      if (!res || isDir(res.node)) return h(Muted, null, `grep: ${file}: no such file`);
      text = res.node.content;
    }
    if (text === undefined || text === null) return h(Muted, null, "grep: nothing to read (pipe something in or name a file)");

    const smart = flags.includes("i") || pattern === pattern.toLowerCase();
    let test;
    try {
      const re = new RegExp(pattern, smart ? "i" : "");
      test = (l) => re.test(l);
    } catch {
      const p = smart ? pattern.toLowerCase() : pattern;
      test = (l) => (smart ? l.toLowerCase() : l).includes(p);
    }
    const hits = text.split("\n").filter((l) => test(l) !== flags.includes("v"));
    if (flags.includes("c")) return String(hits.length);
    if (!hits.length) return h(Muted, null, "(no matches)");
    return h(Lines, { lines: hits.map((l) => l || " ") });
  },
};

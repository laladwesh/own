import { h } from "../h.js";
import { Muted } from "../ui.jsx";
import { resolve, isDir, SECTION_OF } from "../fs.js";

export default {
  name: "cd",
  group: "navigate",
  summary: "change directory (also scrolls the page to that section)",
  usage: "cd [path]   |   cd ..",
  paths: true,
  run(args, ctx) {
    const target = args[0] ?? "~";
    const res = resolve(ctx.cwd, target);
    if (!res) return h(Muted, null, `cd: ${target}: no such file or directory`);
    if (!isDir(res.node)) return h(Muted, null, `cd: ${target}: not a directory`);
    ctx.setCwd(res.path);
    const section = SECTION_OF[res.path[0]];
    if (section) ctx.scrollTo(section);
    return null;
  },
};

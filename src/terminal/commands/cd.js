import { h } from "../h.js";
import { Muted } from "../ui.jsx";
import { resolve, isDir, SECTION_OF } from "../fs.js";

export default {
  name: "cd",
  group: "navigate",
  summary: "change directory (also opens that part of the site)",
  usage: "cd [path]   |   cd ..",
  example: "cd projects",
  paths: true,
  run(args, ctx) {
    const target = args[0] ?? "~";
    const res = resolve(ctx.cwd, target);
    if (!res) return h(Muted, null, `cd: ${target}: no such file or directory`);
    if (!isDir(res.node)) return h(Muted, null, `cd: ${target}: not a directory`);
    ctx.setCwd(res.path);
    if (res.path.length === 1 && (res.path[0] === "incidents" || res.path[0] === "notes")) {
      ctx.navigate(`/${res.path[0]}`);
      return h(Muted, null, `opening /${res.path[0]}`);
    }
    const section = SECTION_OF[res.path[0]];
    if (section?.startsWith("/")) {
      ctx.navigate(section);
      return h(Muted, null, `opening ${section.split("#")[0]}`);
    }
    if (section) ctx.scrollTo(section);
    return null;
  },
};

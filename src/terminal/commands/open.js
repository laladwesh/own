import { h } from "../h.js";
import { Muted } from "../ui.jsx";
import { resolve, isDir } from "../fs.js";

export default {
  name: "open",
  group: "navigate",
  summary: "open a file or link in a new tab",
  usage: "open <file>",
  example: "open resume.pdf",
  paths: true,
  run(args, ctx) {
    if (!args.length) return h(Muted, null, "usage: open <file>   (try: open resume.pdf)");
    const res = resolve(ctx.cwd, args[0]);
    if (!res) return h(Muted, null, `open: ${args[0]}: no such file or directory`);
    const node = res.node;
    // A project folder opens its link file.
    const target = isDir(node) ? node.children.find((c) => c.href) : node;
    if (!target?.href) return h(Muted, null, `open: ${args[0]}: nothing to open. try 'cat ${args[0]}'`);
    ctx.openUrl(target.href);
    return h("span", null, `opening ${target.name}…`);
  },
};

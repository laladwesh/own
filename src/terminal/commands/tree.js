import { h } from "../h.js";
import { Lines, Run, Muted } from "../ui.jsx";
import { resolve, isDir, pathString } from "../fs.js";

export default {
  name: "tree",
  group: "navigate",
  summary: "show the directory tree",
  usage: "tree [path]",
  example: "tree skills",
  paths: true,
  run(args, ctx) {
    const all = args.includes("-a");
    const target = args.find((a) => !a.startsWith("-")) ?? "";
    const res = resolve(ctx.cwd, target);
    if (!res) return h(Muted, null, `tree: ${target}: no such directory`);
    if (!isDir(res.node)) return h(Muted, null, `${res.node.name} [not a directory]`);

    const rows = [h("span", null, target || pathString(ctx.cwd))];
    let dirs = 0;
    let files = 0;
    const walk = (node, path, prefix) => {
      const kids = node.children.filter((c) => all || !c.name.startsWith("."));
      kids.forEach((c, i) => {
        const last = i === kids.length - 1;
        const abs = pathString([...path, c.name]);
        const cmd = isDir(c) ? `cd ${abs}` : c.href ? `open ${abs}` : `cat ${abs}`;
        rows.push(
          h(
            "span",
            null,
            h(Muted, null, `${prefix}${last ? "└── " : "├── "}`),
            h(Run, { cmd, run: ctx.run }, isDir(c) ? `${c.name}/` : c.name)
          )
        );
        if (isDir(c)) {
          dirs += 1;
          walk(c, [...path, c.name], `${prefix}${last ? "    " : "│   "}`);
        } else files += 1;
      });
    };
    walk(res.node, res.path, "");
    rows.push(h(Muted, null, `${dirs} directories, ${files} files`));
    return h(Lines, { lines: rows });
  },
};

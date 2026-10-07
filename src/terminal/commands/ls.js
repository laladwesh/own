import { h } from "../h.js";
import { Lines, Run, Muted } from "../ui.jsx";
import { resolve, isDir, pathString } from "../fs.js";

const entry = (node, base, ctx, long) => {
  const abs = pathString([...base, node.name]);
  const label = isDir(node) ? `${node.name}/` : node.name;
  const cmd = isDir(node) ? `cd ${abs}` : node.href ? `open ${abs}` : `cat ${abs}`;
  const name = h(Run, { cmd, run: ctx.run, title: cmd }, label);
  if (!long) return name;
  const size = isDir(node) ? node.children.length * 4096 : node.content.length;
  return h(
    "span",
    null,
    h(Muted, null, `${isDir(node) ? "drwxr-xr-x" : "-rw-r--r--"}  avinash  ${String(size).padStart(6)}  `),
    name
  );
};

export default {
  name: "ls",
  group: "navigate",
  summary: "list directory contents",
  usage: "ls [-la] [path]",
  example: "ls projects",
  paths: true,
  run(args, ctx) {
    const flags = args.filter((a) => a.startsWith("-")).join("");
    const long = flags.includes("l");
    const all = flags.includes("a");
    const target = args.find((a) => !a.startsWith("-")) ?? "";
    const res = resolve(ctx.cwd, target);
    if (!res) return h(Muted, null, `ls: cannot access '${target}': no such file or directory`);
    if (!isDir(res.node)) return entry(res.node, res.path.slice(0, -1), ctx, long);
    const rows = res.node.children.filter((n) => all || !n.name.startsWith(".")).map((n) => entry(n, res.path, ctx, long));
    if (all) rows.unshift(h(Muted, null, long ? "drwxr-xr-x  avinash    4096  ." : "."), h(Muted, null, long ? "drwxr-xr-x  avinash    4096  .." : ".."));
    if (!rows.length) return h(Muted, null, "(empty)");
    if (long) return h(Lines, { lines: rows });
    return h("div", { className: "term-ls" }, ...rows.map((r, i) => h("span", { key: i }, r)));
  },
};

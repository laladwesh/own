import { h } from "../h.js";
import { Lines, Muted, Ext, Run } from "../ui.jsx";
import { resolve, isDir } from "../fs.js";

const render = (node, ctx) => {
  if (node.urls) {
    return h(Lines, {
      lines: node.urls.map((u, i) => h("span", { key: i }, h(Ext, { href: u }, u))),
    });
  }
  if (node.href) return h(Ext, { href: node.href }, node.content || node.href);
  const lines = node.content.split("\n").map((l) => (l === "" ? " " : l));
  if (node.route) {
    const cmd = `open ${node.route.slice(1)}`;
    lines.push(" ", h("span", { key: "full" }, h(Run, { cmd, run: ctx.run, title: cmd }, `open full report \u2192 ${node.route}`)));
  }
  return h(Lines, { lines });
};

export default {
  name: "cat",
  group: "navigate",
  summary: "print a file",
  usage: "cat <file>",
  example: "cat about.txt",
  paths: true,
  run(args, ctx) {
    if (!args.length) return h(Muted, null, "usage: cat <file>");
    return h(
      "div",
      null,
      ...args.map((a, i) => {
        const res = resolve(ctx.cwd, a);
        if (!res) return h("div", { key: i }, h(Muted, null, `cat: ${a}: no such file or directory`));
        if (isDir(res.node)) return h("div", { key: i }, h(Muted, null, `cat: ${a}: is a directory`));
        if (res.node.name === ".secrets") ctx.discover?.("secrets");
        return h("div", { key: i }, render(res.node, ctx));
      })
    );
  },
};

import { h } from "../h.js";
import { Cell, Lines, Muted, Run } from "../ui.jsx";
import { projects } from "../../constants/index.js";
import { projectStatus, repos } from "../../lib/data.js";
import { hashOf, slug } from "../../lib/util.js";

const header = (cells) => h("span", { className: "term-muted" }, ...cells.map(([w, t], i) => h(Cell, { key: i, w }, t)));

const ps = (ctx) =>
  h(Lines, {
    lines: [
      header([[14, "CONTAINER ID"], [34, "IMAGE"], [0, "STATUS"]]),
      ...projects.map((p) => {
        const s = projectStatus(p);
        return h(
          "span",
          null,
          h(Cell, { w: 14 }, hashOf(p.id)),
          h(Cell, { w: 34 }, h(Run, { cmd: `kubectl describe deployment ${slug(p.title)}`, run: ctx.run }, slug(p.title))),
          s === "Running" ? "Up (live)" : s === "Completed" ? "Exited (0)" : "Created"
        );
      }),
    ],
  });

const images = (args) => {
  const all = args.includes("--all") || args.includes("-a");
  const fi = args.indexOf("--filter");
  const filter = fi >= 0 ? args[fi + 1] : args.find((a) => a.startsWith("category="));
  const cat = filter?.replace(/^category=/, "");
  let list = repos;
  if (cat) list = list.filter((r) => slug(r.category) === cat);
  const shown = all || cat ? list : list.slice(0, 15);
  return h(Lines, {
    lines: [
      header([[40, "REPOSITORY"], [14, "LANGUAGE"], [18, "CATEGORY"], [0, "UPDATED"]]),
      ...shown.map((r) => h("span", null, h(Cell, { w: 40 }, r.name), h(Cell, { w: 14 }, r.language ?? "-"), h(Cell, { w: 18 }, r.category), r.updatedAt.slice(0, 10))),
      list.length > shown.length ? h(Muted, null, `... ${list.length - shown.length} more (docker images --all, or --filter category=web-app)`) : null,
    ].filter(Boolean),
  });
};

export default {
  name: "docker",
  group: "devops",
  summary: "projects as containers, repositories as images",
  usage: "docker ps   |   docker images [--all] [--filter category=<slug>]",
  example: "docker ps",
  subcommands: ["ps", "images"],
  run(args, ctx) {
    const [sub, ...rest] = args;
    if (sub === "ps") return ps(ctx);
    if (sub === "images") return images(rest);
    return h(Muted, null, "usage: docker ps | docker images");
  },
};

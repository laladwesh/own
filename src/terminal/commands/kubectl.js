import { h } from "../h.js";
import { Cell, Lines, Muted, Run } from "../ui.jsx";
import { extraCurricular, projects } from "../../constants/index.js";
import { describeObject, projectStatus } from "../../lib/data.js";
import { slug } from "../../lib/util.js";
import { linesToText, yamlLines } from "../../lib/yaml.js";

const header = (cells) => h("span", { className: "term-muted" }, ...cells.map(([w, t], i) => h(Cell, { key: i, w }, t)));

const deployments = (ctx) =>
  h(Lines, {
    lines: [
      header([[34, "NAME"], [12, "STATUS"], [0, "STACK"]]),
      ...projects.map((p) =>
        h(
          "span",
          null,
          h(Cell, { w: 34 }, h(Run, { cmd: `kubectl describe deployment ${slug(p.title)}`, run: ctx.run }, slug(p.title))),
          h(Cell, { w: 12 }, projectStatus(p)),
          p.stack.slice(0, 4).map((t) => t.name).join(", ")
        )
      ),
    ],
  });

// Pods are the projects that are up (Running) or finished (Completed); private ones have no pod.
const pods = () =>
  h(Lines, {
    lines: [
      header([[40, "NAME"], [8, "READY"], [0, "STATUS"]]),
      ...projects
        .filter((p) => projectStatus(p) !== "Private")
        .map((p) => {
          const running = projectStatus(p) === "Running";
          return h("span", null, h(Cell, { w: 40 }, `${slug(p.title)}-pod`), h(Cell, { w: 8 }, running ? "1/1" : "0/1"), running ? "Running" : "Completed");
        }),
    ],
  });

const cronjobs = () =>
  h(Lines, {
    lines: [
      header([[24, "NAME"], [24, "SCHEDULE"], [0, "ORGANISATION"]]),
      ...extraCurricular.map((e) => h("span", null, h(Cell, { w: 24 }, slug(e.title)), h(Cell, { w: 24 }, e.duration), e.organisation)),
    ],
  });

const describe = (args) => {
  const [kind, name] = args;
  if (kind !== "deployment" || !name) return h(Muted, null, "usage: kubectl describe deployment <name>");
  const p = projects.find((x) => slug(x.title) === name || x.id === name);
  if (!p) return h(Muted, null, `Error from server (NotFound): deployments "${name}" not found`);
  return h(Lines, { lines: linesToText(yamlLines(describeObject(p))).split("\n") });
};

export default {
  name: "kubectl",
  group: "devops",
  summary: "projects as deployments (get deployments | get pods | describe | version)",
  usage: "kubectl get deployments|pods|cronjobs   |   kubectl describe deployment <name>   |   kubectl version",
  example: "kubectl get deployments",
  subcommands: ["get", "describe", "version"],
  run(args, ctx) {
    const [sub, ...rest] = args;
    if (sub === "version") return h(Lines, { lines: ["client: learning", "server: none (no cluster yet)"] });
    if (sub === "describe") return describe(rest);
    if (sub === "get") {
      const what = rest[0];
      if (what === "deployments" || what === "deployment" || what === "deploy") return deployments(ctx);
      if (what === "pods" || what === "pod") return pods();
      if (what === "cronjobs" || what === "cronjob") return cronjobs();
      return h(Muted, null, "usage: kubectl get deployments|pods|cronjobs");
    }
    return h(Muted, null, "usage: kubectl get | describe | version");
  },
};

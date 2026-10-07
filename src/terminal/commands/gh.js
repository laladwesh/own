import { h } from "../h.js";
import { Lines, Muted, Strong } from "../ui.jsx";
import { isRunning, releaseRows, stages } from "../../lib/data.js";
import { startOf } from "../../lib/util.js";

const runView = (args) => {
  const log = args.includes("--log");
  const lines = [h(Strong, null, `run: experience (${stages.length} stages, ${stages.reduce((n, s) => n + s.positions.length, 0)} jobs)`)];
  for (const org of stages) {
    lines.push(" ", h(Strong, null, `stage: ${org.organisation}`));
    for (const p of org.positions) {
      lines.push(`  ${isRunning(p) ? "running" : "[ok]    "}  ${p.title}  (${p.duration})`);
      if (log) p.content.forEach((c) => lines.push(h(Muted, { key: c.text }, `            [${startOf(p.duration)}] ${c.text}`)));
    }
  }
  if (!log) lines.push(" ", h(Muted, null, "add --log to read each job's log"));
  return h(Lines, { lines });
};

const releaseList = () =>
  h(Lines, {
    lines: releaseRows.map((r, i) =>
      h(
        "span",
        null,
        h(Strong, null, r.tag),
        `  ${r.event} / ${r.position}`,
        i === 0 && r.key ? "  [latest]" : ""
      )
    ),
  });

export default {
  name: "gh",
  group: "devops",
  summary: "experience as a pipeline run, achievements as releases",
  usage: "gh run view [--log]   |   gh release list",
  subcommands: ["run", "release"],
  run(args) {
    const [sub, action, ...rest] = args;
    if (sub === "run" && action === "view") return runView(rest);
    if (sub === "release" && action === "list") return releaseList();
    return h(Muted, null, "usage: gh run view [--log] | gh release list");
  },
};

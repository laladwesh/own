import { h } from "../h.js";
import { Lines, Muted } from "../ui.jsx";
import { projects, skills } from "../../constants/index.js";
import { isRunning, projectStatus, repos, stages } from "../../lib/data.js";

const count = (list, f) => list.filter(f).length;

// A static snapshot, counted from the portfolio's own data.
export default {
  name: "top",
  group: "devops",
  summary: "a snapshot of everything on this server",
  usage: "top",
  run() {
    const jobs = stages.flatMap((s) => s.positions);
    const prod = skills.find((g) => g.key === "production").items.length;
    const learning = skills.find((g) => g.key === "learning").items.length;
    return h(Lines, {
      lines: [
        "top - snapshot (static)",
        `deployments: ${projects.length} total, ${count(projects, (p) => projectStatus(p) === "Running")} running, ${count(projects, (p) => projectStatus(p) === "Completed")} completed, ${count(projects, (p) => projectStatus(p) === "Private")} private`,
        `pipeline:    ${stages.length} stages, ${jobs.length} jobs, ${count(jobs, isRunning)} running`,
        `images:      ${repos.length} repositories`,
        `tools:       ${prod} in production, ${learning} learning`,
        h(Muted, null, "numbers are counted from the same data as the page"),
      ],
    });
  },
};

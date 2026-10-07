import { h } from "../h.js";
import { Lines, Muted, Strong } from "../ui.jsx";
import { DISCOVERABLE, getDiscovered, total } from "../discovery.js";

export default {
  name: "achievements",
  group: "games",
  summary: "which commands you have discovered",
  usage: "achievements",
  description: `There are ${total} discoverable things in this terminal. Found ones are listed; the rest stay ???.`,
  example: "achievements",
  run() {
    const found = getDiscovered();
    const lines = [
      h(Strong, null, `commands discovered: ${found.size} / ${total}`),
      ...DISCOVERABLE.map((d) =>
        found.has(d.id)
          ? h("span", { key: d.id }, `  [x] ${d.id.padEnd(10)} `, h(Muted, null, d.label))
          : h("span", { key: d.id }, h(Muted, null, `  [ ] ${"???".padEnd(10)} ???`))
      ),
    ];
    if (found.size === total) lines.push(" ", "You found everything. Say hello: ssh recruiter@avinash");
    return h(Lines, { lines });
  },
};

import { h } from "../h.js";
import { Lines, Muted, Strong } from "../ui.jsx";
import { BONUS, DISCOVERABLE, coreFound, getDiscovered, total } from "../discovery.js";

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
      h(Strong, null, `commands discovered: ${coreFound()} / ${total}`),
      ...DISCOVERABLE.map((d) =>
        found.has(d.id)
          ? h("span", { key: d.id }, `  [x] ${d.id.padEnd(10)} `, h(Muted, null, d.label))
          : h("span", { key: d.id }, h(Muted, null, `  [ ] ${"???".padEnd(10)} ???`))
      ),
    ];
    if (coreFound() === total) lines.push(" ", "You found everything. Say hello: ssh recruiter@avinash");
    const bonusFound = BONUS.filter((b) => found.has(b.id));
    if (bonusFound.length) {
      lines.push(" ", h(Strong, null, `bonus: ${bonusFound.length} / ${BONUS.length}`));
      BONUS.forEach((b) =>
        lines.push(
          found.has(b.id)
            ? h("span", { key: b.id }, `  [x] ${b.id.padEnd(10)} `, h(Muted, null, b.label))
            : h("span", { key: b.id }, h(Muted, null, `  [ ] ${"???".padEnd(10)} ???`))
        )
      );
    }
    return h(Lines, { lines });
  },
};

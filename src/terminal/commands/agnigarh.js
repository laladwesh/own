import { h } from "../h.js";
import { Reveal, Run } from "../ui.jsx";

export default {
  name: "agnigarh",
  group: "me",
  summary: "the campus login the server used to depend on",
  usage: "agnigarh",
  example: "agnigarh",
  description: "A short replay of the old login loop. The full story is INC-003.",
  run(args, ctx) {
    const again = "session expired. logging in again...";
    const cmd = "cat incidents/INC-003.md";
    return h(Reveal, {
      interval: 700,
      lines: [
        again,
        again,
        again,
        h("span", { key: "end" }, "not anymore. see ", h(Run, { cmd, run: ctx.run, title: cmd }, "INC-003")),
      ],
    });
  },
};

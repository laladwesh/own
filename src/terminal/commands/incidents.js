import { h } from "../h.js";
import { Muted } from "../ui.jsx";

export default {
  name: "incidents",
  group: "me",
  summary: "open the incident postmortems page",
  usage: "incidents",
  example: "incidents",
  description: "Opens /incidents. For a quick list here, use journalctl --priority=crit.",
  run(args, ctx) {
    ctx.navigate("/incidents");
    return h(Muted, null, "opening /incidents");
  },
};

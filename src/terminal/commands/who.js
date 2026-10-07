import { h } from "../h.js";
import { Lines, Muted } from "../ui.jsx";
import { getPresence, pageLabel } from "../../presence/store.js";

export default {
  name: "who",
  group: "me",
  summary: "who else is on the site right now",
  usage: "who",
  example: "who",
  description: "Other visitors appear as faint daemons. Each one is anonymous: a random name, a page, a pointer position, all in memory only.",
  run() {
    const { connected, online, you, enabled } = getPresence();
    if (!connected) return h(Muted, null, "presence is offline (nothing to show, nothing sent).");
    const pages = Object.entries(online.pages)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([page, n]) => `${n} on ${pageLabel(page)}`)
      .join(", ");
    return h(Lines, {
      lines: [
        `${online.total} online${pages ? `: ${pages}` : ""}`,
        `(you are ${you?.name ?? "anonymous"}${enabled ? "" : ", hidden from others"})`,
      ],
    });
  },
};

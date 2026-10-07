import { h } from "../h.js";
import { Muted } from "../ui.jsx";
import { getPresence, setPresenceEnabled } from "../../presence/store.js";

export default {
  name: "presence",
  group: "me",
  summary: "show or hide your daemon from other visitors",
  usage: "presence   |   presence off   |   presence on",
  example: "presence off",
  description: "presence off hides your daemon from others and stops sending your pointer position. It is remembered for this session.",
  subcommands: ["on", "off"],
  run(args) {
    const [sub] = args;
    if (!sub) return getPresence().enabled ? "presence: on (others can see your daemon)" : "presence: off (hidden, nothing is sent)";
    if (sub === "off") {
      setPresenceEnabled(false);
      return "presence off. your daemon is hidden and nothing is sent.";
    }
    if (sub === "on") {
      setPresenceEnabled(true);
      return "presence on.";
    }
    return h(Muted, null, "usage: presence | presence off | presence on");
  },
};

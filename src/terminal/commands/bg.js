import { h } from "../h.js";
import { Muted } from "../ui.jsx";
import { BACKGROUNDS, getBg, setBg } from "../../background/store.js";

export default {
  name: "bg",
  group: "fun",
  summary: "change the page background: infra, git or plain",
  usage: "bg   |   bg infra   |   bg git   |   bg plain",
  example: "bg git",
  description:
    "infra is a faint blueprint of my real production setup, git is a git graph of my recent commits, plain is graph paper. All three stay completely still. The choice lasts for the session.",
  subcommands: BACKGROUNDS,
  run(args) {
    const arg = (args[0] ?? "").toLowerCase();
    if (!arg) return `background: ${getBg()}   (options: ${BACKGROUNDS.join(", ")})`;
    if (!BACKGROUNDS.includes(arg)) return h(Muted, null, `bg: unknown background '${arg}'. options: ${BACKGROUNDS.join(", ")}`);
    setBg(arg);
    return `background: ${arg}`;
  },
};

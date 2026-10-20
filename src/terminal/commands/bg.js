import { h } from "../h.js";
import { Muted } from "../ui.jsx";
import { ALIASES, BACKGROUNDS, getBg, setBg } from "../../background/store.js";

export default {
  name: "bg",
  group: "fun",
  summary: "change the page background: git or paper",
  usage: "bg   |   bg git   |   bg paper",
  example: "bg paper",
  description:
    "git is a git graph of my recent commits down the side margins; paper is graph paper. Both stay completely still. The same switch is in the navbar. The choice lasts for the session.",
  subcommands: BACKGROUNDS,
  run(args) {
    const arg = (args[0] ?? "").toLowerCase();
    if (!arg) return `background: ${getBg()}   (options: ${BACKGROUNDS.join(", ")})`;
    if (arg === "infra") return "the infra map was retired. try `bg git`.";
    const which = ALIASES[arg] ?? arg;
    if (!BACKGROUNDS.includes(which)) return h(Muted, null, `bg: unknown background '${arg}'. options: ${BACKGROUNDS.join(", ")}`);
    setBg(which);
    return `background: ${which}`;
  },
};

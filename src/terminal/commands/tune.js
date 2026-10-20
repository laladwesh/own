import { h } from "../h.js";
import { Muted } from "../ui.jsx";
import { getTune, setTune } from "../../view/store.js";

const NAME = { engineer: "technical", human: "plain English" };
const WHICH = { technical: "engineer", engineer: "engineer", plain: "human", human: "human", everyone: "human" };

export default {
  name: "tune",
  aliases: ["read"],
  group: "navigate",
  summary: "set the reading mode: technical or plain English",
  usage: "read technical   |   read plain   (older: tune engineer, tune human)",
  example: "read plain",
  description:
    "Turns the reading-mode dial on the page. Plain English adds help for non-technical readers: readable versions of the technical blocks, margin notes and short summaries. Technical is the site as it always was. `tune engineer` and `tune human` still work.",
  run(args, ctx) {
    const arg = (args[0] ?? "").toLowerCase();
    const which = WHICH[arg];
    if (which) {
      setTune(which);
      return `reading mode: ${NAME[which]}.${which === "human" ? " margin notes are on." : ""}`;
    }
    if (arg) return h(Muted, null, "usage: read technical | read plain");
    const now = getTune();
    return `reading mode: ${NAME[now]}. (read ${now === "human" ? "technical" : "plain"} to switch)`;
  },
};

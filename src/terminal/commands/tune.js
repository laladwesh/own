import { h } from "../h.js";
import { Muted } from "../ui.jsx";
import { getTune, setTune } from "../../view/store.js";

export default {
  name: "tune",
  group: "navigate",
  summary: "tune the site for engineers or for humans",
  usage: "tune human   |   tune engineer",
  example: "tune human",
  description:
    "Turns the dial on the page. human adds plain-English help: readable versions of the technical blocks, margin notes, and short summaries. engineer is the site as it always was.",
  run(args) {
    const arg = (args[0] ?? "").toLowerCase();
    if (arg === "human" || arg === "everyone" || arg === "engineer") {
      setTune(arg === "engineer" ? "engineer" : "human");
      return arg === "engineer" ? "tuned to engineer: the raw signal." : "tuned to human: the clean signal. margin notes are on.";
    }
    if (arg) return h(Muted, null, "usage: tune human | tune engineer");
    return `tuned to ${getTune()}. (tune ${getTune() === "human" ? "engineer" : "human"} to turn the dial)`;
  },
};

import { h } from "../h.js";
import { Muted } from "../ui.jsx";

export default {
  name: "autoclear",
  group: "navigate",
  summary: "clear the screen before each new command (off by default)",
  usage: "autoclear [on|off]",
  example: "autoclear on",
  description:
    "By default everything stays on screen and the frame scrolls to the newest output. autoclear on starts each new command (or click on a link in the output) on a clean screen instead. Up/Down still walks your history.",
  run(args, ctx) {
    const arg = (args[0] ?? "").toLowerCase();
    if (arg === "on" || arg === "off") {
      ctx.setAutoClear(arg === "on");
      return arg === "on" ? "autoclear is on: each command starts on a clean screen." : "autoclear is off: output stays on screen and the frame follows it.";
    }
    if (arg) return h(Muted, null, "usage: autoclear [on|off]");
    return `autoclear is ${ctx.autoClear ? "on" : "off"}. (autoclear ${ctx.autoClear ? "off" : "on"} to change it)`;
  },
};

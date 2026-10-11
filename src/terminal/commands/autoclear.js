import { h } from "../h.js";
import { Muted } from "../ui.jsx";

export default {
  name: "autoclear",
  group: "navigate",
  summary: "clear the screen before each new command (on / off)",
  usage: "autoclear [on|off]",
  example: "autoclear off",
  description:
    "By default each new command (or click on a link in the output) starts on a clean screen, so you never have to scroll back up. autoclear off keeps everything on screen; scroll to read it. Up/Down still walks your history.",
  run(args, ctx) {
    const arg = (args[0] ?? "").toLowerCase();
    if (arg === "on" || arg === "off") {
      ctx.setAutoClear(arg === "on");
      return arg === "on" ? "autoclear is on: each command starts on a clean screen." : "autoclear is off: output stays on screen.";
    }
    if (arg) return h(Muted, null, "usage: autoclear [on|off]");
    return `autoclear is ${ctx.autoClear ? "on" : "off"}. (autoclear ${ctx.autoClear ? "off" : "on"} to change it)`;
  },
};

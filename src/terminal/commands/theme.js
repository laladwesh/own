import { h } from "../h.js";
import { Muted } from "../ui.jsx";

export const THEMES = ["amber", "green", "ice", "mono"];

export default {
  name: "theme",
  group: "navigate",
  summary: "change the terminal's colour scheme",
  usage: "theme amber|green|ice|mono",
  description: "Recolours only the terminal window (the page stays as it is). It is remembered for this session.",
  example: "theme green",
  subcommands: THEMES,
  run(args, ctx) {
    const name = args[0];
    if (!name) return h(Muted, null, `theme = ${ctx.theme}. options: ${THEMES.join(", ")}`);
    if (!THEMES.includes(name)) return h(Muted, null, `theme: unknown theme '${name}'. options: ${THEMES.join(", ")}`);
    ctx.setTheme(name);
    return `theme = ${name}`;
  },
};

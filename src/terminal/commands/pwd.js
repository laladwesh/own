import { h } from "../h.js";

export default {
  name: "pwd",
  group: "navigate",
  summary: "print the working directory",
  usage: "pwd",
  run(args, ctx) {
    return h("span", null, `/home/avinash${ctx.cwd.length ? `/${ctx.cwd.join("/")}` : ""}`);
  },
};

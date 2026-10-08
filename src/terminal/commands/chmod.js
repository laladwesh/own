import { h } from "../h.js";
import { Muted } from "../ui.jsx";

export default {
  name: "chmod",
  group: "fun",
  hidden: true,
  easter: true,
  summary: "chmod 777 /",
  usage: "chmod 777 /",
  run(args, ctx) {
    if (args.includes("777") && args.includes("/")) {
      ctx.discover?.("chmod");
      return "Absolutely not.";
    }
    return h(Muted, null, "chmod: nothing here to change. (try: chmod 777 /)");
  },
};

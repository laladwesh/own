import { h } from "../h.js";
import { Muted } from "../ui.jsx";

export default {
  name: "attend",
  group: "fun",
  hidden: true,
  easter: true,
  summary: "attend class",
  usage: "attend class",
  run(args) {
    if (args[0] !== "class") return h(Muted, null, "usage: attend class");
    return "Attendance: 75.0%. Exactly enough.";
  },
};

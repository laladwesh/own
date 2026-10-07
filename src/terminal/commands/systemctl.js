import { h } from "../h.js";
import { Lines, Muted } from "../ui.jsx";
import { aboutMe, educationList } from "../../constants/index.js";
import { currentPosition } from "../../lib/data.js";

// "July 2023 – Present" -> "Jul 2023"
const since = educationList[0].duration.split(" – ")[0].replace(/^(\w{3})\w*/, "$1");

export default {
  name: "systemctl",
  group: "devops",
  summary: "service status of avinash.service",
  usage: "systemctl status avinash",
  example: "systemctl status avinash",
  subcommands: ["status"],
  run(args) {
    if (args[0] !== "status" || args[1] !== "avinash") return h(Muted, null, "usage: systemctl status avinash");
    return h(Lines, {
      lines: [
        `avinash.service - ${aboutMe.name}`,
        "   Loaded: loaded (ece-27)",
        `   Active: active (running) since ${since}`,
        `     Role: ${currentPosition.title}`,
        `    Where: ${educationList[0].title}`,
      ],
    });
  },
};

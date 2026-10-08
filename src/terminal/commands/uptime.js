import { h } from "../h.js";
import { Lines } from "../ui.jsx";
import { educationList } from "../../constants/index.js";

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

// Counted from the start of the B.Tech (July 2023), the same date `systemctl status` shows.
export default {
  name: "uptime",
  group: "devops",
  summary: "time since the B.Tech began",
  usage: "uptime",
  run() {
    const [m, y] = educationList[0].duration.split(" – ")[0].split(" ");
    const start = new Date(Number(y), MONTHS[m.slice(0, 3).toLowerCase()], 1);
    const now = new Date();
    const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    const time = now.toLocaleTimeString("en-GB");
    return h(Lines, {
      lines: [
        `${time} up ${Math.floor(months / 12)}y ${months % 12}m (since ${m.slice(0, 3)} ${y}), 1 user`,
        "load average: placements, assignments, deadlines",
      ],
    });
  },
};

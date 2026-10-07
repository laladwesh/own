import { h } from "../h.js";
import { StatusTable } from "../statusUi.jsx";

export default {
  name: "status",
  group: "devops",
  summary: "live status of my services (the rack at the bottom of the page)",
  usage: "status",
  example: "status",
  description: "Checks my services through /api/status and prints name, status, latency and when each was checked.",
  run() {
    return h(StatusTable);
  },
};

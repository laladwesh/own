import { incidentList } from "./journalctl.js";

export default {
  name: "incidents",
  group: "me",
  summary: "list incident postmortems",
  usage: "incidents",
  example: "incidents",
  description: "Lists the incident postmortems. Open one with cat incidents/<id>.md.",
  run: (args, ctx) => incidentList(ctx),
};

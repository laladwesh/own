import { daemonEvent } from "../../daemon/state.js";

export default {
  name: "sudo",
  group: "fun",
  summary: "try it",
  usage: "sudo <anything>",
  run() {
    daemonEvent("sudo");
    return "nice try. permission denied.";
  },
};

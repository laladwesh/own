import { h } from "../h.js";
import { Lines, Muted } from "../ui.jsx";
import { daemon, setDaemonStopped } from "../../daemon/state.js";

const status = () => {
  const active = daemon.available && !daemon.stopped;
  const why = !daemon.available ? "inactive (disabled on this device)" : daemon.stopped ? "inactive (dead)" : "active (running)";
  return h(Lines, {
    lines: [
      "daemon.service - avinash's companion",
      `   Active: ${why}  PID: 1  Mood: ${active ? daemon.mood : "none"}`,
    ],
  });
};

export default {
  name: "daemon",
  group: "fun",
  summary: "the pixel companion that follows your pointer",
  usage: "daemon   |   daemon stop   |   daemon start",
  subcommands: ["stop", "start"],
  run(args) {
    const [sub] = args;
    if (!sub) return status();
    if (!daemon.available) return h(Muted, null, "daemon: not available on touch devices or with reduced motion");
    if (sub === "stop") {
      setDaemonStopped(true);
      return "daemon.service stopped";
    }
    if (sub === "start") {
      setDaemonStopped(false);
      return "daemon.service started";
    }
    return h(Muted, null, "usage: daemon | daemon stop | daemon start");
  },
};

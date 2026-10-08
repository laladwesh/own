import { h } from "../h.js";
import { Muted, Reveal, Run } from "../ui.jsx";
import { Timeline } from "../funUi.jsx";
import { socialMedia } from "../../constants/index.js";

const mail = socialMedia.find((s) => s.label === "Email (Gmail)")?.link.replace("mailto:", "");

export default {
  name: "ping",
  group: "me",
  summary: "check that avinash is reachable",
  usage: "ping avinash",
  description: "Four ping-style replies (the latencies are made up), then the real way to reach me.",
  example: "ping avinash",
  run(args, ctx) {
    if (args[0] === "google.com") {
      ctx.discover?.("wifi");
      return h(Timeline, {
        items: [
          { at: 0, node: "Request timed out." },
          { at: 500, node: "Request timed out." },
          { at: 1000, node: "Request timed out." },
          {
            at: 1400,
            node: h("span", null, "(campus Wi-Fi, see ", h(Run, { cmd: "open incidents/INC-003", run: ctx.run }, "INC-003"), ")"),
          },
        ],
      });
    }
    if (args[0] !== "avinash") return h(Muted, null, "usage: ping avinash");
    const time = () => (18 + Math.random() * 24).toFixed(1);
    const times = [time(), time(), time(), time()].map(Number);
    return h(Reveal, {
      interval: 380,
      lines: [
        "PING avinash: 56 data bytes",
        ...times.map((t, i) => `64 bytes from avinash: icmp_seq=${i} ttl=64 time=${t.toFixed(1)} ms`),
        "--- avinash ping statistics ---",
        `4 packets transmitted, 4 received, 0% packet loss, avg ${(times.reduce((a, b) => a + b, 0) / 4).toFixed(1)} ms`,
        `avinash is reachable at ${mail}`,
      ],
    });
  },
};

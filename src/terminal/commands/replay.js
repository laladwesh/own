import { h } from "../h.js";
import { Lines, Muted } from "../ui.jsx";
import { REPLAYS, findReplay } from "../replays/index.js";
import { createSession, introLines } from "../replay.js";

const ids = Object.keys(REPLAYS);

export default {
  name: "replay",
  group: "games",
  summary: "play an incident back: you are the one at the keyboard",
  usage: "replay <incident-id>",
  example: "replay INC-001",
  description: `Replays an incident as a game. Type what you would type; hint nudges, quit leaves. Available: ${ids.join(", ")}.`,
  subcommands: ids,
  run(args, ctx) {
    if (!args[0]) return h(Muted, null, `usage: replay <id>. available: ${ids.join(", ")}`);
    const script = findReplay(args[0]);
    if (!script) return h(Muted, null, `replay: no replay for ${args[0]}. available: ${ids.join(", ")}`);
    if (!ctx.startReplay) return h(Muted, null, "replay: run this one in the terminal at the top of the homepage.");
    const session = ctx.startReplay(script);
    return h(Lines, { lines: introLines(createSession(script)) });
  },
};

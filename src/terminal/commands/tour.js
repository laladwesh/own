import { getTune } from "../../view/store.js";

export default {
  name: "tour",
  group: "me",
  summary: "a guided walkthrough that types and scrolls by itself",
  usage: "tour   |   tour guide   (Esc stops it)",
  description:
    "Plays a short autopilot: it types commands into this prompt and scrolls the page to the matching section, with a one-line caption for each. Press Esc to stop.",
  example: "tour",
  run(args, ctx) {
    // `tour guide`, or `tour` in "human" view: the ghost walks you round in plain English.
    if (args[0] === "guide" || (getTune() === "human" && args[0] !== "terminal")) {
      ctx.startGuide();
      return "starting the 60-second tour. Esc ends it.";
    }
    ctx.startTour();
    return null;
  },
};

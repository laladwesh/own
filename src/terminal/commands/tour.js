export default {
  name: "tour",
  group: "me",
  summary: "a guided walkthrough that types and scrolls by itself",
  usage: "tour   (Esc stops it)",
  description:
    "Plays a short autopilot: it types commands into this prompt and scrolls the page to the matching section, with a one-line caption for each. Press Esc to stop.",
  example: "tour",
  run(args, ctx) {
    ctx.startTour();
    return null;
  },
};

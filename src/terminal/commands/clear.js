export default {
  name: "clear",
  group: "navigate",
  summary: "clear the screen (or press Ctrl+L)",
  usage: "clear",
  run(args, ctx) {
    ctx.clear();
    return null;
  },
};

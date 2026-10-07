export default {
  name: "exit",
  group: "navigate",
  summary: "close the terminal",
  usage: "exit",
  run(args, ctx) {
    ctx.exit();
    return "logout";
  },
};

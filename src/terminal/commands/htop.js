export default {
  name: "htop",
  group: "devops",
  summary: "a live-updating fake process list of my projects",
  usage: "htop   (q quits)",
  description: "My projects as processes, with CPU and memory bars that wiggle. The numbers are simulated; press q to quit.",
  example: "htop",
  run(args, ctx) {
    ctx.startMode("htop");
    return null;
  },
};

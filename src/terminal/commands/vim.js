export default {
  name: "vim",
  group: "fun",
  summary: "open a fake vim; only :q gets you out",
  usage: "vim",
  description: "A pretend editor. Typing does nothing useful. Quit with :q or :q! and Enter.",
  example: "vim",
  run(args, ctx) {
    ctx.startMode("vim");
    return null;
  },
};

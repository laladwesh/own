export default {
  name: "typespeed",
  group: "games",
  summary: "30-second typing test on lines from this site",
  usage: "typespeed",
  description:
    "Type the lines shown (taken from my about text and project descriptions). The clock starts with your first key. At 30 seconds you get words per minute, accuracy and the best score of this session. Esc quits.",
  example: "typespeed",
  run(args, ctx) {
    ctx.startMode("typespeed");
    return null;
  },
};

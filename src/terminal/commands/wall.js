export default {
  name: "wall",
  group: "fun",
  hidden: true,
  summary: "broadcast a message (not here)",
  usage: "wall <message>",
  example: "wall hello",
  run() {
    return "nice try. no broadcasts here.";
  },
};

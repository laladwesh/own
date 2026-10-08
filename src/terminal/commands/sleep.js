export default {
  name: "sleep",
  group: "fun",
  hidden: true,
  easter: true,
  summary: "sleep <anything>",
  usage: "sleep 8",
  run() {
    return "Error: sleep not supported during placement season.";
  },
};

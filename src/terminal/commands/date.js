export default {
  name: "date",
  group: "fun",
  summary: "current date and time",
  usage: "date",
  run() {
    return new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "medium" });
  },
};

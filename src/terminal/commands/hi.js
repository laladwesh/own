const REPLIES = {
  hi: "Hello. Try 'tour' for a guided walkthrough, or 'neofetch' to see who I am.",
  hello: "Hi there. 'help' lists everything, and 'ssh recruiter@avinash' leaves me a message.",
  thanks: "Any time. If you liked that, try 'fortune' or 'deploy'.",
};

export default {
  name: "hi",
  aliases: ["hello", "thanks"],
  hidden: true,
  group: "me",
  summary: "say hello",
  usage: "hi | hello | thanks",
  run(args, ctx) {
    return REPLIES[ctx.invokedAs] ?? REPLIES.hi;
  },
};

import { daemonEvent } from "../../daemon/state.js";

export default {
  name: "snake",
  group: "fun",
  summary: "play snake inside the terminal",
  usage: "snake   (arrow keys to steer, q to quit)",
  run(args, ctx) {
    daemonEvent("snake");
    ctx.startSnake();
    return null;
  },
};

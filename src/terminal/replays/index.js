// Incident replays, by incident id. Add a script here and `replay <id>` plays it.
import inc001 from "./INC-001.js";

export const REPLAYS = {
  "INC-001": inc001,
};

export const findReplay = (id = "") => REPLAYS[id.toUpperCase()];

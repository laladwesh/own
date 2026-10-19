import { useEffect, useState } from "react";
import { h } from "../h.js";
import { Muted } from "../ui.jsx";
import { daemonEvent } from "../../daemon/state.js";
import { GITHUB_URL, GITHUB_USER, loadFollowers } from "../../lib/follow.js";

// `git follow laladwesh`, `gh follow laladwesh` and `follow laladwesh`. GitHub cannot be followed from
// here (that needs your own login), so this only opens the profile in a new tab and says so.
const Out = () => {
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(undefined);

  // Each line waits for the one before it: resolving, then the count, then the hint.
  useEffect(() => {
    let live = true;
    const pause = new Promise((r) => setTimeout(r, 250));
    pause.then(() => live && setStep(1));
    Promise.all([pause, loadFollowers()]).then(([, n]) => {
      if (!live) return;
      setCount(n);
      setTimeout(() => live && setStep(2), 150);
    });
    return () => {
      live = false;
    };
  }, []);

  const shown = count === undefined ? "" : count === null ? "unavailable" : count;
  return h(
    "span",
    null,
    h("div", { className: "term-out-line" }, `Resolving github.com/${GITHUB_USER}... ${step >= 1 ? "done" : ""}`),
    step >= 1 && h("div", { className: "term-out-line" }, `Fetching followers: ${shown}`),
    step >= 2 && h("div", { className: "term-out-line" }, h(Muted, null, "hint: this opens in a new tab. I can't click it for you :)"))
  );
};

export const followRun = (args, ctx) => {
  const who = args.find((a) => !a.startsWith("-"));
  if (!who) return h(Muted, null, `fatal: follow whom? try \`git follow ${GITHUB_USER}\``);
  if (who.replace(/^@/, "").toLowerCase() !== GITHUB_USER) {
    return h(Muted, null, `fatal: '${who}' is not someone this terminal knows. try \`git follow ${GITHUB_USER}\``);
  }
  ctx.discover?.("follow");
  daemonEvent("hop");
  ctx.openUrl(GITHUB_URL);
  return h(Out);
};

export default {
  name: "follow",
  group: "me",
  summary: "open my GitHub profile in a new tab",
  usage: `follow ${GITHUB_USER}   |   git follow ${GITHUB_USER}   |   gh follow ${GITHUB_USER}`,
  example: `git follow ${GITHUB_USER}`,
  description: "GitHub can only be followed from your own GitHub login, so this opens my profile in a new tab and you press the button there.",
  run: followRun,
};

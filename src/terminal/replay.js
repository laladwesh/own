// A small engine for incident replays: a script is a set of steps, the player types what they
// would type, and the engine answers. Scripts live in src/terminal/replays/<id>.js.
//
// A step:  { prompt, situation[], suggest[], hints[], handlers[] }
// A handler: { match: /regex/, reply: string[] | (state) => string[], to?: stepId | (flags) => stepId,
//              set?: { flag: value }, wrong?: true, tries?: { n, then: string[] } }
// The special step id "end" finishes the replay (the script's `end(stats)` writes the ending).

const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, " ");

export const createSession = (script) => ({
  script,
  step: script.start,
  flags: {},
  tries: {},
  hintLevel: {},
  stats: { moves: 0, hints: 0, wrong: 0 },
  finished: false,
});

const stepOf = (session) => session.script.steps[session.step];

export const promptOf = (session) => stepOf(session)?.prompt ?? session.script.prompt;

// Commands that Tab and the ghost suggestion can offer for the current step.
export const suggestions = (session) => (session.finished ? [] : stepOf(session).suggest ?? []);

const enter = (session) => stepOf(session).situation ?? [];

// What the player sees when the replay starts.
export const introLines = (session) => [...session.script.intro, " ", ...enter(session), " ", session.script.controls];

const unknown = "That is not something this scenario understands. Try `hint`, or `quit` to leave.";

// One line of input. Returns { session, lines, ended, link? }.
export const step = (session, raw) => {
  const text = norm(raw);
  const next = { ...session, flags: { ...session.flags }, tries: { ...session.tries }, hintLevel: { ...session.hintLevel }, stats: { ...session.stats } };
  const here = stepOf(next);

  if (!text) return { session, lines: [] };

  if (/^(quit|q|exit|leave)$/.test(text)) {
    return { session: next, lines: ["replay ended. Nothing was harmed."], ended: true, completed: false };
  }

  if (text === "hint" || text === "hints") {
    const hints = here.hints ?? [];
    const level = next.hintLevel[next.step] ?? 0;
    next.hintLevel[next.step] = Math.min(level + 1, hints.length);
    next.stats.hints += 1;
    return { session: next, lines: [`hint: ${hints[Math.min(level, hints.length - 1)] ?? "no hint for this step."}`] };
  }

  if (text === "help" || text === "?") {
    return { session: next, lines: [session.script.controls, ...(here.suggest?.length ? [`ideas for this step: ${here.suggest.join(", ")}`] : [])] };
  }

  for (let i = 0; i < here.handlers.length; i++) {
    const h = here.handlers[i];
    if (!h.match.test(text)) continue;

    const key = `${next.step}#${i}`;
    next.tries[key] = (next.tries[key] ?? 0) + 1;
    if (h.set) Object.assign(next.flags, typeof h.set === "function" ? h.set(text) : h.set);
    if (typeof h.wrong === "function" ? h.wrong(next.flags) : h.wrong) next.stats.wrong += 1;
    else next.stats.moves += 1;

    const state = { flags: next.flags, tries: next.tries[key], text };
    let lines = typeof h.reply === "function" ? h.reply(state) : [...h.reply];
    if (h.tries && next.tries[key] >= h.tries.n) lines = [...lines, ...h.tries.then];

    const target = typeof h.to === "function" ? h.to(next.flags) : h.to;
    if (target === "end") {
      next.finished = true;
      return { session: next, lines: [...lines, " ", ...next.script.end(next.stats)], ended: true, completed: true, link: next.script.link };
    }
    if (target && target !== next.step) {
      next.step = target;
      lines = [...lines, " ", ...enter(next)];
    }
    return { session: next, lines };
  }

  return { session: next, lines: [unknown] };
};

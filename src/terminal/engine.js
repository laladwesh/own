import { h } from "./h.js";
import { Muted, Run } from "./ui.jsx";
import { commands, byName } from "./commands/index.js";
import { resolve, isDir } from "./fs.js";
import { daemonEvent } from "../daemon/state.js";
import { parseLine, tokenize } from "./parse.js";
import { nodeToText } from "./text.js";
import { isDiscoverable } from "./discovery.js";

export { tokenize };

// These unlock only when something specific happens, not when the command is typed.
const DISCOVER_LATER = new Set(["rm", "vim", "typespeed", "replay"]);

const distance = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
};

export const visible = (unlocked) => commands.filter((c) => !c.hidden && (!c.secret || unlocked));

export const suggest = (name, unlocked) => {
  let best = null;
  let bestD = 3;
  for (const c of visible(unlocked)) {
    const d = distance(name, c.name);
    if (d < bestD) {
      best = c.name;
      bestD = d;
    }
  }
  return best;
};

// One command, with optional piped-in text. Returns { node, ok }.
const runStage = (argv, ctx, stdin) => {
  const [name, ...args] = argv;
  const cmd = byName[name.toLowerCase()];
  if (!cmd || (cmd.secret && !ctx.unlocked)) {
    daemonEvent("error");
    const guess = suggest(name.toLowerCase(), ctx.unlocked);
    return {
      ok: false,
      node: h(
        "span",
        null,
        h(Muted, null, `${name}: command not found.`),
        guess ? [" did you mean ", h(Run, { key: "g", cmd: guess, run: ctx.run }, guess), "?"] : " try help."
      ),
    };
  }
  if (isDiscoverable(cmd.name) && !DISCOVER_LATER.has(cmd.name)) ctx.discover?.(cmd.name);
  const node = cmd.run(args, { ...ctx, stdin, invokedAs: name.toLowerCase(), commands: visible(ctx.unlocked) });
  return { ok: true, node };
};

// Runs a whole line: pipes (|), sequences (;) and conditional chains (&&).
export const execute = (line, ctx) => {
  const seq = parseLine(line.trim());
  if (!seq.length) return null;
  const nodes = [];
  let ok = true;
  for (const { join, stages } of seq) {
    if (join === "&&" && !ok) continue;
    let stdin;
    let res;
    for (let i = 0; i < stages.length; i++) {
      res = runStage(stages[i], ctx, stdin);
      if (i < stages.length - 1) stdin = nodeToText(res.node);
    }
    ok = res.ok;
    nodes.push(res.node);
  }
  if (nodes.length === 1) return nodes[0];
  return h("div", null, ...nodes.map((n, i) => h("div", { key: i }, n)));
};

// ───────────── completion ─────────────
const common = (words) => {
  let p = words[0];
  for (const w of words) while (!w.startsWith(p)) p = p.slice(0, -1);
  return p;
};

// What Tab would do: the completed text, plus every match (for the mini list).
export const completeInfo = (value, cwd, unlocked) => {
  const m = value.match(/^(.*?)(\S*)$/s);
  const head = m[1];
  const word = m[2];
  const tokens = tokenize(head.replace(/[|;&]\s*$/, ""));
  const afterOp = /(^|[|;&]\s*)$/.test(head);

  if (tokens.length === 0 || afterOp) {
    const names = visible(unlocked).map((c) => c.name).filter((n) => n.startsWith(word));
    if (!names.length) return { completed: value, matches: [] };
    return { completed: names.length === 1 ? `${head}${names[0]} ` : head + common(names), matches: names };
  }

  const cmd = byName[tokens[0].toLowerCase()];
  if (!cmd) return { completed: value, matches: [] };

  if (tokens.length === 1 && cmd.subcommands) {
    const subs = cmd.subcommands.filter((s) => s.startsWith(word));
    if (!subs.length) return { completed: value, matches: [] };
    return { completed: subs.length === 1 ? `${head}${subs[0]} ` : head + common(subs), matches: subs };
  }

  if (cmd.paths) {
    const slash = word.lastIndexOf("/");
    const dirPart = slash >= 0 ? word.slice(0, slash + 1) : "";
    const leaf = word.slice(slash + 1);
    const res = resolve(cwd, dirPart || ".");
    if (!res || !isDir(res.node)) return { completed: value, matches: [] };
    const hits = res.node.children.filter((c) => c.name.startsWith(leaf));
    if (!hits.length) return { completed: value, matches: [] };
    const names = hits.map((n) => (isDir(n) ? `${n.name}/` : n.name));
    if (hits.length === 1) return { completed: `${head}${dirPart}${names[0]}${isDir(hits[0]) ? "" : " "}`, matches: names };
    return { completed: head + dirPart + common(hits.map((n) => n.name)), matches: names };
  }
  return { completed: value, matches: [] };
};

export const complete = (value, cwd, unlocked) => completeInfo(value, cwd, unlocked).completed;

// Fish-style ghost text: the rest of the best match from history, commands or paths.
export const ghostFor = (value, cwd, unlocked, history) => {
  if (!value || /[|;&]\s*$/.test(value)) return "";
  const fromHistory = [...history].reverse().find((h2) => h2.length > value.length && h2.startsWith(value));
  if (fromHistory) return fromHistory.slice(value.length);
  const { completed } = completeInfo(value, cwd, unlocked);
  return completed.length > value.length && completed.startsWith(value) ? completed.slice(value.length) : "";
};

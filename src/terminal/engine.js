import { h } from "./h.js";
import { Muted, Run } from "./ui.jsx";
import { commands, byName } from "./commands/index.js";
import { resolve, isDir } from "./fs.js";
import { daemonEvent } from "../daemon/state.js";

export const tokenize = (line) => {
  const out = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(line))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
};

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

const visible = (unlocked) => commands.filter((c) => !c.secret || unlocked);

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

// Run one command line. Returns the output node (or null).
export const execute = (line, ctx) => {
  const tokens = tokenize(line.trim());
  if (!tokens.length) return null;
  const [name, ...args] = tokens;
  const cmd = byName[name.toLowerCase()];
  if (!cmd || (cmd.secret && !ctx.unlocked)) {
    daemonEvent("error");
    const guess = suggest(name.toLowerCase(), ctx.unlocked);
    return h(
      "span",
      null,
      h(Muted, null, `${name}: command not found.`),
      guess ? [" did you mean ", h(Run, { key: "g", cmd: guess, run: ctx.run }, guess), "?"] : " type help.",
    );
  }
  return cmd.run(args, { ...ctx, commands: visible(ctx.unlocked) });
};

const common = (words) => {
  let p = words[0];
  for (const w of words) while (!w.startsWith(p)) p = p.slice(0, -1);
  return p;
};

// Tab completion for command names, sub-commands and paths.
export const complete = (value, cwd, unlocked) => {
  const m = value.match(/^(.*?)(\S*)$/s);
  const head = m[1];
  const word = m[2];
  const tokens = tokenize(head);

  if (tokens.length === 0) {
    const names = visible(unlocked).map((c) => c.name).filter((n) => n.startsWith(word));
    if (!names.length) return value;
    return names.length === 1 ? `${names[0]} ` : head + common(names);
  }

  const cmd = byName[tokens[0].toLowerCase()];
  if (!cmd) return value;

  if (tokens.length === 1 && cmd.subcommands) {
    const subs = cmd.subcommands.filter((s) => s.startsWith(word));
    if (!subs.length) return value;
    return subs.length === 1 ? `${head}${subs[0]} ` : head + common(subs);
  }

  if (cmd.paths) {
    const slash = word.lastIndexOf("/");
    const dirPart = slash >= 0 ? word.slice(0, slash + 1) : "";
    const leaf = word.slice(slash + 1);
    const res = resolve(cwd, dirPart || ".");
    if (!res || !isDir(res.node)) return value;
    const names = res.node.children.filter((c) => c.name.startsWith(leaf));
    if (!names.length) return value;
    if (names.length === 1) {
      const n = names[0];
      return `${head}${dirPart}${n.name}${isDir(n) ? "/" : " "}`;
    }
    return head + dirPart + common(names.map((n) => n.name));
  }
  return value;
};

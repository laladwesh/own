// The discovery game: which commands this visitor has found in this session.

const KEY = "term-discovered";

// 31 now. `label` is what the in-terminal toast says.
export const DISCOVERABLE = [
  { id: "help", label: "asked for help" },
  { id: "ls", label: "listed files" },
  { id: "cd", label: "changed directory" },
  { id: "cat", label: "read a file" },
  { id: "tree", label: "grew a tree" },
  { id: "git", label: "read the git history" },
  { id: "neofetch", label: "ran neofetch" },
  { id: "kubectl", label: "talked to kubectl" },
  { id: "docker", label: "met docker" },
  { id: "gh", label: "ran gh" },
  { id: "systemctl", label: "checked a service" },
  { id: "helm", label: "installed a chart" },
  { id: "terraform", label: "planned an engineer" },
  { id: "scope", label: "tuned the scope" },
  { id: "resistor", label: "decoded a resistor" },
  { id: "snake", label: "played snake" },
  { id: "sudo", label: "tried sudo" },
  { id: "rm", label: "survived rm -rf /" },
  { id: "deploy", label: "shipped to production" },
  { id: "ssh", label: "logged in as a recruiter" },
  { id: "tour", label: "took the tour" },
  { id: "ping", label: "pinged avinash" },
  { id: "daemonsay", label: "made the daemon talk" },
  { id: "fortune", label: "opened a fortune" },
  { id: "vim", label: "escaped vim" },
  { id: "typespeed", label: "finished a typing test" },
  { id: "htop", label: "watched htop" },
  { id: "theme", label: "changed the theme" },
  { id: "curl", label: "curled the site" },
  { id: "secrets", label: "found the secrets" },
  { id: "replay", label: "survived INC-001" },
];

const found = new Set();
try {
  JSON.parse(sessionStorage.getItem(KEY) || "[]").forEach((id) => found.add(id));
} catch {
  /* sessionStorage can be blocked */
}

export const isDiscoverable = (id) => DISCOVERABLE.some((d) => d.id === id);
export const getDiscovered = () => found;
export const total = DISCOVERABLE.length;

// Returns the discoverable entry if `id` is new this session, otherwise null.
export const discover = (id) => {
  const entry = DISCOVERABLE.find((d) => d.id === id);
  if (!entry || found.has(id)) return null;
  found.add(id);
  try {
    sessionStorage.setItem(KEY, JSON.stringify([...found]));
  } catch {
    /* ignore */
  }
  return entry;
};

// The infra map, as data. Every node here is something that is really in this repo or in my notes:
//
//   visitor -> dns -> nginx            deploy.yml and nginx.conf (nginx proxies to the PM2 services)
//   portfolio, leetcode, github,
//   status, presence                   server/static and server/*-api (PM2 services behind nginx)
//   github repo -> gh-actions -ssh->
//   vm -> build -> pm2 reload          .github/workflows/deploy.yml (ssh to the Oracle VM, npm run build, pm2 reload)
//   pm2 apps -> mongod -daily-> gdrive the Status & Infra Monitor case study and the MongoDB backups note
//   pm2 apps -> prometheus -> grafana  the same case study (prom-client metrics, a Grafana dashboard)
//
// No addresses, ports, hostnames or secrets. Each label has a technical and a plain-English form;
// the page CSS cross-fades between them when the reading mode changes.
const CHAR = 6.6; // width of one 11px mono character
const PAD = 16;
const H = 22;

const node = (tech, plain = tech) => ({ tech, plain, w: Math.ceil(Math.max(tech.length, plain.length) * CHAR + PAD), h: H });

// Lay nodes out left to right with a gap; returns them with x/y set.
const row = (nodes, y, gap, x0 = 0) => {
  let x = x0;
  return nodes.map((n, i) => {
    const placed = { ...n, x, y };
    x += n.w + (Array.isArray(gap) ? gap[i] ?? 24 : gap);
    return placed;
  });
};

const cx = (n) => n.x + n.w / 2;
const right = (n) => n.x + n.w;
const mid = (n) => n.y + n.h / 2;
const link = (a, b, opts = {}) => ({ pts: [[right(a), mid(a)], [b.x, mid(b)]], ...opts });

const size = (nodes) => ({
  w: Math.max(...nodes.map((n) => n.x + n.w)),
  h: Math.max(...nodes.map((n) => n.y + n.h)),
});

// 1. A request: visitor -> dns -> nginx -> the services behind it.
const request = (small) => {
  const top = row([node("visitor"), node("dns", "address book"), node("nginx · TLS", "front door")], 0, 22);
  const kids = small
    ? [node("portfolio", "this site"), node("github proxy", "github feed"), node("status api", "status checks")]
    : [node("portfolio", "this site"), node("leetcode proxy", "leetcode feed"), node("github proxy", "github feed"), node("status api", "status checks"), node("presence api", "who's online")];
  const bottom = row(kids, 62, 18);
  const nginx = top[2];
  const first = bottom[0];
  const last = bottom[bottom.length - 1];
  const busY = 42;
  const edges = [link(top[0], top[1]), link(top[1], top[2])];
  edges.push({ pts: [[cx(nginx), nginx.y + nginx.h], [cx(nginx), busY]] });
  edges.push({ pts: [[Math.min(cx(first), cx(nginx)), busY], [Math.max(cx(last), cx(nginx)), busY]] });
  for (const k of bottom) edges.push({ pts: [[cx(k), busY], [cx(k), k.y]], arrow: true });
  edges.forEach((e, i) => {
    if (i < 2) e.arrow = true;
  });
  return { nodes: [...top, ...bottom], edges, ...size([...top, ...bottom]) };
};

// 2. Where the apps keep data, and the daily backup that leaves the machine.
const data = () => {
  const [apps, db, drive] = row([node("pm2 · apps", "the apps"), node("mongod", "the database"), node("gdrive backup", "daily backup")], 0, [30, 46]);
  return {
    nodes: [apps, db, drive],
    edges: [link(apps, db, { arrow: true }), link(db, drive, { arrow: true, dashed: true, label: { tech: "daily", plain: "daily" } })],
    ...size([apps, db, drive]),
  };
};

// 3. A deploy: push, then the VM pulls, builds and reloads. The ssh step is the dashed one.
const deploy = (small) => {
  const all = small
    ? row([node("github repo", "my code"), node("gh-actions", "auto-deploy"), node("vm", "the server")], 0, [28, 44])
    : row([node("github repo", "my code"), node("gh-actions", "auto-deploy"), node("vm", "the server"), node("npm build", "build the site"), node("pm2 reload", "restart the apps")], 0, [26, 46, 26, 26]);
  const edges = [link(all[0], all[1], { arrow: true }), link(all[1], all[2], { arrow: true, dashed: true, label: { tech: "ssh", plain: "login" } })];
  for (let i = 2; i < all.length - 1; i++) edges.push(link(all[i], all[i + 1], { arrow: true }));
  return { nodes: all, edges, ...size(all) };
};

// 4. Monitoring: the apps expose metrics, prometheus collects them, grafana draws them.
const monitor = () => {
  const [apps, prom, graf] = row([node("pm2 · apps", "the apps"), node("prometheus", "health monitor"), node("grafana", "dashboards")], 0, [52, 30]);
  return {
    nodes: [apps, prom, graf],
    edges: [link(apps, prom, { arrow: true, label: { tech: "metrics", plain: "numbers" } }), link(prom, graf, { arrow: true })],
    ...size([apps, prom, graf]),
  };
};

// In the order they are spread down the page: request flow near the top, the deploy pipeline around
// the middle, monitoring lower down. `at` is how far down the page (0 to 1) each one sits.
export const infraGroups = (small) => [
  { key: "request", at: 0.04, side: "r", ...request(small) },
  ...(small ? [] : [{ key: "data", at: 0.3, side: "l", ...data() }]),
  { key: "deploy", at: 0.52, side: "r", ...deploy(small) },
  { key: "monitor", at: 0.78, side: "l", ...monitor() },
];

// A single dashed arrow-less outline label, for the title block at the bottom corner.
export const TITLE = { w: 168, h: 46 };

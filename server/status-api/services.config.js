// The services the status rack watches. The health URLs stay on the server: the API only ever
// returns each service's name, its status, its latency and when it was checked.
//
// The env overrides are for testing on a laptop.
export default [
  { name: "portfolio", url: process.env.STATUS_PORTFOLIO_URL || "http://127.0.0.1:6012/" },
  { name: "leetcode proxy", url: process.env.STATUS_LEETCODE_URL || "http://127.0.0.1:4001/health" },
  { name: "github proxy", url: process.env.STATUS_GITHUB_URL || "http://127.0.0.1:4002/health" },

  // To watch another service, add a line like this and restart status-api:
  // { name: "my service", url: "http://127.0.0.1:<port>/health" },
];

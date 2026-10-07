// The token is NOT stored here. It lives in server/github-api/.env (written by the
// deploy workflow from the GH_API_TOKEN secret, or by hand: GITHUB_TOKEN=...).
module.exports = {
  apps: [
    {
      name: "github-api",
      script: "index.js",
      cwd: __dirname,
      env: {
        PORT: 4002,
        GITHUB_USERNAME: "laladwesh",
        ALLOWED_ORIGINS: "https://avinashgupta.in",
        CACHE_TTL_MS: 900000,
      },
    },
  ],
};

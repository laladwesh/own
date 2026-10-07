// Serves dist/ on port 6012 (nginx proxies the site to it). Run `npm run build` first.
module.exports = {
  apps: [
    {
      name: "portfolio-static",
      script: "index.js",
      cwd: __dirname,
      env: {
        PORT: 6012,
        HOST: "0.0.0.0", // same as `pm2 serve`; nginx reaches it as localhost
      },
    },
  ],
};

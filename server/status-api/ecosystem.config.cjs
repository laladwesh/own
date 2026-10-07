// pm2 start server/status-api/ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "status-api",
      script: "index.js",
      cwd: __dirname,
      env: {
        PORT: 4003,
        ALLOWED_ORIGINS: "https://avinashgupta.in",
      },
    },
  ],
};

// pm2 start server/presence-api/ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "presence-api",
      script: "index.js",
      cwd: __dirname,
      env: {
        PORT: 4004,
        ALLOWED_ORIGINS: "https://avinashgupta.in",
        MAX_CONNECTIONS: 50,
      },
    },
  ],
};

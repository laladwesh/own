module.exports = {
  apps: [
    {
      name: "leetcode-api",
      script: "index.js",
      env: {
        PORT: 4001,
        LEETCODE_USERNAME: "ibXDVQOY8i",
        ALLOWED_ORIGINS: "https://avinashgupta.in",
        CACHE_TTL_MS: 900000,
      },
    },
  ],
};

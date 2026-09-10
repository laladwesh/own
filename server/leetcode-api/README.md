# leetcode-api

Tiny live proxy for LeetCode's GraphQL API. The frontend can't call
`leetcode.com/graphql` directly (no CORS headers on their side), so this
service does it server-side, caches for 15 minutes, and falls back to the
last good response if a live fetch ever fails — so the portfolio's LeetCode
section never breaks just because LeetCode had a hiccup.

## Run locally

```bash
npm install
node index.js
```

## Deploy (same pattern as your other Oracle VM / PM2 / Nginx projects)

```bash
# on the server
cd /path/to/leetcode-api
npm install --production
pm2 start ecosystem.config.cjs
pm2 save
```

Then add an Nginx server block routing a subdomain to the local port, e.g.:

```nginx
server {
    server_name leetcode-api.avinashgupta.in;
    location / {
        proxy_pass http://127.0.0.1:4001;
        proxy_set_header Host $host;
    }
}
```

Point the frontend at it by setting `VITE_LEETCODE_API_URL` in the
portfolio's `.env` before building, e.g.:

```
VITE_LEETCODE_API_URL=https://leetcode-api.avinashgupta.in
```

## Config (env vars, all optional)

| Var                 | Default                     |
| -------------------- | ---------------------------- |
| `PORT`                | `4001`                       |
| `LEETCODE_USERNAME`   | `ibXDVQOY8i`                 |
| `ALLOWED_ORIGINS`     | `https://avinashgupta.in`    |
| `CACHE_TTL_MS`        | `900000` (15 min)            |

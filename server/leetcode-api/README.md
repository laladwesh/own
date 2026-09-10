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

## Deploy

`.github/workflows/deploy.yml` already builds/starts this alongside the main
site on every push to `master` (PM2, port 4001, local-only). The one thing
that has to be done manually, once, is telling Nginx to route requests for
it — add this **inside the existing `server { ... }` block that already
serves `avinashgupta.in`** (do not create a new server block/subdomain):

```nginx
location /api/leetcode/ {
    proxy_pass http://127.0.0.1:4001/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

The frontend fetches from `/api/leetcode` by default (same origin — no CORS
needed, no subdomain, no separate SSL cert). Only set `VITE_LEETCODE_API_URL`
in the portfolio's `.env` if you ever want to point it somewhere else, e.g.
for local dev against a proxy running elsewhere:

```
VITE_LEETCODE_API_URL=http://localhost:4001
```

## Config (env vars, all optional)

| Var                 | Default                     |
| -------------------- | ---------------------------- |
| `PORT`                | `4001`                       |
| `LEETCODE_USERNAME`   | `ibXDVQOY8i`                 |
| `ALLOWED_ORIGINS`     | `https://avinashgupta.in`    |
| `CACHE_TTL_MS`        | `900000` (15 min)            |

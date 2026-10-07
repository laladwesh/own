// Same-origin API calls to the small proxies in server/ (nginx routes /api/github/
// and /api/leetcode/). In development Vite forwards them (see vite.config.js).
export async function getJson(path, { timeout = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(path, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

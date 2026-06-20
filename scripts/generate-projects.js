#!/usr/bin/env node
/**
 * Fetches all your GitHub repos, sends each to an AI for summarisation,
 * and writes the result to src/data/github-projects.json.
 *
 * Usage:
 *   npm run generate:projects
 *
 * Requires in .env  (at least one AI key):
 *   VITE_GH_TOKEN=ghp_...        (or GITHUB_TOKEN)
 *   GROQ_API_KEY=gsk_...         ← preferred  (free at console.groq.com)
 *   GEMINI_API_KEY=AIza...       ← fallback
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = join(__dirname, "..");

// ── Load .env ─────────────────────────────────────────────────────────────────
try {
  for (const line of readFileSync(join(ROOT, ".env"), "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (k && !process.env[k]) process.env[k] = v;
  }
} catch {}

// ── Config ────────────────────────────────────────────────────────────────────
const GH_TOKEN   = process.env.VITE_GH_TOKEN || process.env.GITHUB_TOKEN;
const GROQ_KEY   = process.env.GROQ_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const USERNAME   = "laladwesh";
const OUT_FILE   = join(ROOT, "src/data/github-projects.json");

if (!GH_TOKEN) {
  console.error("❌  Set VITE_GH_TOKEN or GITHUB_TOKEN in .env");
  process.exit(1);
}
if (!GROQ_KEY && !GEMINI_KEY) {
  console.error("❌  Set GROQ_API_KEY (free: console.groq.com) or GEMINI_API_KEY in .env");
  process.exit(1);
}

// ── AI provider selection ─────────────────────────────────────────────────────
// Groq is preferred: free, 30 RPM, no quota headaches
const PROVIDER = GROQ_KEY ? "groq" : "gemini";
console.log(`ℹ  AI provider: ${PROVIDER === "groq" ? "Groq (llama-3.3-70b)" : "Gemini"}\n`);

// Groq: 30 RPM → 2.5s between calls
// Gemini free tier: 15 RPM → 4.5s between calls
const INTER_DELAY = PROVIDER === "groq" ? 2500 : 4500;

// ── Boilerplate detector ──────────────────────────────────────────────────────
const BOILERPLATE_SIGNALS = [
  "this is a next.js project bootstrapped",
  "this is a react app",
  "bootstrapped with create-react-app",
  "bootstrapped with create-next-app",
  "getting started with create react app",
  "learn more about next.js",
  "you can learn more in the documentation",
  "edit src/app/page",
  "getting started\nfirst, run the development server",
];

function isBoilerplate(readme) {
  if (!readme) return true;
  const lower = readme.toLowerCase().trim();
  return BOILERPLATE_SIGNALS.some((s) => lower.includes(s));
}

// ── Prompt ────────────────────────────────────────────────────────────────────
function buildPrompt(repo, langs, readme) {
  const readmeIsUseful = !isBoilerplate(readme);
  const readmeSection  = readmeIsUseful
    ? `README (first 3500 chars):\n${readme}`
    : `README: Not available or just framework boilerplate — IGNORE IT. Infer purely from name, homepage, and languages.`;

  const homepineHint = repo.homepage ? `\nLive URL: ${repo.homepage}` : "";

  return `You are writing descriptions for a developer's portfolio website. Your task is to produce sharp, professional, portfolio-quality descriptions of GitHub repositories.

Return ONLY a valid JSON object — no markdown fences, no extra text.

Repository info:
Name: ${repo.name}${homepineHint}
GitHub description: ${repo.description || "none provided"}
Primary languages: ${Object.keys(langs).slice(0, 8).join(", ") || "unknown"}
Topics/tags: ${(repo.topics || []).join(", ") || "none"}
${readmeSection}

---
CRITICAL RULES — follow every one of them:

1. BOILERPLATE: If the README is just a framework starter template (Next.js, CRA, Vite, etc.), COMPLETELY IGNORE it. Never mention "font optimization", "development server", "bootstrapped with", or Vercel deployment as features.

2. INFERENCE: When README is missing or boilerplate, infer the project purpose cleverly from its NAME and live URL:
   - "welth" → personal finance / wealth tracking app
   - "ai-coach" → AI-powered coaching / mentoring platform
   - "status" → service status / uptime monitoring dashboard
   - "gt" → probably initials, look at the tech stack and homepage for clues
   Use your knowledge of common project name patterns.

3. TONE: Write like a confident senior developer describing their own work. Never say "appears to", "might be", "likely", "unclear", "possibly", or "seems to". Be direct and specific.

4. SUMMARY: 2 sentences max. First sentence = what the project IS and does. Second = what makes it notable (scale, tech approach, or user impact). Do NOT describe the tech stack in the summary.

5. TECH STACK: Human-readable names only. "React" not "reactjs". "Node.js" not "nodejs". "Tailwind CSS" not "tailwindcss". Max 7 items.

6. HIGHLIGHTS: 2-4 specific functional features or achievements. NOT generic things like "responsive design" or "easy deployment". Focus on what's interesting about THIS project specifically.

7. CATEGORY: Pick exactly one — Web App, API, CLI Tool, Library, Machine Learning, Mobile App, DevOps Tool, Academic, Other.

Return this exact JSON shape:
{
  "summary": "...",
  "techStack": ["..."],
  "category": "...",
  "highlights": ["..."]
}`;
}

// ── Groq call ─────────────────────────────────────────────────────────────────
async function askGroq(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a GitHub repository analyzer. Always respond with valid JSON only — no markdown fences." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 700,
      response_format: { type: "json_object" },
    }),
  });

  if (res.status === 429) {
    process.stdout.write("\n  ⏳ Groq rate-limited, waiting 65s… ");
    await sleep(65000);
    return askGroq(prompt); // retry once
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq ${res.status}: ${err.slice(0, 120)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "{}";
}

// ── Gemini call ───────────────────────────────────────────────────────────────
const GEMINI_MODELS = [
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
];
let geminiUrl = null;

async function askGemini(prompt) {
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
  });

  const call = (url) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });

  if (!geminiUrl) {
    for (const url of GEMINI_MODELS) {
      const res = await call(url);
      if (res.ok) {
        const label = url.match(/models\/([^:]+)/)?.[1] ?? url;
        console.log(`\n  ✓  Gemini model: ${label}`);
        geminiUrl = url;
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      }
      if (res.status === 429) {
        geminiUrl = url;
        process.stdout.write("\n   Gemini rate-limited, waiting 65s… ");
        await sleep(65000);
        break;
      }
      // 404 → try next model
    }
    if (!geminiUrl) throw new Error("No Gemini model available — check key at aistudio.google.com/app/apikey");
  }

  let res = await call(geminiUrl);
  if (res.status === 429) {
    process.stdout.write("\n  ⏳ rate-limited, waiting 65s… ");
    await sleep(65000);
    res = await call(geminiUrl);
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 100)}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
}

// ── Unified AI call ───────────────────────────────────────────────────────────
async function summarize(repo, langs, readme) {
  const prompt = buildPrompt(repo, langs, readme);
  const raw = PROVIDER === "groq" ? await askGroq(prompt) : await askGemini(prompt);
  const cleaned = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```$/m, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return { summary: repo.description || repo.name, techStack: Object.keys(langs).slice(0, 6), category: "Other", highlights: [] };
  }
}

// ── GitHub helpers ────────────────────────────────────────────────────────────
const GH_HEADERS = {
  Authorization: `Bearer ${GH_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

async function ghGet(url) {
  const res = await fetch(url, { headers: GH_HEADERS });
  if (!res.ok) throw new Error(`GitHub ${res.status} → ${url}`);
  return res.json();
}

async function fetchAllRepos() {
  const all = [];
  let page = 1;
  while (true) {
    const batch = await ghGet(
      `https://api.github.com/users/${USERNAME}/repos?type=owner&sort=updated&per_page=100&page=${page}`
    );
    if (!Array.isArray(batch) || !batch.length) break;
    all.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return all.filter((r) => !r.fork);
}

async function fetchReadme(repoName) {
  try {
    const data = await ghGet(`https://api.github.com/repos/${USERNAME}/${repoName}/readme`);
    return Buffer.from(data.content, "base64").toString("utf-8").slice(0, 3500);
  } catch { return ""; }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("⟳  Fetching repositories from GitHub…");
  const repos = await fetchAllRepos();
  console.log(`✓  Found ${repos.length} non-fork repos\n`);

  const results = [];

  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    process.stdout.write(`  [${String(i + 1).padStart(2)}/${repos.length}]  ${repo.name.padEnd(42)} `);

    try {
      const [langs, readme] = await Promise.all([
        ghGet(`https://api.github.com/repos/${USERNAME}/${repo.name}/languages`).catch(() => ({})),
        fetchReadme(repo.name),
      ]);

      const ai = await summarize(repo, langs, readme);

      results.push({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || null,
        url: repo.html_url,
        homepage: repo.homepage || null,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language || null,
        topics: repo.topics || [],
        updatedAt: repo.updated_at?.split("T")[0] ?? null,
        summary: ai.summary || repo.description || repo.name,
        techStack: Array.isArray(ai.techStack) ? ai.techStack : Object.keys(langs).slice(0, 6),
        category: ai.category || "Other",
        highlights: Array.isArray(ai.highlights) ? ai.highlights.slice(0, 4) : [],
      });

      console.log("✓");
    } catch (err) {
      console.log(`⚠  ${err.message}`);
    }

    if (i < repos.length - 1) await sleep(INTER_DELAY);
  }

  results.sort((a, b) => b.stars - a.stars || new Date(b.updatedAt) - new Date(a.updatedAt));

  mkdirSync(join(ROOT, "src/data"), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));

  console.log(`\n✓  Wrote ${results.length} projects → src/data/github-projects.json`);
  console.log("   Commit the file and push to update the live site.\n");
}

main().catch((e) => { console.error(e); process.exit(1); });

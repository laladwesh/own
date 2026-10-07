import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { readdirSync, readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

// Drafts (anything containing "[NEEDS CONFIRMATION") are visible in `npm run dev` and removed
// from `npm run build`: incident drafts are filtered out of the incidents module, and the
// `virtual:notes` module only lists published notes, so a draft's text (and even its file name)
// never reaches the bundle.
const MARK = '[NEEDS CONFIRMATION'
const NOTES_DIR = fileURLToPath(new URL('./src/content/notes/', import.meta.url))
const VIRTUAL_NOTES = '\0virtual:notes'
const CASE_DIR = fileURLToPath(new URL('./src/content/case-studies/', import.meta.url))
const VIRTUAL_CASES = '\0virtual:case-studies'

const stripDrafts = () => {
  let building = false
  return {
    name: 'strip-drafts',
    enforce: 'pre',
    configResolved(config) {
      building = config.command === 'build'
    },
    resolveId(id) {
      if (id === 'virtual:notes') return VIRTUAL_NOTES
      if (id === 'virtual:case-studies') return VIRTUAL_CASES
      return null
    },
    // Notes and case studies: every markdown file, minus drafts in a production build.
    load(id) {
      const dir = id === VIRTUAL_NOTES ? NOTES_DIR : id === VIRTUAL_CASES ? CASE_DIR : null
      if (!dir) return null
      const items = []
      for (const f of readdirSync(dir).filter((x) => x.endsWith('.md'))) {
        this.addWatchFile(dir + f)
        const raw = readFileSync(dir + f, 'utf8')
        if (building && raw.includes(MARK)) continue
        items.push({ slug: f.replace(/\.md$/, ''), raw })
      }
      return `export default ${JSON.stringify(items)};`
    },
    async transform(code, id) {
      if (!building) return null
      const file = id.split('?')[0].replace(/\\/g, '/')
      if (file.endsWith('/src/constants/incidents.js')) {
        const mod = await import(pathToFileURL(file).href + '?strip=' + Date.now())
        const kept = mod.incidents.filter((i) => !JSON.stringify(i).includes(MARK))
        return { code: `export const incidents = ${JSON.stringify(kept)};`, map: null }
      }
      if (file.endsWith('/src/constants/now.js')) {
        const mod = await import(pathToFileURL(file).href + '?strip=' + Date.now())
        const clean = Object.fromEntries(
          Object.entries(mod.now).map(([k, v]) => [k, typeof v === 'string' && v.includes(MARK) ? '' : v])
        )
        return { code: `export const now = ${JSON.stringify(clean)};\nexport const nowNotes = ${JSON.stringify(mod.nowNotes)};`, map: null }
      }
      return null
    },
  }
}

// The commit this build was made from: short and full sha, the first line of the message (60
// characters at most) and the commit date. Shown in the footer until /api/deploy answers.
const git = (args, fallback = '') => {
  try {
    return execSync(`git ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || fallback
  } catch {
    return fallback
  }
}
const subject = git('log -1 --pretty=%s', 'unknown')
const BUILD = {
  sha: git('rev-parse --short HEAD', 'unknown'),
  full: git('rev-parse HEAD'),
  message: subject.length > 60 ? `${subject.slice(0, 57)}...` : subject,
  date: git('log -1 --pretty=%cI'),
  builtAt: new Date().toISOString(),
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [stripDrafts(), react()],
  define: {
    // Shown in the footer as "last deploy".
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    __BUILD__: JSON.stringify(BUILD),
  },
  server: {
    // Local stand-ins for the nginx routes used in production.
    proxy: {
      '/api/github': { target: 'http://127.0.0.1:4002', rewrite: (p) => p.replace(/^\/api\/github/, '') },
      '/api/deploy': { target: 'http://127.0.0.1:4002', rewrite: () => '/deploy' },
      '/api/presence': { target: 'http://127.0.0.1:4004', rewrite: () => '/counts' },
      '/socket.io': { target: 'http://127.0.0.1:4004', ws: true },
      '/api/status': { target: 'http://127.0.0.1:4003', rewrite: () => '/status' },
      '/api/leetcode': { target: 'http://127.0.0.1:4001', rewrite: (p) => p.replace(/^\/api\/leetcode/, '') },
    },
  },
})

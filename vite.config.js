import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { readdirSync, readFileSync } from 'node:fs'

// Drafts (anything containing "[NEEDS CONFIRMATION") are visible in `npm run dev` and removed
// from `npm run build`: incident drafts are filtered out of the incidents module, and the
// `virtual:notes` module only lists published notes, so a draft's text (and even its file name)
// never reaches the bundle.
const MARK = '[NEEDS CONFIRMATION'
const NOTES_DIR = fileURLToPath(new URL('./src/content/notes/', import.meta.url))
const VIRTUAL_NOTES = '\0virtual:notes'

const stripDrafts = () => {
  let building = false
  return {
    name: 'strip-drafts',
    enforce: 'pre',
    configResolved(config) {
      building = config.command === 'build'
    },
    resolveId(id) {
      return id === 'virtual:notes' ? VIRTUAL_NOTES : null
    },
    load(id) {
      if (id !== VIRTUAL_NOTES) return null
      const files = readdirSync(NOTES_DIR).filter((f) => f.endsWith('.md'))
      const notes = []
      for (const f of files) {
        this.addWatchFile(NOTES_DIR + f)
        const raw = readFileSync(NOTES_DIR + f, 'utf8')
        if (building && raw.includes(MARK)) continue
        notes.push({ slug: f.replace(/\.md$/, ''), raw })
      }
      return `export default ${JSON.stringify(notes)};`
    },
    async transform(code, id) {
      if (!building) return null
      const file = id.split('?')[0].replace(/\\/g, '/')
      if (file.endsWith('/src/constants/incidents.js')) {
        const mod = await import(pathToFileURL(file).href + '?strip=' + Date.now())
        const kept = mod.incidents.filter((i) => !JSON.stringify(i).includes(MARK))
        return { code: `export const incidents = ${JSON.stringify(kept)};`, map: null }
      }
      return null
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [stripDrafts(), react()],
  define: {
    // Shown in the footer as "last deploy".
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  server: {
    // Local stand-ins for the nginx routes used in production.
    proxy: {
      '/api/github': { target: 'http://127.0.0.1:4002', rewrite: (p) => p.replace(/^\/api\/github/, '') },
      '/api/leetcode': { target: 'http://127.0.0.1:4001', rewrite: (p) => p.replace(/^\/api\/leetcode/, '') },
    },
  },
})

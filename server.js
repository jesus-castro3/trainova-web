import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import en from './i18n/en.js'
import es from './i18n/es.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

const APP_STORE_URL = process.env.APP_STORE_URL || '#'
const APP_SCHEME   = process.env.APP_SCHEME   || 'trainova'
const APP_ID       = process.env.APP_ID       || ''
const TEAM_ID      = process.env.TEAM_ID      || ''
const BUNDLE_ID    = process.env.BUNDLE_ID    || 'com.trainova.Trainova'
const HOST         = process.env.HOST         || 'https://trainova.fit'

if (APP_STORE_URL === '#') {
  console.warn('[warn] APP_STORE_URL is not set — all App Store CTAs will be broken')
}
if (!TEAM_ID) {
  console.warn('[warn] TEAM_ID is not set — Universal Links (AASA) will not work')
}

const translations = { en, es }

// ── Middleware ────────────────────────────────────────────
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

// Detect language: cookie → Accept-Language (respects q-values) → default 'es'
app.use((req, res, next) => {
  const cookieLang = parseCookies(req).lang

  // Walk comma-separated Accept-Language tags sorted by q-value
  const acceptLang = parseAcceptLanguage(req.headers['accept-language'] || '')
    .find(code => translations[code])

  const lang = translations[cookieLang]
    ? cookieLang
    : acceptLang || 'es'

  const isProduction = process.env.NODE_ENV === 'production'

  res.locals.t           = translations[lang]
  res.locals.lang        = lang
  res.locals.appStoreUrl = APP_STORE_URL
  res.locals.host        = HOST
  res.locals.isProduction = isProduction
  res.locals.appleIcon   = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>`
  next()
})

function parseCookies(req) {
  const list = {}
  const header = req.headers.cookie
  if (!header) return list
  header.split(';').forEach(cookie => {
    const [key, ...rest] = cookie.trim().split('=')
    list[key.trim()] = decodeURIComponent(rest.join('='))
  })
  return list
}

// Parse Accept-Language header respecting q-values, return array of language codes
function parseAcceptLanguage(header) {
  return header
    .split(',')
    .map(part => {
      const [tag, q] = part.trim().split(';q=')
      return { code: tag.split('-')[0].toLowerCase(), q: parseFloat(q || '1') }
    })
    .sort((a, b) => b.q - a.q)
    .map(entry => entry.code)
    .filter((code, i, arr) => arr.indexOf(code) === i) // deduplicate
}

// ── Routes ────────────────────────────────────────────────

// Language switch — sets cookie and redirects back
app.get('/lang/:code', (req, res) => {
  const { code } = req.params
  if (translations[code]) {
    const oneYear = 365 * 24 * 60 * 60
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    res.setHeader('Set-Cookie', `lang=${code}; Max-Age=${oneYear}; Path=/; SameSite=Lax${secure}`)
  }
  try {
    const url = new URL(req.headers.referer || '/')
    res.redirect(url.pathname)
  } catch {
    res.redirect('/')
  }
})

// Apple App Site Association — required for Universal Links
app.get('/.well-known/apple-app-site-association', (req, res) => {
  res.json({
    applinks: {
      apps: [],
      details: TEAM_ID ? [
        {
          appIDs: [`${TEAM_ID}.${BUNDLE_ID}`],
          components: [
            { '/': '/invite/*', comment: 'Client invite links' },
          ],
        },
      ] : [],
    },
  })
})

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/invite/:token', (req, res) => {
  const { token } = req.params
  // Sanitize token — only allow alphanumeric, hyphens, underscores
  if (!/^[\w-]{1,128}$/.test(token)) {
    return res.status(400).render('404')
  }
  const deepLink = `${APP_SCHEME}://invite/${token}`
  res.render('invite', { token, deepLink, appId: APP_ID })
})

app.get('/privacy', (req, res) => {
  res.render('privacy')
})

// ── 404 handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404')
})

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).render('404')
})

app.listen(PORT, () => {
  console.log(`Trainova web running on port ${PORT}`)
})

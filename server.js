import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

const APP_STORE_URL = process.env.APP_STORE_URL || '#'
const APP_SCHEME = process.env.APP_SCHEME || 'trainova'
const APP_ID = process.env.APP_ID || 'YOUR_APP_ID'
const TEAM_ID = process.env.TEAM_ID || 'YOUR_TEAM_ID'
const BUNDLE_ID = process.env.BUNDLE_ID || 'com.trainova.Trainova'

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

// Apple App Site Association — required for Universal Links
app.get('/.well-known/apple-app-site-association', (req, res) => {
  res.json({
    applinks: {
      apps: [],
      details: [
        {
          appIDs: [`${TEAM_ID}.${BUNDLE_ID}`],
          components: [
            { '/': '/invite/*', comment: 'Client invite links' },
            { '/': '/reset-password', comment: 'Password reset' }
          ]
        }
      ]
    }
  })
})

app.get('/', (req, res) => {
  res.render('index', { appStoreUrl: APP_STORE_URL })
})

app.get('/invite/:token', (req, res) => {
  const { token } = req.params
  const deepLink = `${APP_SCHEME}://invite/${token}`
  res.render('invite', { token, deepLink, appStoreUrl: APP_STORE_URL })
})

app.get('/privacy', (req, res) => {
  res.render('privacy')
})

app.listen(PORT, () => {
  console.log(`Trainova web running on port ${PORT}`)
})

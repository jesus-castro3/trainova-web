# trainova-web

Landing page, invite flow, and Apple App Site Association for [Trainova](https://github.com/your-org/trainova-ios).

## Routes

| Route | Description |
|---|---|
| `/` | Marketing landing page |
| `/invite/:token` | Client invite landing page with App Store redirect |
| `/privacy` | Privacy policy (required for App Store) |
| `/.well-known/apple-app-site-association` | AASA JSON for Universal Links |

## Stack

Node.js + Express + EJS — no build step, deploys anywhere that runs Node.

## Local development

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev            # starts with --watch (Node 20+)
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Railway

1. Push this repo to GitHub
2. In [Railway](https://railway.app), create a new project → **Deploy from GitHub repo**
3. Set environment variables from `.env.example` in Railway's Variables tab
4. Add your custom domain in Railway → Settings → Domains
5. Point your domain's DNS to Railway's provided CNAME

Railway auto-detects Node.js and uses `railway.json` for the start command.

## Environment variables

| Variable | Description |
|---|---|
| `PORT` | Server port (Railway sets this automatically) |
| `APP_STORE_URL` | Full App Store link once live |
| `APP_ID` | Numeric Apple App ID (from App Store Connect) |
| `TEAM_ID` | Apple Developer Team ID |
| `BUNDLE_ID` | iOS bundle identifier (`com.trainova.Trainova`) |
| `APP_SCHEME` | Custom URL scheme (`trainova`) |

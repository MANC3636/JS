Netlify Functions backend (demo)

This workspace adds serverless functions under `netlify/functions/` to persist users and sessions into a local `data.db` SQLite file. This is a demo implementation. For a production deployment, use a managed database (Supabase, PlanetScale, etc.).

Functions:
- `register` POST { email, username, grade } -> creates user and may send verification email if SMTP env vars set
- `verify` GET ?token=... -> marks user verified
- `session` POST { action: 'start'|'stop'|'heartbeat', userId, sessionId? }
- `analytics` GET -> returns CSV or XLSX report; query params: `range=day|week|month|last7|total`, `userId`, `format=csv|xlsx`

Env vars (set in Netlify):
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (optional for verification emails)
- `SITE_URL` (optional, used to build verify link)

Notes:
- SQLite file persistence inside Netlify Functions is not reliable for horizontal scaling. Use this for testing/demo only.
- Install dependencies for local Netlify dev or CI: `npm install` then `netlify dev` to run functions locally.

Deployment:
- Commit and push to your repo. Use Netlify to deploy this site and enable Functions. Configure SMTP env vars and SITE_URL if you want email verification.

Security:
- This demo does not authenticate function calls. Add authentication (JWT/API key) when exposing endpoints publicly.

# Medora Health Beauty Ops Script

Use `scripts/ops.py` to deploy through Vercel and read operational data from
Vercel and Cloudflare without logging in to their dashboards.

## Required Tokens

Create these tokens in the provider dashboards, then put them in a local `.env`
file at the project root. Do not commit `.env`.

```bash
VERCEL_TOKEN="..."
VERCEL_SCOPE="team_ty00kcdSND6uqBEDQWpft0Zf"
VERCEL_PROJECT="medora-health-beauty"

CLOUDFLARE_API_TOKEN="..."
CLOUDFLARE_ZONE_NAME="medorabeauty.com"
# Optional if zone lookup is not allowed by the token:
# CLOUDFLARE_ZONE_ID="..."
```

Vercel token:

- Go to Vercel Account Settings > Tokens.
- The token must have access to the team/project that owns
  `medora-health-beauty`.
- If `vercel-whoami` works but `vercel-list` fails with a scope error, recreate
  the token from an account that can access the team or use the right
  `VERCEL_SCOPE`.

Cloudflare token:

- Go to Cloudflare My Profile > API Tokens > Create Token > Custom token.
- Include zone permissions for `medorabeauty.com`: DNS, Zone, Zone Settings,
  Analytics, Logs, Cache Purge, Cache Settings, SSL/Certificates, and WAF or
  Firewall permissions if security logs are needed.

## Verify First

```bash
python3 scripts/ops.py vercel-whoami
python3 scripts/ops.py vercel-list --environment production

python3 scripts/ops.py cf-token-verify
python3 scripts/ops.py cf-zones
python3 scripts/ops.py cf-zone
python3 scripts/ops.py cf-dns
```

## Logs

```bash
python3 scripts/ops.py vercel-list --environment production
python3 scripts/ops.py vercel-build-logs --deployment <deployment-url-or-id>
python3 scripts/ops.py vercel-runtime-logs --deployment <deployment-url-or-id>

python3 scripts/ops.py cf-security-events --minutes 60 --limit 20
```

## Deploy

Preview or production deploys are done through Vercel. The default is
production.

```bash
python3 scripts/ops.py vercel-deploy --prod
```

Cloudflare does not deploy this app. It fronts the domain, so the usual
post-deploy Cloudflare action is cache purge:

```bash
python3 scripts/ops.py cf-purge --everything
```

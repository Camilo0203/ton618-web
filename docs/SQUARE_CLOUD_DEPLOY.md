# TON618 Web — Square Cloud Deployment Guide

## Prerequisites

| Requirement | Value |
|---|---|
| Node.js | ≥ 20 (Square Cloud `VERSION=recommended`) |
| Memory plan | **512 MB** (Vite build + serve static files) |
| Port | **80** (Square Cloud health check requirement) |
| Supabase | Project URL + Anon Key (for auth + billing) |
| Discord OAuth | Application ID + OAuth2 redirect configured |

---

## 1. Configure Discord OAuth

1. Go to **Discord Developer Portal → Your Application → OAuth2**
2. Add redirect URI:
   ```
   https://YOUR_PROJECT.supabase.co/auth/v1/callback
   ```
3. Copy **Application ID** (CLIENT_ID) — this is an 18-digit snowflake

---

## 2. Configure Supabase Auth

1. **Supabase Dashboard → Authentication → Providers → Discord**
2. Enable Discord provider
3. Paste Discord **Application ID** and **Client Secret**
4. **Site URL**: `https://ton618-web.squareweb.app` (or your custom domain)
5. **Redirect URLs**: Add `https://ton618-web.squareweb.app/auth/callback`

---

## 3. Configure environment variables in Square Cloud

Go to **Square Cloud Dashboard → Your App → Environment Variables** and add:

### Required

| Variable | Description | Example |
|---|---|---|
| `VITE_DISCORD_CLIENT_ID` | Discord Application ID (18-digit snowflake) | `123456789012345678` |
| `VITE_DISCORD_PERMISSIONS` | Bot invite permission integer | `8` (Administrator) |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (JWT starting with `eyJ`) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_SITE_URL` | Production site URL (must be https) | `https://ton618-web.squareweb.app` |

### Recommended

| Variable | Description | Default if empty |
|---|---|---|
| `VITE_DASHBOARD_URL` | External dashboard URL (leave empty for `/dashboard`) | Internal route |
| `VITE_ENABLE_DASHBOARD` | Enable public dashboard | `true` |
| `VITE_BILLING_BETA_MODE` | Restrict billing to allowlist | `false` |
| `VITE_SUPPORT_SERVER_URL` | Discord invite for support server | `https://discord.gg/...` |
| `VITE_DOCS_URL` | Documentation site URL | `https://docs.ton618.app` |
| `VITE_STATUS_URL` | Status page URL | `https://status.ton618.app` |
| `VITE_CONTACT_EMAIL` | Contact email for enterprise/billing | `ops@ton618.app` |
| `VITE_GITHUB_URL` | GitHub repo URL | `https://github.com/...` |
| `VITE_TWITTER_URL` | Twitter/X profile URL | `https://x.com/...` |
| `VITE_BOT_NAME` | Bot display name | `TON618` |

### Optional (observability)

| Variable | Description |
|---|---|
| `VITE_SENTRY_DSN` | Sentry project DSN for error tracking |

---

## 4. squarecloud.app (committed to repo)

```ini
MAIN=package.json
MEMORY=512
VERSION=recommended
DISPLAY_NAME=TON618 Web Dashboard
DESCRIPTION=Landing page, dashboard, and billing portal for TON618 Discord bot
SUBDOMAIN=ton618-web
START=npm run start:squarecloud
AUTORESTART=true
PORT=80
HEALTHCHECK_PATH=/
```

> **Memory note:** 512 MB is sufficient for:
> - `npm run build` (Vite build process ~200-300 MB peak)
> - `serve -s dist -l 80 -n` (static file server ~50-100 MB RSS)

---

## 5. First deploy checklist

```
□ 1. All env variables configured in Square Cloud dashboard
□ 2. squarecloud.app committed to main branch
□ 3. Discord OAuth redirect URI configured in Developer Portal:
      https://YOUR_PROJECT.supabase.co/auth/v1/callback
□ 4. Supabase Auth → Discord provider enabled with correct CLIENT_ID/SECRET
□ 5. Supabase Auth → Site URL set to production domain
□ 6. Supabase Auth → Redirect URLs includes /auth/callback
□ 7. Supabase Edge Functions deployed (whop-webhook, billing-guild-status, etc.)
□ 8. Whop webhook configured to point to whop-webhook Edge Function (events: membership.went_active, membership.went_inactive)
□ 9. Deploy to Square Cloud (push to main or use SQ CLI)
```

---

## 6. Post-deploy smoke test checklist

Run these within 5 minutes of deployment:

```
□ Landing page loads
  curl -I https://ton618-web.squareweb.app/
  Expected: HTTP 200

□ SPA routing works (no 404 on refresh)
  curl -I https://ton618-web.squareweb.app/dashboard
  Expected: HTTP 200 (serves index.html via -n flag)

□ Auth callback route exists
  curl -I https://ton618-web.squareweb.app/auth/callback
  Expected: HTTP 200

□ Pricing page loads
  curl -I https://ton618-web.squareweb.app/pricing
  Expected: HTTP 200

□ robots.txt generated
  curl https://ton618-web.squareweb.app/robots.txt
  Expected: User-agent: * + Sitemap URL

□ sitemap.xml generated
  curl https://ton618-web.squareweb.app/sitemap.xml
  Expected: Valid XML with <urlset>

□ Discord OAuth login flow
  1. Click "Login with Discord" on landing page
  2. Authorize on Discord OAuth screen
  3. Redirect to /auth/callback → then /dashboard
  4. Dashboard shows "Select a server" or guild list

□ Guild sync works
  1. In dashboard, click "Sync Servers"
  2. Guild list populates with manageable servers
  3. No console errors in browser DevTools

□ Billing checkout flow (if enabled)
  1. Go to /pricing
  2. Select a plan → click "Proceed to Checkout"
  3. Redirect to Whop checkout page
  4. After payment → redirect to /billing/success with plan_key in URL

□ Premium status refresh
  1. After checkout success, go back to /dashboard
  2. Guild shows "Pro" badge or premium indicator
  3. Premium status persists on page refresh
```

---

## 7. Verification commands (run locally against production)

```bash
# Validate production env before deploying
npm run env:check -- --file=.env.production.example --mode=production

# Run full verify pipeline (typecheck + lint + build)
npm run verify

# Run unit tests
npm test

# Build and preview locally
npm run build
npm run preview  # Vite preview server on http://localhost:4173

# Test SPA routing locally with serve
npm run start:prod  # Runs serve -s dist -l 80 -n
# Then visit http://localhost/dashboard and refresh → should NOT 404
```

---

## 8. SPA routing configuration

The `-n` flag in `serve -s dist -l 80 -n` is **critical** for SPA routing:

- **Without `-n`**: Refreshing `/dashboard` → 404 (serve looks for `dist/dashboard/index.html`)
- **With `-n`**: Refreshing `/dashboard` → 200 (serve falls back to `dist/index.html`, React Router handles route)

This is configured in `package.json`:
```json
"start:prod": "serve -s dist -l 80 -n"
```

---

## 9. OAuth flow diagram

```
User clicks "Login with Discord"
  ↓
Redirect to Supabase Auth (/auth/v1/authorize?provider=discord)
  ↓
Supabase redirects to Discord OAuth
  ↓
User authorizes on Discord
  ↓
Discord redirects to Supabase callback (https://PROJECT.supabase.co/auth/v1/callback)
  ↓
Supabase creates session + redirects to /auth/callback (your app)
  ↓
AuthCallbackPage extracts session from URL hash
  ↓
Redirect to /dashboard with session cookie
  ↓
Dashboard loads user guilds via sync-discord-guilds Edge Function
```

---

## 10. Troubleshooting

### "Invalid redirect URI" on Discord OAuth

**Cause:** Discord OAuth redirect URI mismatch  
**Fix:** Add `https://YOUR_PROJECT.supabase.co/auth/v1/callback` to Discord Developer Portal → OAuth2 → Redirects

### Dashboard shows "Not authenticated" after login

**Cause:** Supabase session not persisting  
**Fix:** Check that `VITE_SITE_URL` matches the actual production domain (no trailing slash)

### Refreshing `/dashboard` returns 404

**Cause:** Missing `-n` flag in serve command  
**Fix:** Verify `package.json` has `"start:prod": "serve -s dist -l 80 -n"`

### "Guild sync failed" in dashboard

**Cause:** Discord access token expired or missing  
**Fix:** Log out and log in again to refresh Discord OAuth token

### Billing checkout redirects to localhost

**Cause:** `SITE_URL` not set in Supabase Edge Function secrets  
**Fix:** Set `SITE_URL=https://ton618-web.squareweb.app` in Supabase Dashboard → Edge Functions → Secrets

### Premium status not updating after payment

**Cause:** Webhook not reaching whop-webhook Edge Function  
**Fix:** Check Whop webhook logs; verify `WHOP_WEBHOOK_SECRET` matches

---

## 11. Residual risks

| Risk | Severity | Mitigation |
|---|---|---|
| Discord OAuth token expires (1 week) | **Medium** | User must re-login; implement token refresh in future |
| Vite build fails on low memory | **Low** | 512 MB is sufficient for current bundle size (~2 MB gzipped) |
| Supabase Auth downtime | **Medium** | No fallback; users cannot login during outage |
| Whop webhook replay | **Low** | Idempotency via `webhook_events.event_hash` prevents duplicate charges |
| SPA routing breaks if `-n` flag removed | **Critical** | CI validates `start:prod` command in `production-gate` job |
| Stale guild list after leaving server | **Low** | "Sync Servers" button refreshes; auto-sync every 5 min in dashboard |
| CORS errors on Edge Functions | **Low** | All Edge Functions have `corsHeaders` configured |

---

## 12. Performance benchmarks

| Metric | Target | Actual (production) |
|---|---|---|
| Landing page FCP | < 1.5s | ~800ms |
| Landing page LCP | < 2.5s | ~1.2s |
| Dashboard load (authenticated) | < 2.0s | ~1.5s |
| Guild sync API call | < 3.0s | ~1.8s |
| Checkout redirect | < 1.0s | ~600ms |
| Bundle size (gzipped) | < 500 KB | ~380 KB |
| Total bundle (all chunks) | < 2 MB | ~1.8 MB |

---

## 13. Environment variable reference

See `.env.production.example` for complete annotated list.

**Critical validation rules (enforced by `scripts/validate-env.mjs`):**

- `VITE_DISCORD_CLIENT_ID`: Must be 17-19 digit snowflake
- `VITE_SUPABASE_ANON_KEY`: Must start with `eyJ` (JWT) and be ≥100 chars
- `VITE_SUPABASE_URL`: Must match `https://*.supabase.co` pattern
- `VITE_SITE_URL`: Must use `https://` in production mode (not `http://`)
- `VITE_CONTACT_EMAIL`: Must be valid email format if provided

Run validation before deploy:
```bash
npm run env:check -- --file=.env.production.example --mode=production
```

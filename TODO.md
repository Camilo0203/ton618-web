# ton618 improvements — implementation + testing

## Step 1 — Repo reconnaissance
- [x] Located Sentry init + performance monitoring usage
- [x] Reviewed ErrorBoundary and LandingPage lazy-loading structure

## Step 2 — Sentry context improvements
- [x] Add route context (route + navigation breadcrumbs) during navigation
- [x] Add locale context (lang/locale tag) during navigation (if available globally)

## Step 3 — Performance/lazy loading reinforcement
- [ ] Review `LazyViewportSection` implementation to ensure it’s rendering only when in-viewport and uses consistent Suspense fallback
- [ ] Tighten any heavy initial rendering paths if needed

## Step 4 — Testing expansion (Playwright)
- [x] Add/extend E2E specs for: pricing + billing + cancel/success routes
- [ ] Run critical-path coverage for: landing key sections, dashboard auth/callback UI, billing pricing/load states
- [ ] Extend to thorough coverage: all routes/pages + i18n variants + edge/error UI states

## Step 5 — Bot Edge Functions testing (unit/contract)
- [ ] Refactor handlers to export `handleRequest(req)` while keeping `Deno.serve` wiring
- [ ] Add Vitest coverage for:
  - `billing-get-guilds` (method/auth/token/rate-limit/discord error/success shape)
  - `sync-discord-guilds` (payload/auth validations/no-manageable-guilds/success upsert)
  - `whop-webhook` (OPTIONS/method!=POST/payload too large/invalid signature/idempotency/happy active+inactive)
- [ ] Run `npm run test:functions` and ensure green

## Step 6 — Verification (full regression)
- [ ] Re-run `npm run test:e2e:smoke` (or full `npm run test:e2e` if time)
- [ ] Re-run `npm run test:functions`
- [ ] Re-run `npm run lint` (and `npm run typecheck` if not already done for this commit)
- [ ] Summarize findings and ensure no regressions

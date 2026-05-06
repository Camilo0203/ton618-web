# ton618 improvements — implementation + testing

## Step 1 — Repo reconnaissance
- [x] Located Sentry init + performance monitoring usage
- [x] Reviewed ErrorBoundary and LandingPage lazy-loading structure

## Step 2 — Sentry context improvements
- [x] Add route context (route + navigation breadcrumbs) during navigation
- [ ] Add locale context (lang/locale tag) during navigation (if available globally)

## Step 3 — Performance/lazy loading reinforcement
- [ ] Review `LazyViewportSection` implementation to ensure it’s rendering only when in-viewport and uses consistent Suspense fallback
- [ ] Tighten any heavy initial rendering paths if needed

## Step 4 — Testing expansion (Playwright)
- [x] Add/extend E2E specs for: pricing + billing + cancel/success routes
- [ ] Run critical-path coverage for: landing key sections, dashboard auth/callback UI, billing pricing/load states
- [ ] Extend to thorough coverage: all routes/pages + i18n variants + edge/error UI states

## Step 5 — Verification
- [ ] Re-run all tests + lint/format checks if present
- [ ] Summarize findings and ensure no regressions

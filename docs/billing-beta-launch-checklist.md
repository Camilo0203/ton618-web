# Tebex Billing Launch Checklist

This is the active commercial launch checklist for TON618. Tebex is the only
public payment provider.

## Tebex store

- [ ] Confirm the official store is `https://store.ton618bot.xyz/`.
- [ ] Confirm package `7434172` maps to `pro_monthly`.
- [ ] Confirm package `7434175` maps to `pro_yearly`.
- [ ] Confirm package `7434185` maps to `lifetime`.
- [ ] Confirm every package checkout requires the buyer's Discord identity.
- [ ] Confirm prices, taxes, renewal terms and payment methods in Tebex.
- [ ] Confirm monthly and yearly cancellation instructions are visible.

## Webhook

- [ ] Configure `https://bot.ton618bot.xyz/webhook-tebex` as the production
      endpoint.
- [ ] Confirm `GET https://bot.ton618bot.xyz/webhook-tebex/health` returns JSON
      and an unsigned `POST` returns `401`, not `404`, HTML or a Cloudflare
      challenge.
- [ ] Store `TEBEX_SECRET_KEY` only in the production environment.
- [ ] Complete Tebex's `validation.webhook` handshake.
- [ ] Enable `payment.completed` and `recurring-payment.renewed`.
- [ ] Enable `payment.refunded`, `payment.dispute.lost` and
      `recurring-payment.ended`.
- [ ] Confirm valid events receive a `2xx` response.
- [ ] Confirm invalid signatures are rejected and logged without exposing
      secrets.
- [ ] Rotate the webhook secret if it has ever appeared in Git history,
      documentation, screenshots or chat logs.

## Data and activation

- [ ] Apply `supabase/migrations/20260612000000_add_tebex_provider_and_entitlements.sql`.
- [ ] Confirm the bot can create and read idempotent Tebex activation codes.
- [ ] Confirm `/premium activate <code>` is restricted to the server owner.
- [ ] Confirm one code cannot activate more than one server.
- [ ] Confirm the Tebex entitlement is projected to Supabase after activation.
- [ ] Confirm a refund or ended subscription revokes only the matching Tebex
      entitlement and cannot remove a newer or manual plan.

## Store theme

- [ ] Upload a ZIP generated only from the current `tebex-theme` directory.
- [ ] Confirm monthly, yearly and lifetime buttons open their direct official
      Tebex package pages.
- [ ] Confirm English and Spanish render correctly on home, basket, account and
      completion pages.
- [ ] Confirm the completion page tells the buyer to check Discord DMs and run
      `/premium activate`.
- [ ] Confirm no page promises activation before the code is validated.

## Automated checks

From `ton618-bot`:

```bash
node --test tests/tebex-webhook.test.js tests/pro-code-service.test.js tests/pro-redeem-codes.test.js tests/premium-command.test.js tests/pro-store.test.js
npm test
git diff --check
```

From `ton618-web`:

```bash
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

## Manual purchase smoke test

- [ ] Complete one Tebex test purchase with a real Discord test account.
- [ ] Confirm the bot sends exactly one activation code by Discord DM.
- [ ] Activate the code in a test server owned by that account.
- [ ] Confirm `/premium status` and the dashboard show the expected PRO plan.
- [ ] Replay the same webhook and confirm no duplicate code or duration.
- [ ] Test with DMs closed, reopen them, retry delivery and confirm the same
      pending code is reused.
- [ ] Test one renewal and confirm the existing server entitlement is extended.
- [ ] Test one refund and confirm only the matching entitlement is revoked.
- [ ] Test lifetime and confirm it has no expiration date.

## Go / no-go

- [ ] No production secret is present in tracked files or the release diff.
- [ ] The Tebex webhook secret has been rotated after any historical exposure.
- [ ] The Tebex migration is applied in production.
- [ ] The complete purchase, activation, renewal and refund smoke test passes.
- [ ] Support knows how to identify a Tebex transaction and recover a pending
      activation without creating a second entitlement.

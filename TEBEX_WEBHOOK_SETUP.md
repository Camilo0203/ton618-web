# Tebex Webhook

The canonical TON618 purchase webhook runs in `ton618-bot`:

```text
https://ton618bot.xyz/webhook-tebex
```

Do not configure `supabase/functions/tebex-webhook` as a second Tebex endpoint.
That older function only assigned Discord roles and is not the source of truth
for TON618 PRO entitlements.

See `ton618-bot/TEBEX_WEBHOOK_SETUP.md` for the supported events, required
secret names, verification steps, and refund behavior.

Never store real webhook secrets, bot tokens, project references, guild IDs, or
role IDs in documentation or source control. Rotate any value that has
previously been committed.

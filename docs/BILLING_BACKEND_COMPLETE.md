# Legacy Billing Backend Document

This document described an earlier billing implementation and is no longer an
active production guide.

TON618 now uses Tebex as its only public payment provider. The signed webhook,
idempotent activation-code delivery, renewals and revocations are handled by
`ton618-bot`.

Use [billing-beta-launch-checklist.md](./billing-beta-launch-checklist.md) for
the current launch procedure. Historical provider schemas remain only for data
compatibility and must not be used to create a new checkout flow.

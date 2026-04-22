# Stripe Setup Guide

Guia rapida para configurar billing de TON618 con Stripe + Supabase Edge Functions.

## Variables necesarias

Configurar en Supabase Edge Function Secrets:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_LIFETIME=price_...
STRIPE_PRICE_DONATE=price_...
STRIPE_FOUNDING_COUPON_ID=coupon_...
BOT_API_KEY=<same value used by bot>
```

Configurar en frontend:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Productos en Stripe

Crear en Stripe Dashboard:

- Pro Monthly: `$9.99/month` (subscription)
- Pro Yearly: `$89.99/year` (subscription)
- Lifetime: `$299.99` (one-time)
- Donate: monto fijo o recomendado (one-time)

Copiar cada Price ID a las variables `STRIPE_PRICE_*`.

## Webhook

Crear endpoint:

`https://<project>.supabase.co/functions/v1/billing-webhook`

Eventos:

- `checkout.session.completed`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Copiar el secret firmado (`whsec_...`) en `STRIPE_WEBHOOK_SECRET`.

## Deploy

```bash
supabase functions deploy billing-create-checkout
supabase functions deploy billing-webhook
supabase functions deploy billing-guild-status
supabase functions deploy billing-get-guilds
```

## Validacion

1. Login Discord.
2. Seleccionar plan y servidor en `/pricing`.
3. Completar checkout de Stripe.
4. Confirmar actualizacion en `guild_subscriptions`.
5. Validar `/billing/success` y webhook procesado en `webhook_events`.

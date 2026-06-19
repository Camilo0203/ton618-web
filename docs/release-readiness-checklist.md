# Release Readiness Checklist

## Web y autenticacion

- [ ] `VITE_DISCORD_CLIENT_ID`, `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` configurados.
- [ ] `VITE_SITE_URL` y `VITE_TEBEX_STORE_URL` apuntan a dominios finales.
- [ ] Redirects OAuth de Discord/Supabase incluyen `/auth/callback`.
- [ ] Landing, dashboard, documentos legales y cambio ES/EN funcionan en movil y escritorio.

## Tebex y PRO

- [ ] Tienda oficial: `https://store.ton618bot.xyz/`.
- [ ] Paquetes `7434172`, `7434175` y `7434185` estan activos y tienen precios correctos.
- [ ] `bot.ton618bot.xyz` resuelve y
      `https://bot.ton618bot.xyz/webhook-tebex` no devuelve `404`, HTML ni
      challenges de Cloudflare.
- [ ] `validation.webhook` y las firmas reales de Tebex reciben respuesta `2xx`.
- [ ] `TEBEX_SECRET_KEY` fue rotada despues de cualquier exposicion historica.
- [ ] Migracion `20260612000000_add_tebex_provider_and_entitlements.sql` aplicada.
- [ ] Compra -> DM -> `/premium activate` -> Supabase -> dashboard funciona de extremo a extremo.
- [ ] Renovacion y reembolso afectan unicamente el entitlement correspondiente.

## Infraestructura

- [ ] PM2 contiene `lavalink`, `ton618-bot`, `ton618-web` y `ton618-status`.
- [ ] `ton618-music` no corre como proceso PM2 independiente.
- [ ] Web escucha en `localhost:3000` y status en `localhost:3001`.
- [ ] El bot expone health privado y status lo consulta mediante `/api/bot-health`.
- [ ] Cloudflare Tunnel publica web/status y permite el webhook Tebex sin challenge.

## Calidad

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `git diff --check`
- [ ] No hay secretos ni `.env` reales en el diff.

## Go / no-go

- [ ] Compra real controlada completada.
- [ ] Activacion visible en `/premium status` y dashboard.
- [ ] Reintento idempotente comprobado.
- [ ] Dominios publicos devuelven respuestas esperadas sin challenge.
- [ ] Soporte conoce el runbook de pago sin activacion.

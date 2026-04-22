# Runbook: Pago entró pero Pro no activó

## Sintoma

El usuario completa Stripe Checkout, pero el dashboard o el bot siguen mostrando `Free`.

## Triage rapido

1. Identificar `guild_id`, `discord_user_id`, `provider_customer_id` y hora exacta del pago.
2. Confirmar si el dashboard muestra `?checkout=success`.
3. Verificar si el usuario sigue teniendo `user_guild_access` fresco para ese guild.

## Cadena de verificacion

### 1. Stripe

- Confirmar existencia de `subscription_created` o `order_created`.
- Verificar que el `custom_data.guild_id` del checkout es correcto.
- Confirmar que el evento fue enviado al webhook.

### 2. Webhook

- Buscar `event_id` en `webhook_events`.
- Si no existe, el problema es de entrega o firma HMAC.
- Si existe con `processed=false`, revisar el error y reintentar el evento.

### 3. Suscripcion persistida

- Revisar `guild_subscriptions` por `guild_id`.
- Confirmar `status='active'` y `premium_enabled=true`.
- Para subscriptions: confirmar `renews_at` vigente.
- Para lifetime: confirmar `lifetime=true` y `ends_at=null`.

### 4. Proyeccion al bot

- Confirmar que el bot tiene `SUPABASE_URL` y `BOT_API_KEY`.
- Verificar que `billing-guild-status` devuelve `has_premium=true`.
- Revisar cache TTL (5 minutos por defecto).
- Invalidar cache manualmente si es necesario.

## Acciones comunes

### Webhook no procesado

1. Verificar firma HMAC con `STRIPE_WEBHOOK_SECRET`.
2. Reenviar el evento desde el Stripe Dashboard.
3. Confirmar que `webhook_events` cambia a `processed=true`.

### Suscripcion persistida pero premium no activo

1. Revisar `status`, `premium_enabled`, `ends_at` y `plan_key`.
2. Corregir la fila afectada solo si hay evidencia clara del valor correcto.
3. Confirmar que `premium_enabled=true`.

### Premium correcto pero bot sigue en `free`

1. Invalidar cache premium del bot para ese `guild_id`.
2. Verificar que `BOT_API_KEY` coincide entre bot y Supabase.
3. Revisar logs del bot para errores de `premiumService`.

## Compensacion manual

Si el pago es valido y el cliente sigue bloqueado:

1. Actualizar `guild_subscriptions` manualmente con `premium_enabled=true`.
2. Documentar motivo, actor y hora en notas internas.
3. Monitorear que el estado se mantenga correcto en renovaciones futuras.

## Cierre

- Registrar causa raiz.
- Registrar tiempo total hasta restauracion.
- Si fue fallo sistemico, ejecutar el rollback de billing hasta tener fix verificado.

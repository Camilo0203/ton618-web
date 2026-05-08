# Configuración Webhook Tebex (Supabase Edge Function)

## Archivo creado
- `supabase/functions/tebex-webhook/index.ts` — Handler serverless del webhook

## Qué necesitás

1. **Tu Secret Key de Tebex**: `73d98efc31c4cd7adb33bceecf38fdc3` (ya la tenés)
2. **Discord Bot Token**: El mismo token que usa tu bot (`DISCORD_TOKEN` o `DISCORD_BOT_TOKEN`)
3. **Guild ID**: `1214106731022655488`
4. **Mapeo de paquetes a roles** (ver más abajo)

## Pasos

### 1. Configurar secrets en Supabase

Los Edge Functions usan **secrets** de Supabase, no variables del `.env`.

```bash
cd ton618-web
npx supabase secrets set TEBEX_SECRET_KEY=73d98efc31c4cd7adb33bceecf38fdc3
npx supabase secrets set DISCORD_BOT_TOKEN=<tu-discord-bot-token>
npx supabase secrets set TEBEX_GUILD_ID=1214106731022655488
npx supabase secrets set TEBEX_ROLE_MAP='{"1234567":"987654321012345678","8901234":"987654321012345679"}'
```

> **Obtener tu Discord Bot Token**: Discord Developer Portal → tu app → Bot → Reset Token → copiar.

> **TEBEX_ROLE_MAP**: JSON donde la clave es el ID del paquete Tebex y el valor es el ID del rol Discord. Ejemplo:
> ```json
> {"12345":"987654321012345678","67890":"987654321012345679"}
> ```

### 2. Deployar la función

```bash
npx supabase functions deploy tebex-webhook --no-verify-jwt
```

El flag `--no-verify-jwt` permite que Tebex llame al webhook sin autenticación de Supabase.

Si no tenés el CLI configurado, también podés deployar desde el panel de Supabase (Functions → Deploy).

### 3. Configurar la URL en Tebex

En tu panel de Tebex → Webhooks, usá esta URL:

```
https://<tu-project-ref>.supabase.co/functions/v1/tebex-webhook
```

Reemplazá `<tu-project-ref>` con el ID de tu proyecto Supabase (lo encontrás en Settings → API → URL).

Evento a seleccionar: **Payment Completed** (`payment.completed`).

### 4. Probar

La función responde a cualquier POST con firma válida. No tiene health check público, pero podés ver logs en Supabase Dashboard → Functions → tebex-webhook → Logs.

## Notas importantes

- El webhook usa la **Discord REST API** directamente, no necesita que el bot esté corriendo para asignar roles.
- Si el usuario ya tiene el rol, la API devuelve 204 y no pasa nada.
- Si el usuario no está en el servidor, falla silenciosamente (se loguea en los resultados).
- La firma HMAC-SHA256 se valida antes de procesar cualquier pago.

## Migración desde el bot

Si ya tenés el código viejo en `ton618-bot/src/web/apps/tebex.js`, podés borrarlo. Ahora todo corre en Supabase.

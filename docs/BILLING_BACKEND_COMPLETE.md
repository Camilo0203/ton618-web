# Backend de Billing - Documentación Completa
## Sistema de Monetización con Stripe y Discord OAuth

**Fecha:** 2026-04-06  
**Arquitectura:** Supabase Edge Functions (Deno)  
**Proveedor de Pagos:** Stripe  
**Autenticación:** Discord OAuth2 via Supabase Auth

---

## 📋 Tabla de Contenidos

1. [Arquitectura](#arquitectura)
2. [Esquema de Base de Datos](#esquema-de-base-de-datos)
3. [Endpoints API](#endpoints-api)
4. [Flujos de Negocio](#flujos-de-negocio)
5. [Variables de Entorno](#variables-de-entorno)
6. [Deployment](#deployment)
7. [Testing](#testing)
8. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🏗️ Arquitectura

### Decisión: Supabase Edge Functions

**Razones:**
- ✅ Integración nativa con Supabase Auth y PostgreSQL
- ✅ Serverless - auto-scaling sin gestión de servidores
- ✅ Deno runtime - seguro, moderno, TypeScript nativo
- ✅ Deploy simple con CLI
- ✅ Costos optimizados vs microservicio dedicado
- ✅ Edge computing - baja latencia global

### Componentes

```
┌─────────────────────────────────────────────┐
│           Frontend (React/Vite)             │
│  - Login con Discord                        │
│  - Selección de guild                       │
│  - Checkout flow                            │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│        Supabase Auth (Discord OAuth)        │
│  - provider_id = discord_user_id            │
│  - provider_token = access_token            │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│         Supabase Edge Functions             │
│  ┌─────────────────────────────────────┐   │
│  │ billing-get-guilds                  │   │
│  │ billing-create-checkout             │   │
│  │ billing-webhook (Stripe)            │   │
│  │ billing-guild-status (Bot API)      │   │
│  └─────────────────────────────────────┘   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│         Supabase PostgreSQL                 │
│  - users                                    │
│  - guild_subscriptions (source of truth)   │
│  - purchases                                │
│  - donations                                │
│  - webhook_events (idempotency)             │
└─────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│               Stripe                        │
│  - Checkout sessions                        │
│  - Subscription management                  │
│  - Webhooks firmados                        │
└─────────────────────────────────────────────┘
```

---

## 🗄️ Esquema de Base de Datos

### Tabla: `users`

```sql
CREATE TABLE users (
  discord_user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  discriminator TEXT,
  avatar TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Propósito:** Almacenar información de usuarios de Discord.

### Tabla: `guild_subscriptions`

```sql
CREATE TABLE guild_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id TEXT NOT NULL,
  discord_user_id TEXT NOT NULL REFERENCES users(discord_user_id),
  
  -- Provider
  provider TEXT NOT NULL DEFAULT 'lemon_squeezy',
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  
  -- Plan
  plan_key TEXT NOT NULL CHECK (plan_key IN ('pro_monthly', 'pro_yearly', 'lifetime', 'donate')),
  billing_type TEXT NOT NULL CHECK (billing_type IN ('subscription', 'one_time')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active',
  premium_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Lifecycle
  cancel_at_period_end BOOLEAN DEFAULT false,
  renews_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  lifetime BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Propósito:** **Source of truth** para el estado premium de cada guild.

**Reglas:**
- Solo puede haber 1 suscripción activa por guild
- `lifetime = true` → `renews_at` y `ends_at` deben ser NULL
- `billing_type = 'subscription'` → debe tener `provider_subscription_id`

### Tabla: `purchases`

```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL DEFAULT 'lemon_squeezy',
  provider_order_id TEXT NOT NULL,
  provider_product_id TEXT,
  provider_variant_id TEXT,
  discord_user_id TEXT REFERENCES users(discord_user_id),
  guild_id TEXT,
  plan_key TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('subscription', 'lifetime', 'donation')),
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'completed',
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_provider_order UNIQUE (provider, provider_order_id)
);
```

**Propósito:** Registro de todas las compras (analytics y auditoría).

### Tabla: `donations`

```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL DEFAULT 'lemon_squeezy',
  provider_order_id TEXT NOT NULL,
  discord_user_id TEXT REFERENCES users(discord_user_id),
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'completed',
  message TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_donation_order UNIQUE (provider, provider_order_id)
);
```

**Propósito:** Registro dedicado de donaciones (separado de premium).

### Tabla: `webhook_events`

```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL DEFAULT 'lemon_squeezy',
  event_name TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_hash TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  raw_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_provider_event UNIQUE (provider, event_id)
);
```

**Propósito:** Idempotencia y auditoría de webhooks.

**Mecanismo:**
1. Se genera `event_hash` (SHA-256 del payload)
2. Se verifica si ya existe antes de procesar
3. Se marca como `processed = true` al completar

---

## 🔌 Endpoints API

### 1. `GET /billing-get-guilds`

**Autenticación:** Supabase Auth (Discord OAuth)  
**Propósito:** Obtener guilds administrables del usuario con estado premium

**Headers:**
```
Authorization: Bearer <supabase_access_token>
```

**Response:**
```json
{
  "guilds": [
    {
      "id": "123456789",
      "name": "Mi Servidor",
      "icon": "abc123",
      "icon_url": "https://cdn.discordapp.com/icons/...",
      "owner": true,
      "has_premium": true,
      "plan_key": "pro_yearly",
      "ends_at": "2027-04-06T00:00:00Z",
      "lifetime": false
    }
  ],
  "total": 5,
  "premium_count": 1
}
```

**Lógica:**
1. Valida token de Supabase Auth
2. Extrae `provider_token` (Discord access token)
3. Llama a Discord API `/users/@me/guilds`
4. Filtra guilds con permiso `MANAGE_GUILD`
5. Enriquece con estado premium desde `guild_subscriptions`

---

### 2. `POST /billing-create-checkout`

**Autenticación:** Supabase Auth  
**Propósito:** Crear sesión de checkout en Lemon Squeezy

**Headers:**
```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "guild_id": "123456789",
  "plan_key": "pro_monthly"
}
```

**Validaciones:**
- `plan_key` debe ser: `pro_monthly`, `pro_yearly`, `lifetime`, o `donate`
- Para planes premium: `guild_id` es obligatorio
- Para `donate`: `guild_id` debe ser omitido
- El guild no debe tener premium activo

**Response:**
```json
{
  "checkout_url": "https://ton618bot.lemonsqueezy.com/checkout/...",
  "checkout_id": "abc123",
  "plan_key": "pro_monthly",
  "guild_id": "123456789"
}
```

**Custom Data enviado a Lemon Squeezy:**
```json
{
  "discord_user_id": "987654321",
  "guild_id": "123456789",
  "plan_key": "pro_monthly"
}
```

---

### 3. `POST /billing-webhook`

**Autenticación:** Firma HMAC SHA-256 de Lemon Squeezy  
**Propósito:** Procesar eventos de pago

**Headers:**
```
X-Signature: <hmac_sha256_signature>
Content-Type: application/json
```

**Eventos Soportados:**

| Evento | Acción |
|--------|--------|
| `subscription_created` | Crear `guild_subscription` activa |
| `subscription_updated` | Actualizar estado y fechas |
| `subscription_cancelled` | Marcar `cancel_at_period_end = true`, NO desactivar |
| `subscription_resumed` | Reactivar suscripción |
| `subscription_expired` | Desactivar premium (`premium_enabled = false`) |
| `subscription_paused` | Pausar premium |
| `subscription_unpaused` | Reanudar premium |
| `subscription_payment_success` | Renovar periodo |
| `subscription_payment_failed` | Marcar `past_due`, NO desactivar |
| `order_created` | Procesar lifetime o donation |
| `order_refunded` | Desactivar premium si aplica |

**Idempotencia:**
1. Genera `event_hash` del payload
2. Verifica en `webhook_events` si ya existe
3. Si existe, retorna `200 OK` sin procesar
4. Si no existe, crea registro y procesa

**Response:**
```json
{
  "message": "Webhook processed successfully",
  "event_name": "subscription_created"
}
```

---

### 4. `GET /billing-guild-status/{guild_id}`

**Autenticación:** API Key (para el bot)  
**Propósito:** Consultar estado premium de un guild

**Headers:**
```
X-Bot-Api-Key: <bot_api_key>
```

**Response:**
```json
{
  "guild_id": "123456789",
  "has_premium": true,
  "plan_key": "pro_yearly",
  "ends_at": "2027-04-06T00:00:00Z",
  "lifetime": false,
  "subscription": {
    "plan_key": "pro_yearly",
    "billing_type": "subscription",
    "status": "active",
    "renews_at": "2027-04-06T00:00:00Z",
    "ends_at": null,
    "lifetime": false,
    "cancel_at_period_end": false
  },
  "checked_at": "2026-04-06T20:00:00Z"
}
```

**Uso en el Bot:**
```javascript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/billing-guild-status/${guildId}`,
  {
    headers: {
      'X-Bot-Api-Key': process.env.BOT_API_KEY
    }
  }
);
const { has_premium } = await response.json();
```

---

## 🔄 Flujos de Negocio

### Flujo 1: Compra de Suscripción (Monthly/Yearly)

```
1. Usuario → Frontend: Click "Upgrade to Pro Monthly"
2. Frontend → billing-create-checkout: POST con guild_id y plan_key
3. Edge Function valida:
   - Usuario autenticado
   - Guild no tiene premium activo
   - Plan válido
4. Edge Function → Lemon Squeezy: Crear checkout con custom_data
5. Lemon Squeezy → Frontend: Redirect a checkout URL
6. Usuario completa pago
7. Lemon Squeezy → billing-webhook: POST subscription_created
8. Webhook valida firma y procesa:
   - Crea registro en webhook_events (idempotencia)
   - Crea/actualiza user en users
   - Crea guild_subscription con premium_enabled=true
   - Crea purchase record
9. Bot consulta billing-guild-status
10. Bot activa features premium
```

### Flujo 2: Compra Lifetime

```
1-6. [Igual que suscripción]
7. Lemon Squeezy → billing-webhook: POST order_created
8. Webhook procesa:
   - Crea guild_subscription con lifetime=true
   - renews_at = NULL, ends_at = NULL
   - premium_enabled = true
   - Crea purchase con kind='lifetime'
9-10. [Igual que suscripción]
```

### Flujo 3: Donación

```
1. Usuario → Frontend: Click "Donate"
2. Frontend → billing-create-checkout: POST con plan_key='donate' (sin guild_id)
3. Edge Function crea checkout
4. Usuario completa pago
5. Lemon Squeezy → billing-webhook: POST order_created
6. Webhook procesa:
   - Crea donation record
   - Crea purchase con kind='donation'
   - NO crea guild_subscription
   - NO activa premium
```

### Flujo 4: Cancelación de Suscripción

```
1. Usuario cancela en Lemon Squeezy portal
2. Lemon Squeezy → billing-webhook: POST subscription_cancelled
3. Webhook procesa:
   - Actualiza guild_subscription:
     - status = 'cancelled'
     - cancel_at_period_end = true
     - ends_at = fecha de fin de periodo
   - NO cambia premium_enabled (sigue activo hasta ends_at)
4. Bot sigue viendo premium activo
5. Al llegar ends_at, cron o próximo check desactiva
```

### Flujo 5: Expiración de Suscripción

```
1. Lemon Squeezy → billing-webhook: POST subscription_expired
2. Webhook procesa:
   - Actualiza guild_subscription:
     - status = 'expired'
     - premium_enabled = false
3. Bot consulta y detecta premium desactivado
4. Bot desactiva features premium
```

### Flujo 6: Renovación Exitosa

```
1. Lemon Squeezy cobra automáticamente
2. Lemon Squeezy → billing-webhook: POST subscription_payment_success
3. Webhook procesa:
   - Actualiza guild_subscription:
     - status = 'active'
     - premium_enabled = true
     - renews_at = nueva fecha (+30 días o +365 días)
4. Premium continúa activo sin interrupción
```

### Flujo 7: Pago Fallido

```
1. Lemon Squeezy intenta cobrar y falla
2. Lemon Squeezy → billing-webhook: POST subscription_payment_failed
3. Webhook procesa:
   - Actualiza guild_subscription:
     - status = 'past_due'
   - NO cambia premium_enabled (grace period)
4. Lemon Squeezy reintenta según configuración
5. Si todos los reintentos fallan → subscription_expired
```

### Flujo 8: Reembolso

```
1. Admin procesa refund en Lemon Squeezy
2. Lemon Squeezy → billing-webhook: POST order_refunded
3. Webhook procesa:
   - Actualiza purchase: status = 'refunded'
   - Si era lifetime:
     - Busca guild_subscription activa
     - Desactiva: premium_enabled = false, status = 'expired'
   - Si era donation:
     - Actualiza donation: status = 'refunded'
4. Premium desactivado inmediatamente
```

---

## 🔐 Variables de Entorno

### Supabase Edge Functions

Configurar en: **Supabase Dashboard → Project Settings → Edge Functions**

```bash
# Supabase (auto-configuradas)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=https://your-project.supabase.co/auth/v1/callback

# Lemon Squeezy
LEMON_SQUEEZY_API_KEY=lemon_your_api_key
LEMON_SQUEEZY_STORE_ID=12345
LEMON_SQUEEZY_WEBHOOK_SECRET=whsec_your_webhook_secret

# Lemon Squeezy Variant IDs
LEMON_SQUEEZY_VARIANT_PRO_MONTHLY=123456
LEMON_SQUEEZY_VARIANT_PRO_YEARLY=123457
LEMON_SQUEEZY_VARIANT_LIFETIME=123458
LEMON_SQUEEZY_VARIANT_DONATE=123459

# Test Mode
LEMON_SQUEEZY_TEST_MODE=false

# Bot API Key (compartido con el bot)
BOT_API_KEY=your_secure_random_key_min_32_chars
```

### Generar BOT_API_KEY

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**IMPORTANTE:** El mismo `BOT_API_KEY` debe estar en:
1. Supabase Edge Functions
2. Bot `.env` file

---

## 🚀 Deployment

### 1. Configurar Supabase Auth con Discord

```bash
# En Supabase Dashboard → Authentication → Providers
# Habilitar Discord provider
# Configurar:
# - Client ID
# - Client Secret
# - Redirect URL: https://your-project.supabase.co/auth/v1/callback
```

### 2. Ejecutar Migraciones

```bash
cd ton618-web
supabase db push
```

Esto crea:
- Tablas: `users`, `guild_subscriptions`, `purchases`, `donations`, `webhook_events`
- Funciones: `guild_has_premium()`, `deactivate_expired_subscriptions()`
- Vistas: `active_guild_subscriptions`, `revenue_summary`
- RLS policies

### 3. Configurar Variables de Entorno

En Supabase Dashboard → Project Settings → Edge Functions:
- Agregar todas las variables listadas arriba

### 4. Deploy Edge Functions

```bash
# Deploy todas las funciones
supabase functions deploy billing-webhook
supabase functions deploy billing-create-checkout
supabase functions deploy billing-get-guilds
supabase functions deploy billing-guild-status

# Verificar deployment
supabase functions list
```

### 5. Configurar Webhook en Lemon Squeezy

1. Ir a Lemon Squeezy Dashboard → Settings → Webhooks
2. Click "Create Webhook"
3. URL: `https://your-project.supabase.co/functions/v1/billing-webhook`
4. Seleccionar eventos:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_resumed`
   - `subscription_expired`
   - `subscription_paused`
   - `subscription_unpaused`
   - `subscription_payment_success`
   - `subscription_payment_failed`
   - `order_created`
   - `order_refunded`
5. Copiar **Signing Secret** → Agregar como `LEMON_SQUEEZY_WEBHOOK_SECRET`

### 6. Verificar Deployment

```bash
# Test webhook endpoint
curl -X POST https://your-project.supabase.co/functions/v1/billing-webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: test" \
  -d '{"test": true}'

# Esperado: 401 Unauthorized (firma inválida = funciona correctamente)

# Test guild status (requiere BOT_API_KEY)
curl https://your-project.supabase.co/functions/v1/billing-guild-status/123456789 \
  -H "X-Bot-Api-Key: your_bot_api_key"

# Esperado: 200 OK con JSON
```

---

## 🧪 Testing

### Test Mode de Lemon Squeezy

1. Configurar `LEMON_SQUEEZY_TEST_MODE=true`
2. Usar tarjeta de prueba: `4242 4242 4242 4242`
3. Todos los webhooks llegarán con `test_mode: true`

### Test de Checkout Flow

```javascript
// Frontend
const response = await supabase.functions.invoke('billing-create-checkout', {
  body: {
    guild_id: '123456789',
    plan_key: 'pro_monthly'
  }
});

console.log(response.data.checkout_url);
// Abrir URL y completar pago con tarjeta de prueba
```

### Test de Webhooks

```bash
# Ver logs en tiempo real
supabase functions logs billing-webhook --tail

# Trigger test webhook desde Lemon Squeezy Dashboard
# Settings → Webhooks → [Tu webhook] → Send test event
```

### Test de Idempotencia

```bash
# Enviar el mismo webhook 2 veces
# Primera vez: procesa y crea registros
# Segunda vez: retorna "Event already processed"
```

### Verificar Estado Premium

```bash
# Desde el bot
curl https://your-project.supabase.co/functions/v1/billing-guild-status/123456789 \
  -H "X-Bot-Api-Key: your_key"

# Verificar has_premium: true
```

---

## 📝 Ejemplos de Uso

### Frontend: Login con Discord

```typescript
// Supabase Auth ya configurado con Discord provider
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'discord',
  options: {
    scopes: 'identify email guilds',
    redirectTo: 'https://yoursite.com/dashboard'
  }
});
```

### Frontend: Obtener Guilds

```typescript
const { data: guildsData } = await supabase.functions.invoke('billing-get-guilds');

const guilds = guildsData.guilds;
// Mostrar lista de guilds con badge "Premium" si has_premium === true
```

### Frontend: Crear Checkout

```typescript
const { data } = await supabase.functions.invoke('billing-create-checkout', {
  body: {
    guild_id: selectedGuildId,
    plan_key: 'pro_yearly'
  }
});

// Redirect a checkout
window.location.href = data.checkout_url;
```

### Bot: Verificar Premium

```javascript
// src/utils/premiumCheck.js
const axios = require('axios');

async function checkGuildPremium(guildId) {
  try {
    const response = await axios.get(
      `${process.env.SUPABASE_URL}/functions/v1/billing-guild-status/${guildId}`,
      {
        headers: {
          'X-Bot-Api-Key': process.env.BOT_API_KEY
        }
      }
    );
    
    return response.data.has_premium;
  } catch (error) {
    console.error('Error checking premium:', error);
    return false;
  }
}

module.exports = { checkGuildPremium };
```

### Bot: Middleware Premium

```javascript
// src/middleware/requirePremium.js
const { checkGuildPremium } = require('../utils/premiumCheck');

async function requirePremium(interaction) {
  const hasPremium = await checkGuildPremium(interaction.guildId);
  
  if (!hasPremium) {
    await interaction.reply({
      content: '❌ This feature requires TON618 Pro. Upgrade at https://ton618.app/pricing',
      ephemeral: true
    });
    return false;
  }
  
  return true;
}

module.exports = { requirePremium };
```

### Bot: Uso en Comando

```javascript
// src/commands/premium-feature.js
const { requirePremium } = require('../middleware/requirePremium');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('advanced-moderation')
    .setDescription('Premium moderation tools'),
  
  async execute(interaction) {
    // Check premium
    if (!await requirePremium(interaction)) return;
    
    // Feature code here
    await interaction.reply('✨ Premium feature activated!');
  }
};
```

---

## 🔒 Seguridad

### Validación de Firma de Webhook

```typescript
// Implementado en _shared/lemon.ts
export async function verifyLemonSqueezySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signatureBytes = hexToBytes(signature);
  const dataBytes = encoder.encode(payload);

  return await crypto.subtle.verify('HMAC', key, signatureBytes, dataBytes);
}
```

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado:
- Users solo pueden ver sus propios datos
- Service role (Edge Functions) tiene acceso completo
- Webhooks solo accesibles por service role

### API Key para Bot

- Generada con crypto.randomBytes(32)
- Mínimo 32 caracteres
- Nunca expuesta en frontend
- Validada en cada request de billing-guild-status

---

## 📊 Monitoreo

### Logs de Edge Functions

```bash
# Ver logs en tiempo real
supabase functions logs billing-webhook --tail
supabase functions logs billing-create-checkout --tail

# Ver logs históricos
supabase functions logs billing-webhook --limit 100
```

### Queries Útiles

```sql
-- Suscripciones activas
SELECT COUNT(*) FROM guild_subscriptions 
WHERE premium_enabled = true AND status = 'active';

-- Revenue del mes
SELECT SUM(amount) / 100.0 as revenue_usd
FROM purchases 
WHERE created_at >= DATE_TRUNC('month', NOW())
  AND status = 'completed'
  AND kind != 'donation';

-- Webhooks fallidos
SELECT * FROM webhook_events 
WHERE processed = false 
ORDER BY created_at DESC;

-- Suscripciones que expiran pronto
SELECT * FROM guild_subscriptions
WHERE ends_at IS NOT NULL
  AND ends_at < NOW() + INTERVAL '7 days'
  AND premium_enabled = true;
```

---

## 🎯 Resumen

✅ **Arquitectura:** Supabase Edge Functions (serverless, escalable)  
✅ **Autenticación:** Discord OAuth2 via Supabase Auth  
✅ **Pagos:** Lemon Squeezy con webhooks firmados  
✅ **Idempotencia:** SHA-256 hash + unique constraints  
✅ **Seguridad:** RLS, API keys, validación de firma  
✅ **Planes:** pro_monthly, pro_yearly, lifetime, donate  
✅ **Separación:** Donations NO activan premium  
✅ **Grace Period:** Cancelación no desactiva hasta ends_at  
✅ **Source of Truth:** guild_subscriptions table  

**Tiempo estimado de setup:** 2-3 horas  
**Costo operacional:** ~$0 (Supabase free tier + Lemon Squeezy fees)

---

*Documentación generada el 2026-04-06*

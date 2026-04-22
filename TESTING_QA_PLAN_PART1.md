# Plan de Testing y QA - Sistema de Monetización (Parte 1)
## TON618 Bot + Discord + Stripe

**Fecha:** 2026-04-06  
**Versión:** 1.0  
**Objetivo:** Garantizar calidad y confiabilidad del sistema de billing antes de producción

---

## 📋 Tabla de Contenidos

1. [Casos de Prueba Funcionales](#casos-de-prueba-funcionales)
2. [Casos de Prueba de Webhooks](#casos-de-prueba-de-webhooks)
3. [Casos de Prueba de Seguridad](#casos-de-prueba-de-seguridad)
4. [Casos de Prueba de UX](#casos-de-prueba-de-ux)
5. [Casos de Prueba del Bot](#casos-de-prueba-del-bot)

---

## 1. Casos de Prueba Funcionales

### **1.1 Autenticación con Discord**

#### **TC-AUTH-001: Login con Discord Exitoso**
```yaml
Precondiciones:
  - Usuario no autenticado
  - Discord OAuth configurado correctamente

Pasos:
  1. Navegar a /pricing
  2. Click en "Sign in with Discord"
  3. Autorizar aplicación en Discord
  4. Redirigir a /pricing

Resultado Esperado:
  - Usuario autenticado
  - Session token almacenado
  - Nombre de usuario visible en UI
  - Guilds cargados automáticamente

Criterios de Aceptación:
  - ✅ Redirect a Discord OAuth
  - ✅ Callback procesa correctamente
  - ✅ Session creada en Supabase
  - ✅ UI actualizada con estado autenticado
```

#### **TC-AUTH-002: Login Cancelado**
```yaml
Precondiciones:
  - Usuario no autenticado

Pasos:
  1. Click en "Sign in with Discord"
  2. Cancelar autorización en Discord

Resultado Esperado:
  - Usuario permanece no autenticado
  - Mensaje: "Login cancelled"
  - Puede intentar de nuevo

Criterios de Aceptación:
  - ✅ No se crea session
  - ✅ UI muestra estado no autenticado
  - ✅ No hay errores en consola
```

#### **TC-AUTH-003: Session Expirada**
```yaml
Precondiciones:
  - Usuario autenticado
  - Session expirada (>1 hora)

Pasos:
  1. Intentar crear checkout
  2. Verificar respuesta

Resultado Esperado:
  - Error: "Session expired"
  - Prompt para re-autenticar
  - Redirect a login

Criterios de Aceptación:
  - ✅ Detecta session expirada
  - ✅ Mensaje claro al usuario
  - ✅ No permite operaciones sin auth
```

---

### **1.2 Obtener Guilds Administrables**

#### **TC-GUILD-001: Usuario con Guilds Administrables**
```yaml
Precondiciones:
  - Usuario autenticado
  - Usuario tiene ≥1 guild con MANAGE_GUILD

Pasos:
  1. Cargar /pricing
  2. Seleccionar plan premium
  3. Verificar guild selector

Resultado Esperado:
  - Lista de guilds mostrada
  - Solo guilds con MANAGE_GUILD
  - Iconos de guild cargados
  - Premium status visible

Criterios de Aceptación:
  - ✅ Fetch guilds exitoso
  - ✅ Filtrado correcto de permisos
  - ✅ UI muestra guilds correctamente
  - ✅ Premium badges visibles
```

#### **TC-GUILD-002: Usuario sin Guilds Administrables**
```yaml
Precondiciones:
  - Usuario autenticado
  - Usuario no tiene guilds con MANAGE_GUILD

Pasos:
  1. Seleccionar plan premium
  2. Verificar guild selector

Resultado Esperado:
  - Mensaje: "No servers found where you have admin permissions"
  - Link a documentación
  - Sugerencia de invitar bot

Criterios de Aceptación:
  - ✅ Mensaje claro y útil
  - ✅ No muestra lista vacía
  - ✅ Ofrece solución al usuario
```

#### **TC-GUILD-003: Guild con Premium Existente**
```yaml
Precondiciones:
  - Usuario autenticado
  - Guild ya tiene premium activo

Pasos:
  1. Seleccionar plan premium
  2. Ver guild en selector

Resultado Esperado:
  - Guild visible pero deshabilitado
  - Badge "Premium Active"
  - Plan actual mostrado
  - No permite selección

Criterios de Aceptación:
  - ✅ Guild marcado como premium
  - ✅ Información de plan visible
  - ✅ No permite compra duplicada
```

---

### **1.3 Crear Checkout - Monthly**

#### **TC-CHECKOUT-MONTHLY-001: Checkout Exitoso**
```yaml
Precondiciones:
  - Usuario autenticado
  - Guild sin premium
  - Plan: pro_monthly

Pasos:
  1. Seleccionar "Pro Monthly"
  2. Seleccionar guild
  3. Click "Proceed to Checkout"
  4. Verificar redirect

Resultado Esperado:
  - Checkout creado en backend
  - Redirect a Stripe
  - Custom data incluye guild_id y plan_key
  - Variant ID correcto

Criterios de Aceptación:
  - ✅ POST /billing-create-checkout exitoso
  - ✅ Response contiene checkout_url
  - ✅ Redirect automático
  - ✅ Custom data correcto
```

#### **TC-CHECKOUT-MONTHLY-002: Guild Ya Tiene Premium**
```yaml
Precondiciones:
  - Usuario autenticado
  - Guild ya tiene premium

Pasos:
  1. Intentar crear checkout para guild con premium

Resultado Esperado:
  - Error: "This guild already has premium"
  - No se crea checkout
  - Sugerencia de cancelar primero

Criterios de Aceptación:
  - ✅ Validación en backend
  - ✅ Error 400 con mensaje claro
  - ✅ No se cobra al usuario
```

---

### **1.4 Crear Checkout - Yearly**

#### **TC-CHECKOUT-YEARLY-001: Checkout Exitoso**
```yaml
Precondiciones:
  - Usuario autenticado
  - Guild sin premium
  - Plan: pro_yearly

Pasos:
  1. Seleccionar "Pro Yearly"
  2. Seleccionar guild
  3. Click "Proceed to Checkout"

Resultado Esperado:
  - Checkout creado con variant yearly
  - Precio: $99.99
  - Custom data correcto

Criterios de Aceptación:
  - ✅ Variant ID de yearly
  - ✅ Precio correcto
  - ✅ Redirect exitoso
```

---

### **1.5 Crear Checkout - Lifetime**

#### **TC-CHECKOUT-LIFETIME-001: Checkout Exitoso**
```yaml
Precondiciones:
  - Usuario autenticado
  - Guild sin premium
  - Plan: lifetime

Pasos:
  1. Seleccionar "Lifetime"
  2. Seleccionar guild
  3. Click "Proceed to Checkout"

Resultado Esperado:
  - Checkout creado con variant lifetime
  - Precio: $299.99
  - billing_type: one_time
  - kind: premium_lifetime

Criterios de Aceptación:
  - ✅ Variant ID de lifetime
  - ✅ One-time payment
  - ✅ Custom data incluye lifetime flag
```

#### **TC-CHECKOUT-LIFETIME-002: Upgrade de Monthly a Lifetime**
```yaml
Precondiciones:
  - Guild tiene pro_monthly activo

Pasos:
  1. Comprar lifetime para mismo guild

Resultado Esperado:
  - Checkout creado
  - Webhook cancela monthly automáticamente
  - Lifetime activa premium
  - Monthly queda superseded

Criterios de Aceptación:
  - ✅ Lifetime reemplaza monthly
  - ✅ Monthly cancelado en Stripe
  - ✅ Solo 1 suscripción activa
```

---

### **1.6 Crear Checkout - Donation**

#### **TC-CHECKOUT-DONATE-001: Donation con Usuario Autenticado**
```yaml
Precondiciones:
  - Usuario autenticado

Pasos:
  1. Click "Make a Donation"
  2. Verificar checkout

Resultado Esperado:
  - Checkout creado sin guild_id
  - Custom data incluye discord_user_id
  - Redirect a Stripe

Criterios de Aceptación:
  - ✅ guild_id = null
  - ✅ discord_user_id presente
  - ✅ plan_key = 'donate'
```

#### **TC-CHECKOUT-DONATE-002: Donation Anónima**
```yaml
Precondiciones:
  - Usuario NO autenticado

Pasos:
  1. Click "Make a Donation"
  2. Verificar checkout

Resultado Esperado:
  - Checkout creado sin guild_id ni user_id
  - Donation anónima
  - Redirect exitoso

Criterios de Aceptación:
  - ✅ guild_id = null
  - ✅ discord_user_id = null
  - ✅ Permite donation sin login
```

---

## 2. Casos de Prueba de Webhooks

### **2.1 Webhook Válido Activa Premium**

#### **TC-WEBHOOK-001: subscription_created (Monthly)**
```yaml
Precondiciones:
  - Webhook signature válida
  - Event: subscription_created
  - Plan: pro_monthly

Pasos:
  1. Enviar webhook de Stripe
  2. Verificar procesamiento

Resultado Esperado:
  - Guild subscription creada
  - premium_enabled = true
  - status = active
  - renews_at establecido
  - Purchase record creado

Criterios de Aceptación:
  - ✅ Signature verificada
  - ✅ Event procesado
  - ✅ DB actualizada correctamente
  - ✅ Idempotencia garantizada
```

#### **TC-WEBHOOK-002: order_created (Lifetime)**
```yaml
Precondiciones:
  - Webhook signature válida
  - Event: order_created
  - Plan: lifetime

Pasos:
  1. Enviar webhook
  2. Verificar procesamiento

Resultado Esperado:
  - Guild subscription creada
  - premium_enabled = true
  - lifetime = true
  - renews_at = null
  - ends_at = null

Criterios de Aceptación:
  - ✅ Lifetime flag correcto
  - ✅ No renewal dates
  - ✅ Premium activado indefinidamente
```

#### **TC-WEBHOOK-003: order_created (Donation)**
```yaml
Precondiciones:
  - Webhook signature válida
  - Event: order_created
  - Plan: donate

Pasos:
  1. Enviar webhook
  2. Verificar procesamiento

Resultado Esperado:
  - Donation record creado
  - Purchase record creado
  - NO guild_subscription creada
  - Premium NO activado

Criterios de Aceptación:
  - ✅ Donation registrada
  - ✅ Premium no activado
  - ✅ Usuario asociado si disponible
```

---

### **2.2 Webhook Duplicado No Duplica Efectos**

#### **TC-WEBHOOK-IDEMPOTENCY-001: Mismo Event ID**
```yaml
Precondiciones:
  - Webhook ya procesado
  - Mismo event_id

Pasos:
  1. Enviar webhook por segunda vez
  2. Verificar respuesta

Resultado Esperado:
  - Webhook detectado como duplicado
  - No se procesa nuevamente
  - Response: 200 OK (idempotent)
  - No cambios en DB

Criterios de Aceptación:
  - ✅ event_hash único detectado
  - ✅ No duplicación de premium
  - ✅ Log indica "already processed"
```

#### **TC-WEBHOOK-IDEMPOTENCY-002: Retry de Stripe**
```yaml
Precondiciones:
  - Webhook procesado exitosamente
  - Stripe reintenta por timeout

Pasos:
  1. Procesar webhook
  2. Recibir retry del mismo evento

Resultado Esperado:
  - Segundo intento ignorado
  - Response 200 OK
  - No efectos secundarios

Criterios de Aceptación:
  - ✅ Idempotencia garantizada
  - ✅ No errores en logs
  - ✅ DB sin cambios duplicados
```

---

### **2.3 Cancelación No Apaga Premium Antes de Tiempo**

#### **TC-WEBHOOK-CANCEL-001: subscription_cancelled con Grace Period**
```yaml
Precondiciones:
  - Subscription activa (pro_yearly)
  - Quedan 200 días de periodo

Pasos:
  1. Usuario cancela subscription
  2. Webhook subscription_cancelled recibido
  3. Verificar estado

Resultado Esperado:
  - status = cancelled
  - cancel_at_period_end = true
  - ends_at = fecha futura (200 días)
  - premium_enabled = true (aún activo)

Criterios de Aceptación:
  - ✅ Premium sigue activo
  - ✅ Grace period respetado
  - ✅ ends_at correctamente establecido
```

#### **TC-WEBHOOK-CANCEL-002: Premium Expira al Final del Periodo**
```yaml
Precondiciones:
  - Subscription cancelada
  - ends_at en el pasado

Pasos:
  1. Ejecutar cron de expiración
  2. Verificar estado

Resultado Esperado:
  - status = expired
  - premium_enabled = false
  - Bot bloquea comandos premium

Criterios de Aceptación:
  - ✅ Premium desactivado
  - ✅ Status actualizado
  - ✅ Bot refleja cambio
```

---

### **2.4 Expiración Sí Apaga Premium**

#### **TC-WEBHOOK-EXPIRE-001: subscription_expired**
```yaml
Precondiciones:
  - Subscription activa
  - Payment failed y grace period terminado

Pasos:
  1. Webhook subscription_expired recibido
  2. Verificar estado

Resultado Esperado:
  - status = expired
  - premium_enabled = false
  - Bot bloquea comandos premium inmediatamente

Criterios de Aceptación:
  - ✅ Premium desactivado inmediatamente
  - ✅ Cache invalidado
  - ✅ Bot actualizado
```

---

### **2.5 Reembolso de Lifetime**

#### **TC-WEBHOOK-REFUND-001: order_refunded (Lifetime)**
```yaml
Precondiciones:
  - Lifetime purchase activa
  - Usuario solicita reembolso

Pasos:
  1. Webhook order_refunded recibido
  2. Verificar estado

Resultado Esperado:
  - status = expired
  - premium_enabled = false
  - refunded_at establecido
  - Purchase status = refunded

Criterios de Aceptación:
  - ✅ Premium revocado inmediatamente
  - ✅ Refund registrado
  - ✅ Bot bloquea comandos
```

---

**Continúa en TESTING_QA_PLAN_PART2.md**

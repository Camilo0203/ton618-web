# Plan de Testing y QA - Sistema de Monetización (Parte 2)
## Casos de Seguridad, UX, Bot y Checklist Manual

---

## 3. Casos de Prueba de Seguridad

### **3.1 Validación de Webhook Signature**

#### **TC-SEC-WEBHOOK-001: Signature Inválida**
```yaml
Precondiciones:
  - Webhook con signature incorrecta

Pasos:
  1. Enviar webhook con signature falsa
  2. Verificar respuesta

Resultado Esperado:
  - Error: 401 Unauthorized
  - Webhook rechazado
  - No se procesa evento
  - Log de intento malicioso

Criterios de Aceptación:
  - ✅ Signature verificada
  - ✅ Webhook rechazado
  - ✅ No cambios en DB
```

#### **TC-SEC-WEBHOOK-002: Sin Signature Header**
```yaml
Precondiciones:
  - Webhook sin header X-Signature

Pasos:
  1. Enviar webhook sin signature
  2. Verificar respuesta

Resultado Esperado:
  - Error: 401 Unauthorized
  - Mensaje: "Missing signature"

Criterios de Aceptación:
  - ✅ Header requerido
  - ✅ Webhook rechazado
```

---

### **3.2 Validación de Bot API Key**

#### **TC-SEC-BOT-001: Bot API Key Inválida**
```yaml
Precondiciones:
  - Bot intenta consultar premium status
  - API key incorrecta

Pasos:
  1. GET /billing-guild-status con API key falsa
  2. Verificar respuesta

Resultado Esperado:
  - Error: 401 Unauthorized
  - No se retorna información

Criterios de Aceptación:
  - ✅ API key validada
  - ✅ Acceso denegado
```

#### **TC-SEC-BOT-002: Sin Bot API Key**
```yaml
Precondiciones:
  - Request sin header X-Bot-Api-Key

Pasos:
  1. GET /billing-guild-status sin header
  2. Verificar respuesta

Resultado Esperado:
  - Error: 401 Unauthorized
  - Mensaje: "Missing API key"

Criterios de Aceptación:
  - ✅ Header requerido
  - ✅ Acceso denegado
```

---

### **3.3 Validación de Permisos de Guild**

#### **TC-SEC-GUILD-001: Usuario sin MANAGE_GUILD**
```yaml
Precondiciones:
  - Usuario autenticado
  - Usuario NO tiene MANAGE_GUILD en guild

Pasos:
  1. Intentar crear checkout para guild
  2. Verificar respuesta

Resultado Esperado:
  - Error: 403 Forbidden
  - Mensaje: "You don't have permission to manage this guild"

Criterios de Aceptación:
  - ✅ Permisos verificados en backend
  - ✅ Checkout no creado
  - ✅ Usuario no puede comprar para guild ajeno
```

#### **TC-SEC-GUILD-002: Guild ID Manipulado**
```yaml
Precondiciones:
  - Usuario autenticado
  - Usuario intenta modificar guild_id en request

Pasos:
  1. Modificar guild_id en POST body
  2. Enviar request

Resultado Esperado:
  - Backend valida permisos
  - Error si no tiene acceso
  - No se crea checkout

Criterios de Aceptación:
  - ✅ Validación server-side
  - ✅ No confía en frontend
```

---

### **3.4 SQL Injection y XSS**

#### **TC-SEC-INJECTION-001: SQL Injection en Guild ID**
```yaml
Precondiciones:
  - Intento de SQL injection

Pasos:
  1. Enviar guild_id = "123'; DROP TABLE guilds;--"
  2. Verificar respuesta

Resultado Esperado:
  - Input sanitizado
  - Query parametrizada
  - No ejecución de SQL malicioso

Criterios de Aceptación:
  - ✅ Prepared statements usados
  - ✅ Input validado
  - ✅ No vulnerabilidad
```

#### **TC-SEC-XSS-001: XSS en Guild Name**
```yaml
Precondiciones:
  - Guild name contiene script tag

Pasos:
  1. Mostrar guild name en UI
  2. Verificar rendering

Resultado Esperado:
  - Script tag escapado
  - No ejecución de JS
  - Texto mostrado como string

Criterios de Aceptación:
  - ✅ Output escapado
  - ✅ React previene XSS
  - ✅ No ejecución de código
```

---

## 4. Casos de Prueba de UX

### **4.1 Loading States**

#### **TC-UX-LOADING-001: Fetch Guilds Loading**
```yaml
Precondiciones:
  - Usuario autenticado
  - Guilds aún cargando

Pasos:
  1. Seleccionar plan
  2. Observar guild selector

Resultado Esperado:
  - Skeleton loaders mostrados
  - Mensaje: "Loading your servers..."
  - No error visible

Criterios de Aceptación:
  - ✅ Loading state visible
  - ✅ UI no bloqueada
  - ✅ Feedback claro al usuario
```

#### **TC-UX-LOADING-002: Creating Checkout Loading**
```yaml
Precondiciones:
  - Usuario seleccionó plan y guild

Pasos:
  1. Click "Proceed to Checkout"
  2. Observar botón

Resultado Esperado:
  - Botón muestra "Creating Checkout..."
  - Spinner visible
  - Botón deshabilitado
  - No permite doble-click

Criterios de Aceptación:
  - ✅ Loading state en botón
  - ✅ Previene múltiples requests
  - ✅ Feedback visual claro
```

---

### **4.2 Error States**

#### **TC-UX-ERROR-001: Fetch Guilds Failed**
```yaml
Precondiciones:
  - Backend no disponible

Pasos:
  1. Intentar cargar guilds
  2. Observar UI

Resultado Esperado:
  - Mensaje de error claro
  - Botón "Try Again"
  - No crash de aplicación

Criterios de Aceptación:
  - ✅ Error manejado gracefully
  - ✅ Usuario puede reintentar
  - ✅ Mensaje útil
```

#### **TC-UX-ERROR-002: Checkout Failed**
```yaml
Precondiciones:
  - Error al crear checkout

Pasos:
  1. Intentar crear checkout
  2. Observar respuesta

Resultado Esperado:
  - Toast notification con error
  - Mensaje específico del error
  - Usuario puede reintentar
  - Estado reseteado

Criterios de Aceptación:
  - ✅ Error mostrado claramente
  - ✅ UI no queda en estado roto
  - ✅ Puede reintentar
```

---

### **4.3 Success States**

#### **TC-UX-SUCCESS-001: Checkout Creado**
```yaml
Precondiciones:
  - Checkout creado exitosamente

Pasos:
  1. Crear checkout
  2. Observar redirect

Resultado Esperado:
  - Redirect automático a Stripe
  - No delay perceptible
  - URL correcta

Criterios de Aceptación:
  - ✅ Redirect inmediato
  - ✅ URL válida
  - ✅ Custom data incluida
```

#### **TC-UX-SUCCESS-002: Payment Success Page**
```yaml
Precondiciones:
  - Usuario completó pago

Pasos:
  1. Redirect a /billing/success
  2. Observar página

Resultado Esperado:
  - Mensaje de éxito claro
  - Próximos pasos listados
  - Botón "Go to Dashboard"
  - Información de activación

Criterios de Aceptación:
  - ✅ Página de éxito clara
  - ✅ Información útil
  - ✅ CTAs claros
```

---

### **4.4 Mobile UX**

#### **TC-UX-MOBILE-001: Pricing Cards en Mobile**
```yaml
Precondiciones:
  - Viewport: 375px (iPhone SE)

Pasos:
  1. Cargar /pricing
  2. Observar layout

Resultado Esperado:
  - Cards stack verticalmente
  - Texto legible
  - Botones accesibles (44px min)
  - No scroll horizontal

Criterios de Aceptación:
  - ✅ Responsive design
  - ✅ Touch targets adecuados
  - ✅ Legibilidad mantenida
```

#### **TC-UX-MOBILE-002: Guild Selector en Mobile**
```yaml
Precondiciones:
  - Viewport mobile
  - Guild selector abierto

Pasos:
  1. Seleccionar plan
  2. Ver guild selector

Resultado Esperado:
  - Modal full-screen
  - Guilds fáciles de seleccionar
  - Scroll suave
  - Botón "Proceed" visible

Criterios de Aceptación:
  - ✅ UX optimizada para mobile
  - ✅ Fácil de usar con pulgar
  - ✅ No elementos cortados
```

---

## 5. Casos de Prueba del Bot

### **5.1 Bloqueo de Comandos Premium**

#### **TC-BOT-BLOCK-001: Comando Premium sin Entitlement**
```yaml
Precondiciones:
  - Guild sin premium
  - Usuario ejecuta comando premium

Pasos:
  1. /analytics (comando premium)
  2. Verificar respuesta

Resultado Esperado:
  - Comando bloqueado
  - Embed con mensaje de upgrade
  - Link a /pricing
  - Lista de beneficios premium

Criterios de Aceptación:
  - ✅ Comando no ejecutado
  - ✅ Mensaje claro y útil
  - ✅ CTA para upgrade
```

#### **TC-BOT-BLOCK-002: Límite de Free Plan Alcanzado**
```yaml
Precondiciones:
  - Guild free
  - 5/5 custom commands creados

Pasos:
  1. Intentar crear comando #6
  2. Verificar respuesta

Resultado Esperado:
  - Error: "Limit reached"
  - Mensaje: "Free plan allows 5 commands"
  - Sugerencia de upgrade
  - Link a pricing

Criterios de Aceptación:
  - ✅ Límite enforced
  - ✅ Mensaje educativo
  - ✅ Path claro para upgrade
```

---

### **5.2 Permitir Comandos Premium**

#### **TC-BOT-ALLOW-001: Comando Premium con Entitlement**
```yaml
Precondiciones:
  - Guild tiene pro_monthly activo
  - Usuario ejecuta comando premium

Pasos:
  1. /analytics
  2. Verificar respuesta

Resultado Esperado:
  - Comando ejecutado
  - Datos mostrados
  - Sin restricciones

Criterios de Aceptación:
  - ✅ Comando funciona
  - ✅ Premium verificado
  - ✅ Features disponibles
```

#### **TC-BOT-ALLOW-002: Límite Premium Respetado**
```yaml
Precondiciones:
  - Guild tiene pro_monthly
  - Límite: 50 custom commands

Pasos:
  1. Crear comando #50
  2. Intentar crear comando #51

Resultado Esperado:
  - Comando #50 creado exitosamente
  - Comando #51 bloqueado
  - Mensaje: "Pro Monthly allows 50 commands"
  - Sugerencia de upgrade a Lifetime

Criterios de Aceptación:
  - ✅ Límite correcto aplicado
  - ✅ Mensaje específico al tier
  - ✅ Sugerencia de upgrade
```

---

### **5.3 Comando /premium**

#### **TC-BOT-PREMIUM-001: Guild sin Premium**
```yaml
Precondiciones:
  - Guild free

Pasos:
  1. /premium
  2. Verificar embed

Resultado Esperado:
  - Título: "Free Plan"
  - Límites mostrados
  - Link a upgrade
  - Beneficios de premium

Criterios de Aceptación:
  - ✅ Información clara
  - ✅ CTA visible
  - ✅ Diseño atractivo
```

#### **TC-BOT-PREMIUM-002: Guild con Pro Monthly**
```yaml
Precondiciones:
  - Guild tiene pro_monthly activo

Pasos:
  1. /premium
  2. Verificar embed

Resultado Esperado:
  - Título: "Premium Active"
  - Plan: "Pro Monthly"
  - Renews: fecha de renovación
  - Features listadas
  - Link a manage subscription

Criterios de Aceptación:
  - ✅ Status correcto
  - ✅ Fecha de renovación visible
  - ✅ Link a customer portal
```

#### **TC-BOT-PREMIUM-003: Guild con Lifetime**
```yaml
Precondiciones:
  - Guild tiene lifetime activo

Pasos:
  1. /premium
  2. Verificar embed

Resultado Esperado:
  - Título: "Premium Active"
  - Plan: "Lifetime"
  - Status: "∞ Lifetime Access"
  - No fecha de expiración
  - Features listadas

Criterios de Aceptación:
  - ✅ Lifetime indicado claramente
  - ✅ No renewal date
  - ✅ Badge especial
```

---

### **5.4 Cache y Fallback**

#### **TC-BOT-CACHE-001: Cache Hit**
```yaml
Precondiciones:
  - Premium status en cache (< 5min)

Pasos:
  1. Ejecutar comando premium
  2. Verificar logs

Resultado Esperado:
  - Cache usado
  - No request a backend
  - Respuesta rápida
  - Log: "Cache hit"

Criterios de Aceptación:
  - ✅ Cache funciona
  - ✅ Performance optimizada
  - ✅ No requests innecesarios
```

#### **TC-BOT-CACHE-002: Cache Miss**
```yaml
Precondiciones:
  - Premium status no en cache

Pasos:
  1. Ejecutar comando premium
  2. Verificar logs

Resultado Esperado:
  - Request a backend
  - Status cacheado
  - Respuesta correcta
  - Log: "Cache miss, fetching..."

Criterios de Aceptación:
  - ✅ Fetch exitoso
  - ✅ Cache actualizado
  - ✅ TTL establecido
```

#### **TC-BOT-FALLBACK-001: Backend No Disponible**
```yaml
Precondiciones:
  - Backend caído
  - Cache expirado pero disponible (< 1h)

Pasos:
  1. Ejecutar comando premium
  2. Verificar respuesta

Resultado Esperado:
  - Usa cache expirado como fallback
  - Comando funciona
  - Log: "Using stale cache (API unavailable)"
  - Warning en logs

Criterios de Aceptación:
  - ✅ Fallback funciona
  - ✅ Servicio degradado pero funcional
  - ✅ Logs claros
```

#### **TC-BOT-FALLBACK-002: Backend y Cache No Disponibles**
```yaml
Precondiciones:
  - Backend caído
  - No cache disponible

Pasos:
  1. Ejecutar comando premium
  2. Verificar respuesta

Resultado Esperado:
  - Asume free plan
  - Comando bloqueado si es premium
  - Mensaje de error temporal
  - Log de error

Criterios de Aceptación:
  - ✅ Fail-safe a free
  - ✅ No crash del bot
  - ✅ Mensaje útil al usuario
```

---

## 6. Checklist Manual de QA

### **6.1 Pre-Producción Checklist**

```markdown
## Configuración

- [ ] Variables de entorno configuradas en producción
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] BOT_API_KEY (mismo en bot y backend)
  - [ ] STRIPE_SECRET_KEY
  - [ ] STRIPE_WEBHOOK_SECRET
  - [ ] STRIPE_PUBLISHABLE_KEY
  - [ ] Variant IDs (monthly, yearly, lifetime, donate)

- [ ] Discord OAuth configurado
  - [ ] Client ID y Secret
  - [ ] Redirect URIs correctas
  - [ ] Scopes: identify, email, guilds

- [ ] Stripe configurado
  - [ ] Webhook URL configurada
  - [ ] Success URL: /billing/success
  - [ ] Cancel URL: /billing/cancel
  - [ ] Test mode desactivado

- [ ] Base de datos
  - [ ] Migraciones ejecutadas
  - [ ] Índices creados
  - [ ] RLS policies activas
  - [ ] Functions y triggers funcionando

## Flujos Críticos

- [ ] Login con Discord funciona
- [ ] Logout funciona
- [ ] Fetch guilds funciona
- [ ] Crear checkout monthly funciona
- [ ] Crear checkout yearly funciona
- [ ] Crear checkout lifetime funciona
- [ ] Crear checkout donation funciona
- [ ] Redirect a Stripe funciona
- [ ] Success page se muestra correctamente
- [ ] Cancel page se muestra correctamente

## Webhooks

- [ ] Webhook signature verificada
- [ ] subscription_created activa premium
- [ ] subscription_updated actualiza datos
- [ ] subscription_cancelled mantiene premium hasta ends_at
- [ ] subscription_expired desactiva premium
- [ ] order_created (lifetime) activa premium indefinido
- [ ] order_created (donate) NO activa premium
- [ ] order_refunded revoca premium
- [ ] Idempotencia funciona (duplicados ignorados)

## Bot

- [ ] Bot conecta a MongoDB
- [ ] Premium service inicializa
- [ ] /premium muestra status correcto
- [ ] Comandos premium bloqueados sin entitlement
- [ ] Comandos premium permitidos con entitlement
- [ ] Límites de free plan enforced
- [ ] Límites de pro plan enforced
- [ ] Cache funciona
- [ ] Fallback funciona cuando backend falla

## Seguridad

- [ ] Webhook signature validada
- [ ] Bot API key validada
- [ ] Permisos de guild validados
- [ ] SQL injection prevenido
- [ ] XSS prevenido
- [ ] CORS configurado correctamente
- [ ] Rate limiting activo
- [ ] Logs no exponen secretos

## UX

- [ ] Loading states visibles
- [ ] Error states manejados
- [ ] Success states claros
- [ ] Mobile responsive
- [ ] Accesibilidad básica
- [ ] i18n funciona (EN/ES)
- [ ] Animaciones suaves
- [ ] No errores en consola

## Performance

- [ ] Tiempo de carga < 3s
- [ ] Cache reduce requests
- [ ] Imágenes optimizadas
- [ ] Bundle size razonable
- [ ] No memory leaks
- [ ] DB queries optimizadas

## Monitoreo

- [ ] Logs estructurados activos
- [ ] Error tracking configurado (Sentry)
- [ ] Métricas de negocio tracked
- [ ] Alertas configuradas
- [ ] Dashboard de monitoreo funcional
```

---

### **6.2 Checklist de Testing Manual**

```markdown
## Autenticación

- [ ] Login con Discord exitoso
- [ ] Login cancelado manejado
- [ ] Logout funciona
- [ ] Session expirada detectada
- [ ] Re-autenticación funciona

## Guilds

- [ ] Usuario con guilds ve lista
- [ ] Usuario sin guilds ve mensaje
- [ ] Guild con premium marcado correctamente
- [ ] Iconos de guild cargan
- [ ] Premium badges visibles

## Checkout - Monthly

- [ ] Seleccionar plan funciona
- [ ] Seleccionar guild funciona
- [ ] Botón "Proceed" habilitado solo si guild seleccionado
- [ ] Checkout creado exitosamente
- [ ] Redirect a Stripe funciona
- [ ] Custom data correcto

## Checkout - Yearly

- [ ] Badge "BEST VALUE" visible
- [ ] Precio correcto ($99.99)
- [ ] Checkout funciona
- [ ] Variant ID correcto

## Checkout - Lifetime

- [ ] Badge "UNLIMITED" visible
- [ ] Precio correcto ($299.99)
- [ ] Checkout funciona
- [ ] One-time payment indicado

## Checkout - Donation

- [ ] Sección separada visible
- [ ] Disclaimer "No premium" claro
- [ ] Funciona sin login (anónimo)
- [ ] Funciona con login (asociado)
- [ ] No requiere guild

## Success/Cancel Pages

- [ ] Success page muestra después de pago
- [ ] Mensaje de éxito claro
- [ ] Próximos pasos listados
- [ ] Botón "Go to Dashboard" funciona
- [ ] Cancel page muestra si cancelado
- [ ] Botón "Try Again" funciona

## Bot - Premium Check

- [ ] /premium muestra free plan correctamente
- [ ] /premium muestra pro monthly correctamente
- [ ] /premium muestra pro yearly correctamente
- [ ] /premium muestra lifetime correctamente
- [ ] Renewal date visible para subscriptions
- [ ] "Lifetime Access" visible para lifetime

## Bot - Command Blocking

- [ ] Comando premium bloqueado sin entitlement
- [ ] Mensaje de upgrade claro
- [ ] Link a pricing funciona
- [ ] Límite free enforced (5 commands)
- [ ] Límite pro enforced (50 commands)

## Bot - Command Allowing

- [ ] Comando premium funciona con entitlement
- [ ] Features premium disponibles
- [ ] Límites correctos aplicados

## Mobile

- [ ] Pricing cards stack verticalmente
- [ ] Guild selector usable
- [ ] Botones accesibles
- [ ] No scroll horizontal
- [ ] Touch targets adecuados

## Edge Cases

- [ ] Guild ya con premium no permite compra
- [ ] Usuario sin MANAGE_GUILD no puede comprar
- [ ] Backend caído muestra error claro
- [ ] Cache expirado usa fallback
- [ ] Webhook duplicado ignorado
- [ ] Cancelación mantiene premium hasta ends_at
- [ ] Expiración desactiva premium
- [ ] Reembolso revoca premium
```

---

**Continúa en TESTING_QA_PLAN_PART3.md**

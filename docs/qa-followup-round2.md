# QA Follow-up Round 2

## Resumen

Se hizo una pasada quirúrgica sobre `ton618-web` enfocada en los hallazgos interactivos confirmados por QA, sin cambiar rutas ni rehacer la arquitectura. Los cambios quedaron contenidos en navbar/selector de idioma, top-level auth/dashboard, i18n y degradación de live stats.

## Bugs confirmados por código

### 1. Hamburger menu no abría en mobile/tablet

- Causa real confirmada en repo: `Navbar` operaba en breakpoint `lg`, pero `LanguageSelector` mezclaba su propia lógica responsive con breakpoint `sm`.
- Efecto: entre `640px` y `1023px` el navbar seguía en modo móvil, pero el selector incrustado dentro de esa barra ya mutaba a dropdown desktop. Eso dejaba una superficie interactiva incoherente en la misma fila del hamburger.
- También había fragilidad de layout: el panel móvil se renderizaba como overlay absoluto fuera del contenedor visual del navbar.

### 2. Language selector no respondía de forma consistente

- Causa real confirmada en repo: el mismo `LanguageSelector` se reutilizaba en dos contextos distintos con reglas responsive internas no alineadas con el navbar.
- Causa adicional confirmada en repo: `i18n` no estaba restringido explícitamente a `en`/`es` con `load: 'languageOnly'`, lo que dejaba más margen para estados no normalizados (`es-ES`, `en-US`) entre landing, dashboard y callback.

### 3. Inconsistencia de idioma entre landing, dashboard y auth/callback

- Causa real confirmada en repo: el callback ya estaba mayormente localizado, pero `DashboardPage` todavía exponía estados top-level en español hardcodeado.
- Eso hacía que landing y callback pudieran reaccionar al cambio de idioma mientras el shell de acceso/carga/error del dashboard seguía fijo en español.

### 4. Error de consola en stats fetch

- Confirmación: había un problema del repo y uno dependiente del entorno.
- Del repo: `useBotStats` no envolvía el fetch en `try/catch` y reintentaba con `setInterval` fijo, así que un fallo de red/transporte podía repetirse de forma ruidosa.
- Del entorno/configuración: `ERR_CONNECTION_CLOSED` apunta a que el runtime no logró alcanzar Supabase o a que la conexión se cerró externamente. Eso no se puede atribuir solo al frontend.

## Cambios aplicados

- `src/components/Navbar.tsx`
  - Se separó explícitamente el selector de idioma desktop y mobile.
  - El panel móvil ahora se monta dentro del contenedor del navbar móvil, en vez de depender de posicionamiento absoluto externo.
- `src/components/LanguageSelector.tsx`
  - Se agregó `mode="desktop" | "mobile"` para evitar que el componente decida solo con breakpoints distintos al navbar.
  - Se cerró el dropdown al cambiar idioma y se movieron labels accesibles a i18n.
- `src/i18n.ts`
  - Se añadieron claves para selector de idioma, estados top-level del dashboard y degradación contextual de stats.
  - Se normalizó la carga con `supportedLngs`, `nonExplicitSupportedLngs`, `load: 'languageOnly'` y `cleanCode`.
- `src/dashboard/DashboardPage.tsx`
  - Se movieron a i18n los estados visibles de acceso, carga de guilds, error y empty state.
- `src/dashboard/api/auth.ts`
  - Los errores visibles que pueden llegar a UI ya no quedan hardcodeados fuera de i18n.
- `src/hooks/useBotStats.ts`
  - Se agregó clasificación de error (`config`, `network`, `query`), `try/catch` y polling más conservador ante fallas.
- `src/components/LiveStats.tsx`
  - La UI ahora distingue mejor fallback por configuración vs fallback por red/entorno.

## Callback/Auth

- El success path del callback sigue mejorado pero no queda “cerrado” solo por repo.
- Esta pasada no cambió contratos de OAuth ni de `sync-discord-guilds`.
- Se mantuvo la lógica existente y solo se endurecieron mensajes/localización y la separación repo vs entorno.

## Repo vs entorno

### Bug real del repo

- Desalineación de breakpoints entre navbar y selector de idioma.
- Layout frágil del menú móvil.
- Estados visibles del dashboard fuera de i18n.
- Manejo incompleto de fallos de live stats en frontend.

### Dependiente del entorno/configuración

- `ERR_CONNECTION_CLOSED` al consultar live stats: probable red, reachability de Supabase, proxy local, antivirus/firewall o cierre de conexión aguas arriba.
- Cualquier `Invalid JWT`, sesión stale o rechazo del token por Edge Function/Supabase sigue dependiendo de persistencia local y configuración real de Auth.
- El callback success path queda mejor instrumentado desde frontend, pero requiere QA manual real con Supabase/Discord para validación final.

## Validación técnica

- `npm run typecheck`: OK
- `npm run lint`: OK
- `npm run test`: OK, 2 archivos y 16 tests
- `npm run build`: OK

## Pendiente para la siguiente QA corta

- Revalidar manualmente:
  - hamburger en `390px`, `768px` y `>=1024px`
  - cambio de idioma en landing, dashboard y `/auth/callback`
  - callback success path con login limpio
  - callback con sesión stale / `Invalid JWT`
  - LiveStats con entorno configurado y con entorno desconectado

## Estado

Listo para otra QA corta enfocada en interacción responsive, idioma y callback real.

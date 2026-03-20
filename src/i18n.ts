import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      meta: {
        title: 'TON618 | Premium Discord Bot for Moderation, Automations and Ops',
        description:
          'TON618 helps serious Discord communities automate moderation, run workflows, monitor live activity and manage everything from one premium dashboard.',
      },
      nav: {
        features: 'Capabilities',
        architecture: 'Dashboard',
        whyTon: 'Reliability',
        network: 'Live stats',
        docs: 'Docs',
        status: 'Status',
        support: 'Support',
        primaryCta: 'Invite bot',
        secondaryCta: 'Open dashboard',
        mobilePrimaryCta: 'Invite to Discord',
        mobileSecondaryCta: 'Open dashboard',
        openMenu: 'Open navigation menu',
        closeMenu: 'Close navigation menu',
        homeAria: 'Go to home',
        primaryAria: 'Primary navigation',
      },
      languageSelector: {
        triggerLabel: 'Change language',
        menuLabel: 'Language selector',
      },
      app: {
        loadingTitle: 'Loading experience',
        loadingDescription: 'Preparing the dashboard and navigation.',
      },
      landing: {
        skipToContent: 'Skip to content',
      },
      hero: {
        badge: 'Discord operations platform for serious servers',
        titleMain: 'Run Your Server',
        titleAccent: 'With Precision',
        description:
          'Moderation, automations, tickets, verification and analytics in one Discord bot built to stay fast as your community grows.',
        descriptionSub:
          'Invite TON618 in minutes, configure flows from the dashboard and keep staff aligned with live operational visibility.',
        ctaPrimary: 'Invite TON618',
        ctaSecondary: 'Open dashboard',
        ctaTertiary: 'Read docs',
        inviteUnavailable: 'Set VITE_DISCORD_CLIENT_ID to enable the invite flow.',
        proof: {
          one: 'Automations for moderation, roles and support',
          two: 'Live metrics with graceful fallback',
          three: 'Premium dashboard for operators and staff',
        },
        panelLabel: 'Why teams move fast with TON618',
        scroll: 'Scroll to explore',
        highlightsAria: 'Product highlights',
      },
      docsSection: {
        eyebrow: 'Operational resources',
        title: 'Everything Needed',
        titleAccent: 'To Evaluate And Launch',
        description:
          'TON618 does not stop at a polished landing page: it exposes value, opens the dashboard and keeps the resources a serious team expects before adopting the product.',
        cards: {
          docs: {
            title: 'Operational documentation',
            description:
              'Setup guidance, module coverage and operating notes so teams can move from installation to real usage without tribal knowledge.',
            ctaExternal: 'Open docs',
            ctaFallback: 'Review launch path',
          },
          dashboard: {
            title: 'Dashboard for staff',
            description:
              'Open configuration, tickets and operational follow-up from a panel that already degrades gracefully when a secondary source fails.',
            cta: 'Open dashboard',
          },
          support: {
            title: 'Support and trust path',
            description:
              'Support, contact and launch guidance stay visible to reduce friction during evaluation, onboarding and incident handling.',
            ctaExternal: 'Open support',
            ctaFallback: 'Go to launch CTA',
          },
        },
      },
      features: {
        tag: 'What You Can Run',
        title: 'Built For',
        titleAccent: 'Real Operations',
        description:
          'TON618 is not a novelty bot. It is a Discord control layer for communities that need repeatable workflows, fast moderation and cleaner operations as volume increases.',
        useCases: {
          moderation: 'Moderate faster with rules, logs and safer defaults.',
          onboarding: 'Automate onboarding, verification and role assignment.',
          support: 'Keep tickets, support and staff actions organized.',
        },
        items: {
          moderation: {
            title: 'Moderation That Scales',
            desc: 'Handle enforcement, role logic and moderation events without turning staff work into manual busywork.',
            status: 'STAFF READY',
          },
          autonomy: {
            title: 'Automation Flows',
            desc: 'Run welcome journeys, verification steps and recurring workflows from configurable modules instead of ad hoc commands.',
            status: 'WORKFLOWS ACTIVE',
          },
          latency: {
            title: 'Fast Response',
            desc: 'Keep commands and operational actions feeling instant with an architecture designed for high-traffic Discord environments.',
            status: 'LOW LATENCY',
          },
          security: {
            title: 'Safer By Default',
            desc: 'Protect core interactions with stable permissions, controlled surfaces and a product experience built for administrators.',
            status: 'HARDENED',
          },
          analytics: {
            title: 'Operational Visibility',
            desc: 'Read live activity, usage and uptime signals so staff can trust what is happening across the bot at a glance.',
            status: 'INSIGHT LIVE',
          },
          network: {
            title: 'Growth-Ready',
            desc: 'Designed for communities that move beyond hobby scale and need consistency across multiple staff workflows.',
            status: 'READY TO EXPAND',
          },
          modular: {
            title: 'Modular Setup',
            desc: 'Enable only the systems your server actually needs and configure them from the dashboard without losing clarity.',
            status: 'CONFIGURABLE',
          },
          comms: {
            title: 'Discord-Native UX',
            desc: 'Every interaction feels grounded in how serious Discord teams already work, from support to moderation to member onboarding.',
            status: 'PLATFORM FIT',
          },
        },
      },
      experience: {
        title: 'See The',
        titleAccent: 'Control Layer',
        subtitle:
          'A cleaner operator experience for teams that need to move quickly without losing context.',
        card1Eyebrow: 'Setup clarity',
        card1Title: 'From command chaos to guided setup',
        card1Desc:
          'Replace scattered staff knowledge with a dashboard that exposes key modules, actions and states in a way new moderators can understand quickly.',
        card2Eyebrow: 'Operator workflow',
        card2Title: 'Built for Discord product workflows',
        card2Desc:
          'Move from invite to configuration to daily operations with a single system, rather than stitching together multiple niche bots and panels.',
      },
      why: {
        tag: 'Why Teams Choose TON618',
        title: 'Reliable Where',
        titleAccent: 'It Matters',
        description:
          'Serious communities need more than flashy commands. TON618 focuses on operational trust: stable behavior, visible metrics, configurable modules and a cleaner experience for owners, moderators and support staff.',
        stats: {
          uptime: 'Reliability',
          uptimeValue: 'Live-backed',
          uptimeSub: 'Status shown on the landing',
          speed: 'Operational fit',
          speedValue: 'Built for staff teams',
          speedSub: 'From invite to daily usage',
        },
        reasons: {
          precision: {
            title: 'Clear product value',
            desc: 'The landing and dashboard now explain what TON618 actually does: moderation, automations, verification, support and live visibility.',
          },
          performance: {
            title: 'Faster team execution',
            desc: 'Reusable flows reduce moderator busywork and help staff respond with more consistency during growth or high activity windows.',
          },
          security: {
            title: 'Trust-oriented experience',
            desc: 'Live telemetry, graceful fallback states and product framing focused on stability improve confidence for administrators evaluating the bot.',
          },
          integration: {
            title: 'One system, fewer gaps',
            desc: 'Dashboard access, docs, support and status all sit in a clear path so users can move from interest to setup without friction.',
          },
        },
      },
      stats: {
        badgeOnline: 'Live data online',
        badgeLoading: 'Refreshing live data',
        badgeOffline: 'Showing fallback snapshot',
        title: 'Live',
        titleAccent: 'Confidence',
        description:
          'These numbers are pulled from live bot telemetry when available, with a verified baseline shown if the live feed is unavailable.',
        lastUpdated: 'Updated {{value}}',
        source: {
          live: 'Source: live Supabase telemetry',
          loading: 'Source: connecting to live telemetry',
          fallback: 'Source: verified fallback snapshot',
        },
        status: {
          syncing: 'Checking the latest bot telemetry now.',
          standby: 'Live telemetry is unavailable right now.',
          fallback: 'The landing keeps a stable baseline visible so trust is not lost during temporary outages.',
          fallbackWithTime: 'Most recent live sync: {{value}}',
          configFallback: 'Live telemetry is not configured in this environment.',
          networkFallback: 'Live telemetry could not be reached from this environment.',
        },
        cards: {
          clusters: { label: 'Servers', sub: 'Communities connected' },
          souls: { label: 'Members reached', sub: 'Estimated community footprint' },
          ops: { label: 'Commands executed', sub: 'Operational throughput' },
          stability: { label: 'Uptime', sub: 'Availability target' },
        },
      },
      final: {
        tag: 'Ready To Launch',
        title: 'Invite TON618',
        titleAccent: 'And Configure Fast',
        description:
          'Bring the bot into your server, open the dashboard and give your staff a cleaner way to moderate, automate and support your community.',
        cta: 'Invite the bot',
        secondaryCta: 'Open dashboard',
        docsCta: 'View docs',
        supportCta: 'Join support',
        unavailable: 'The invite URL is disabled until VITE_DISCORD_CLIENT_ID is configured.',
        nodes: {
          active: 'DISCORD-FIRST PRODUCT',
          encryption: 'LIVE METRICS READY',
          stabilized: 'GRACEFUL FALLBACKS',
        },
      },
      footer: {
        tagline:
          'Premium Discord automation for teams that care about moderation quality, operational clarity and a cleaner setup experience.',
        productTitle: 'Product',
        resourcesTitle: 'Resources',
        supportTitle: 'Support',
        govTitle: 'Legal',
        nav: {
          features: 'Capabilities',
          experience: 'Dashboard',
          why: 'Reliability',
          stats: 'Live stats',
          invite: 'Invite bot',
          dashboard: 'Open dashboard',
          docs: 'Documentation',
          status: 'Status page',
          support: 'Support server',
          github: 'GitHub',
        },
        gov: {
          terms: 'terms of service',
          privacy: 'privacy policy',
          cookies: 'cookies policy',
        },
        copyright: '© {{year}} TON618',
        stabilized: 'Discord operations product',
        commanded: 'Built by milo0dev',
        inviteCta: 'Invite TON618',
      },
      legal: {
        close: 'Close',
        core: 'Core Policy',
        update: 'Last policy review',
        status: 'Published',
        terms: {
          title: 'Terms of Service',
          content:
            'By using TON618 you agree to use the bot responsibly, comply with Discord policies and avoid abuse, spam or attempts to disrupt the service. Features, limits and availability may change as the product evolves.',
        },
        privacy: {
          title: 'Privacy Policy',
          content:
            'TON618 only processes the data required to operate bot features, moderation flows, analytics and dashboard access. We do not sell personal data. Server owners can contact support to request data review or removal where applicable.',
        },
        cookies: {
          title: 'Cookies Policy',
          content:
            'This site may use essential and analytics cookies to maintain performance, understand product usage and improve the landing and dashboard experience. Cookie behavior can be controlled from your browser settings.',
        },
      },
      dashboardAuth: {
        pageTitle: 'Auth',
        oauthLabel: 'Discord OAuth',
        pageHeading: 'Access to {{name}}',
        pageDescription:
          'We are validating the secure session and syncing server access without changing your current configuration.',
        errorEyebrow: 'Access was not completed',
        errorTitle: 'We need one action to continue.',
        retrySync: 'Retry sync',
        restartLogin: 'Restart Discord login',
        successEyebrowRedirecting: 'Finishing access',
        successEyebrowLoading: 'Access in progress',
        syncingDescription:
          'We are preparing the authenticated account so you can enter the dashboard with your manageable guilds already resolved.',
        holdingContextDescription:
          'The callback keeps your login context so you do not lose the server you wanted to open.',
        authCard: {
          missingConfigEyebrow: 'Configuration required',
          missingConfigTitle: 'Supabase connection missing',
          missingConfigDescription:
            'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Discord login, sync servers and persist bot settings.',
          protectedAccess: 'Protected access',
          cardTitle: 'Sign in to enter the control panel',
          cardDescription:
            'Use Discord to validate your session, sync manageable guilds and operate the dashboard with real permissions.',
          loadingCta: 'Connecting...',
          cta: 'Continue with Discord',
          trustLine: 'Secure encryption - Server sync - Supabase access',
          trustFooter: 'TON618 keeps the branding and official Discord OAuth flow',
        },
        state: {
          preparing: 'Preparing Discord authentication...',
          exchanging: 'Exchanging code for a secure session...',
          syncing: 'Syncing manageable servers with Supabase...',
          redirectingWithGuilds: 'Ready. Redirecting to the panel with your synced servers...',
          redirectingWithoutGuilds: 'Ready. Redirecting to the dashboard to continue with the authenticated account...',
          retryingSync: 'Retrying server sync...',
          secureAccessFailed: 'Secure access could not be completed.',
        },
        errors: {
          sessionValidationFailed: 'The current dashboard session could not be validated.',
          userLoadFailed: 'The authenticated dashboard user could not be loaded.',
          startLoginFailed: 'Discord sign-in for the dashboard could not be started.',
          signOutFailed: 'The dashboard session could not be closed.',
          restartLoginFailed: 'Discord login could not be restarted.',
          restartLoginAction: 'Could not restart login with Discord.',
          missingSessionAfterCallback:
            'There is no valid dashboard session after the callback. Start sign-in again from the dashboard.',
          missingProviderToken:
            'Discord did not return a provider token. Repeat the login to sync servers.',
          invalidSession:
            'The dashboard session is invalid or expired. Restart the login to continue.',
          callbackFailed: 'The dashboard callback could not be completed.',
          missingOauthCode: 'A valid OAuth code did not reach the callback.',
          syncMissingToken: 'A valid provider token did not arrive to sync servers.',
          syncEmptyResponse: 'The sync-discord-guilds function returned an empty response.',
          syncFailed: 'Manageable servers could not be synced with Supabase.',
          exchangeFailed: 'The OAuth code could not be exchanged with Supabase.',
          exchangeTimeout:
            'The OAuth exchange took too long ({{seconds}}s). Check the network, Supabase Auth and the redirect URL configuration.',
          syncTimeout:
            'The initial server sync took too long ({{seconds}}s). Check the sync-discord-guilds function, the network and Supabase status.',
        },
      },
      dashboard: {
        pageTitle: 'Dashboard',
        metaDescription: 'Professional dashboard to manage your Discord bot configuration, activity and analytics.',
        inbox: {
          workflow: {
            new: 'New',
            triage: 'Triage',
            waitingStaff: 'Waiting on staff',
            waitingUser: 'Waiting on user',
            escalated: 'Escalated',
            resolved: 'Resolved',
            closed: 'Closed'
          },
          filters: {
            all: 'All',
            open: 'Open',
            closed: 'Closed',
            urgent: 'Urgent',
            high: 'High',
            normal: 'Normal',
            low: 'Low',
            breached: 'Breached',
            warning: 'Warning',
            healthy: 'Healthy',
            paused: 'Paused',
            resolved: 'Resolved',
            allQueue: 'Entire queue',
            unclaimed: 'Unclaimed',
            claimed: 'Claimed',
            unassigned: 'Unassigned',
            assigned: 'Assigned',
            allCategories: 'All categories'
          },
          visibility: {
            internal: 'Internal',
            public: 'Customer',
            system: 'System'
          },
          actions: {
            claim: 'claim the ticket',
            unclaim: 'unclaim the ticket',
            assignSelf: 'assign yourself the ticket',
            unassign: 'unassign the ticket',
            setStatus: 'update the status',
            close: 'close the ticket',
            reopen: 'reopen the ticket',
            addNote: 'save the internal note',
            addTag: 'add the tag',
            removeTag: 'remove the tag',
            replyCustomer: 'send the reply',
            postMacro: 'post the macro',
            setPriority: 'update the priority',
            fallback: 'execute the action'
          }
        },
        shell: {
          brandDescription: 'Task navigation to configure, review, and operate the server.',
          activeServer: 'Active server',
          selectServer: 'Select a server',
          serverReady: 'Inventory synced and ready to finish configuration.',
          serverPending: 'You can select it now and complete the installation later.',
          serverEmpty: 'Choose a manageable server to open configuration, activity, and tickets.',
          readyBadge: 'Ready',
          pendingBadge: 'Pending',
          guildSelector: 'Guild selector',
          guildsCount: '{{count}} guilds',
          taskNavigation: 'Task Navigation',
          session: 'Session',
          syncingInventory: 'Syncing inventory...',
          panelReady: 'Panel ready to operate',
          lastHeartbeat: 'Last heartbeat {{time}}.',
          logout: 'Log out',
          skipToContent: 'Skip to dashboard content',
          openMenuAria: 'Open dashboard navigation',
          closeMenuAria: 'Close dashboard navigation',
          navAria: 'Dashboard navigation',
          headerDescription: 'Guided control center to finish configuration, detect blocks, and know exactly what is next without guessing which module to enter.',
          membersCount: '{{count}} members',
          planBadge: 'Plan {{tier}}',
          heartbeatBadge: 'Last heartbeat {{time}}',
          focusServer: 'Server in focus',
          focusReadyInfo: 'This server already has the bot and can load a full snapshot.',
          focusPendingInfo: 'This server still needs installation or a full synchronization.',
          defaultUser: 'Administrator',
          lastSync: 'Last sync {{time}}',
          bridgeHealth: 'Bridge health',
          bridgeNoDetails: 'No additional details reported by the bridge.',
          syncActivity: 'Sync activity',
          configSync: 'Config {{time}}',
          inventorySync: 'Inventory {{time}}. Queue {{pending}} pending and {{failed}} failed.',
          syncFailed: 'Re-sync could not be completed',
          reviewNeeded: 'There are changes that require review. Go back to Home to see which task needs attention before applying more changes.',
          statusBotActive: 'Bot active in server',
          statusBotMissing: 'Bot not installed',
          statusInQueue: '{{count}} in queue',
          statusFailed: '{{count}} failed',
          inviteSuffix: ' - invite',
          readySuffix: ' - ready',
          errorBoundary: {
            eyebrow: 'Module error',
            title: 'This module failed to render'
          },
          configSaveError: 'Could not register the change request.',
          sectionStatus: {
            active: 'Active',
            basic: 'Basic',
            needsAttention: 'Needs review',
            notConfigured: 'Not configured'
          }
        },
        actions: {
          retryValidation: 'Retry validation',
          restartDiscord: 'Start Discord login again',
          retryLoad: 'Retry load',
          resyncAccess: 'Re-sync access',
          goToAvailableGuild: 'Go to available server',
          retrySnapshot: 'Retry snapshot',
          resyncServer: 'Re-sync server',
          resyncNow: 'Re-sync now',
          syncingNow: 'Syncing...',
          switchAccount: 'Switch account',
        },
        inviteBot: {
          helper: 'This server does not have the bot installed yet.',
          cta: 'Invite bot to this server',
        },
        errors: {
          authValidation: 'The dashboard session could not be validated.',
          guildsLoad: 'Try syncing again or review the Supabase configuration.',
          snapshotLoad: 'Review tables, RLS policies and the bot bridge.',
        },
        states: {
          authLoading: {
            eyebrow: 'Secure access',
            title: 'Validating dashboard session',
            description: 'We are checking your Supabase session before loading servers, permissions and operational state.',
            pill: 'Checking access',
          },
          authError: {
            eyebrow: 'Access unavailable',
            title: 'We could not validate your session',
          },
          guildsLoading: {
            eyebrow: 'Initial sync',
            title: 'Loading your manageable servers',
            description: 'We are reading synced access to prepare guild selection, health state and the dashboard snapshot.',
            pill: 'Preparing shell',
          },
          guildsError: {
            eyebrow: 'Data error',
            title: 'We could not load your servers',
          },
          emptyGuilds: {
            eyebrow: 'No servers',
            title: 'We did not find manageable guilds for this account',
            description: 'Make sure you have Administrator or Manage Server permissions in Discord, then sync access again.',
          },
          invalidGuild: {
            eyebrow: 'Invalid server',
            title: 'That guild is no longer available for this session',
            description:
              'The requested server ({{guildId}}) does not appear in your current manageable guilds. Access, sync status or the shared URL may have changed.',
          },
          noSelectedGuild: {
            eyebrow: 'Selection required',
            title: 'Choose a server to continue',
            description:
              'As soon as you choose a guild, we will load applied configuration, inventory, audit trail and related analytics.',
          },
          snapshotError: {
            eyebrow: 'Module unavailable',
            title: 'We could not load this server',
          },
        },
      },
    },
  },
  es: {
    translation: {
      meta: {
        title: 'TON618 | Bot premium de Discord para moderación, automatización y operaciones',
        description:
          'TON618 ayuda a comunidades serias de Discord a automatizar moderación, ejecutar flujos, monitorear actividad en vivo y gestionar todo desde un dashboard premium.',
      },
      nav: {
        features: 'Capacidades',
        architecture: 'Dashboard',
        whyTon: 'Confiabilidad',
        network: 'Métricas en vivo',
        docs: 'Docs',
        status: 'Status',
        support: 'Soporte',
        primaryCta: 'Invitar bot',
        secondaryCta: 'Abrir dashboard',
        mobilePrimaryCta: 'Invitar a Discord',
        mobileSecondaryCta: 'Abrir dashboard',
        openMenu: 'Abrir menú de navegación',
        closeMenu: 'Cerrar menú de navegación',
        homeAria: 'Ir al inicio',
        primaryAria: 'Navegación principal',
      },
      languageSelector: {
        triggerLabel: 'Cambiar idioma',
        menuLabel: 'Selector de idioma',
      },
      app: {
        loadingTitle: 'Cargando experiencia',
        loadingDescription: 'Preparando el dashboard y la navegación.',
      },
      landing: {
        skipToContent: 'Saltar al contenido',
      },
      hero: {
        badge: 'Plataforma de operaciones para Discord enfocada en servidores serios',
        titleMain: 'Opera Tu Servidor',
        titleAccent: 'Con Precisión',
        description:
          'Moderación, automatizaciones, tickets, verificación y analítica en un solo bot de Discord pensado para mantenerse rápido mientras tu comunidad crece.',
        descriptionSub:
          'Invita TON618 en minutos, configura flujos desde el dashboard y mantén a tu staff alineado con visibilidad operativa en tiempo real.',
        ctaPrimary: 'Invitar TON618',
        ctaSecondary: 'Abrir dashboard',
        ctaTertiary: 'Ver docs',
        inviteUnavailable: 'Configura VITE_DISCORD_CLIENT_ID para habilitar la invitación del bot.',
        proof: {
          one: 'Automatizaciones para moderación, roles y soporte',
          two: 'Métricas en vivo con fallback elegante',
          three: 'Dashboard premium para operadores y staff',
        },
        panelLabel: 'Por qué los equipos avanzan más rápido con TON618',
        scroll: 'Desplázate para explorar',
        highlightsAria: 'Aspectos destacados del producto',
      },
      docsSection: {
        eyebrow: 'Recursos operativos',
        title: 'Todo Lo Necesario',
        titleAccent: 'Para Evaluar Y Lanzar',
        description:
          'TON618 no se queda en una landing cuidada: muestra valor, abre el dashboard y deja visibles los recursos que un equipo serio espera antes de adoptar el producto.',
        cards: {
          docs: {
            title: 'Documentación operativa',
            description:
              'Guía de setup, módulos y notas operativas para pasar de la instalación al uso real sin depender de conocimiento tribal.',
            ctaExternal: 'Abrir docs',
            ctaFallback: 'Revisar ruta de lanzamiento',
          },
          dashboard: {
            title: 'Dashboard listo para staff',
            description:
              'Abre configuración, tickets y seguimiento operativo desde un panel que ya degrada con gracia cuando una fuente secundaria falla.',
            cta: 'Abrir dashboard',
          },
          support: {
            title: 'Ruta de soporte y confianza',
            description:
              'Soporte, contacto y guía de lanzamiento siguen visibles para reducir fricción durante evaluación, onboarding y resolución de incidencias.',
            ctaExternal: 'Abrir soporte',
            ctaFallback: 'Ir al CTA de lanzamiento',
          },
        },
      },
      features: {
        tag: 'Qué Puedes Operar',
        title: 'Hecho Para',
        titleAccent: 'Operaciones Reales',
        description:
          'TON618 no es un bot de adorno. Es una capa de control para Discord pensada para comunidades que necesitan flujos repetibles, moderación veloz y una operación más limpia cuando el volumen sube.',
        useCases: {
          moderation: 'Modera más rápido con reglas, logs y mejores defaults.',
          onboarding: 'Automatiza onboarding, verificación y asignación de roles.',
          support: 'Mantén tickets, soporte y acciones de staff en orden.',
        },
        items: {
          moderation: {
            title: 'Moderación Que Escala',
            desc: 'Gestiona enforcement, lógica de roles y eventos de moderación sin convertir el trabajo del staff en tareas manuales repetitivas.',
            status: 'LISTO PARA STAFF',
          },
          autonomy: {
            title: 'Flujos Automatizados',
            desc: 'Ejecuta bienvenidas, verificación y procesos recurrentes desde módulos configurables en lugar de depender de comandos dispersos.',
            status: 'FLUJOS ACTIVOS',
          },
          latency: {
            title: 'Respuesta Rápida',
            desc: 'Mantén comandos y acciones operativas con sensación instantánea gracias a una arquitectura orientada a entornos de Discord con alta actividad.',
            status: 'BAJA LATENCIA',
          },
          security: {
            title: 'Más Seguro Por Defecto',
            desc: 'Protege interacciones críticas con permisos estables, superficies controladas y una experiencia pensada para administradores.',
            status: 'ENDURECIDO',
          },
          analytics: {
            title: 'Visibilidad Operativa',
            desc: 'Lee actividad, uso y señales de uptime en vivo para que el staff entienda el estado del bot de un vistazo.',
            status: 'INSIGHT EN VIVO',
          },
          network: {
            title: 'Listo Para Crecer',
            desc: 'Diseñado para comunidades que van más allá de escala hobby y necesitan consistencia entre varios flujos de staff.',
            status: 'LISTO PARA EXPANDIR',
          },
          modular: {
            title: 'Setup Modular',
            desc: 'Activa solo los sistemas que tu servidor necesita y configúralos desde el dashboard sin perder claridad.',
            status: 'CONFIGURABLE',
          },
          comms: {
            title: 'UX Nativa De Discord',
            desc: 'Cada interacción se siente alineada con cómo trabajan los equipos serios de Discord: soporte, moderación y onboarding.',
            status: 'AJUSTE NATIVO',
          },
        },
      },
      experience: {
        title: 'Mira La',
        titleAccent: 'Capa De Control',
        subtitle:
          'Una experiencia de operación más limpia para equipos que necesitan moverse rápido sin perder contexto.',
        card1Eyebrow: 'Claridad de setup',
        card1Title: 'Del caos de comandos a un setup guiado',
        card1Desc:
          'Sustituye conocimiento disperso del staff por un dashboard que expone módulos, acciones y estados clave de una forma que un nuevo moderador puede entender rápido.',
        card2Eyebrow: 'Flujo del operador',
        card2Title: 'Pensado para flujos producto en Discord',
        card2Desc:
          'Pasa de la invitación a la configuración y a la operación diaria con un solo sistema, en vez de coser varios bots y paneles de nicho.',
      },
      why: {
        tag: 'Por Qué Eligen TON618',
        title: 'Confiable Donde',
        titleAccent: 'Más Importa',
        description:
          'Las comunidades serias necesitan más que comandos vistosos. TON618 prioriza confianza operativa: comportamiento estable, métricas visibles, módulos configurables y una experiencia más limpia para owners, moderadores y soporte.',
        stats: {
          uptime: 'Confiabilidad',
          uptimeValue: 'Respaldada en vivo',
          uptimeSub: 'Estado visible en la landing',
          speed: 'Ajuste operativo',
          speedValue: 'Hecho para equipos',
          speedSub: 'De la invitación al uso diario',
        },
        reasons: {
          precision: {
            title: 'Valor de producto claro',
            desc: 'La landing y el dashboard explican con claridad qué resuelve TON618: moderación, automatizaciones, verificación, soporte y visibilidad en vivo.',
          },
          performance: {
            title: 'Mejor ejecución del staff',
            desc: 'Los flujos reutilizables reducen trabajo manual y ayudan a responder con más consistencia en crecimiento o picos de actividad.',
          },
          security: {
            title: 'Experiencia orientada a confianza',
            desc: 'La telemetría en vivo, los fallbacks elegantes y el framing del producto centrado en estabilidad mejoran la confianza de quienes evalúan el bot.',
          },
          integration: {
            title: 'Un sistema, menos huecos',
            desc: 'Dashboard, docs, soporte y status quedan en un mismo recorrido para pasar de interés a setup sin fricción.',
          },
        },
      },
      stats: {
        badgeOnline: 'Datos en vivo online',
        badgeLoading: 'Actualizando datos en vivo',
        badgeOffline: 'Mostrando snapshot base',
        title: 'Confianza',
        titleAccent: 'En Vivo',
        description:
          'Estos números se obtienen de la telemetría en vivo del bot cuando está disponible, con una base verificada si la señal temporalmente falla.',
        lastUpdated: 'Actualizado {{value}}',
        source: {
          live: 'Fuente: telemetría en vivo desde Supabase',
          loading: 'Fuente: conectando con telemetría en vivo',
          fallback: 'Fuente: snapshot base verificado',
        },
        status: {
          syncing: 'Comprobando la telemetría más reciente del bot.',
          standby: 'La telemetría en vivo no está disponible ahora mismo.',
          fallback: 'La landing mantiene una base estable visible para no perder confianza durante incidencias temporales.',
          fallbackWithTime: 'Última sincronización en vivo: {{value}}',
          configFallback: 'La telemetría en vivo no está configurada en este entorno.',
          networkFallback: 'La telemetría en vivo no pudo alcanzarse desde este entorno.',
        },
        cards: {
          clusters: { label: 'Servidores', sub: 'Comunidades conectadas' },
          souls: { label: 'Miembros alcanzados', sub: 'Huella estimada de comunidad' },
          ops: { label: 'Comandos ejecutados', sub: 'Rendimiento operativo' },
          stability: { label: 'Uptime', sub: 'Objetivo de disponibilidad' },
        },
      },
      final: {
        tag: 'Listo Para Lanzar',
        title: 'Invita TON618',
        titleAccent: 'Y Configura Rápido',
        description:
          'Lleva el bot a tu servidor, abre el dashboard y da a tu staff una forma más limpia de moderar, automatizar y dar soporte a tu comunidad.',
        cta: 'Invitar el bot',
        secondaryCta: 'Abrir dashboard',
        docsCta: 'Ver docs',
        supportCta: 'Ir a soporte',
        unavailable: 'La URL de invitación queda deshabilitada hasta configurar VITE_DISCORD_CLIENT_ID.',
        nodes: {
          active: 'PRODUCTO HECHO PARA DISCORD',
          encryption: 'MÉTRICAS EN VIVO LISTAS',
          stabilized: 'FALLBACKS ELEGANTES',
        },
      },
      footer: {
        tagline:
          'Automatización premium para Discord enfocada en calidad de moderación, claridad operativa y una experiencia de setup más limpia.',
        productTitle: 'Producto',
        resourcesTitle: 'Recursos',
        supportTitle: 'Soporte',
        govTitle: 'Legal',
        nav: {
          features: 'Capacidades',
          experience: 'Dashboard',
          why: 'Confiabilidad',
          stats: 'Métricas en vivo',
          invite: 'Invitar bot',
          dashboard: 'Abrir dashboard',
          docs: 'Documentación',
          status: 'Página de estado',
          support: 'Servidor de soporte',
          github: 'GitHub',
        },
        gov: {
          terms: 'términos del servicio',
          privacy: 'política de privacidad',
          cookies: 'política de cookies',
        },
        copyright: '© {{year}} TON618',
        stabilized: 'Producto de operaciones para Discord',
        commanded: 'Creado por milo0dev',
        inviteCta: 'Invitar TON618',
      },
      legal: {
        close: 'Cerrar',
        core: 'Política Central',
        update: 'Última revisión',
        status: 'Publicado',
        terms: {
          title: 'Términos de Servicio',
          content:
            'Al usar TON618 aceptas utilizar el bot de forma responsable, cumplir las políticas de Discord y evitar abuso, spam o intentos de afectar el servicio. Las funciones, límites y disponibilidad pueden cambiar a medida que el producto evoluciona.',
        },
        privacy: {
          title: 'Política de Privacidad',
          content:
            'TON618 solo procesa los datos necesarios para operar funciones del bot, flujos de moderación, analítica y acceso al dashboard. No vendemos datos personales. Los owners de servidores pueden contactar soporte para revisar o solicitar eliminación de datos cuando aplique.',
        },
        cookies: {
          title: 'Política de Cookies',
          content:
            'Este sitio puede usar cookies esenciales y de analítica para mantener el rendimiento, entender el uso del producto y mejorar la experiencia de la landing y del dashboard. El comportamiento de cookies puede controlarse desde la configuración del navegador.',
        },
      },
      dashboardAuth: {
        pageTitle: 'Auth',
        oauthLabel: 'Discord OAuth',
        pageHeading: 'Acceso a {{name}}',
        pageDescription:
          'Estamos validando la sesión segura y sincronizando el acceso a servidores sin alterar tu configuración actual.',
        errorEyebrow: 'No se completó el acceso',
        errorTitle: 'Necesitamos una acción para continuar.',
        retrySync: 'Reintentar sincronización',
        restartLogin: 'Reiniciar login con Discord',
        successEyebrowRedirecting: 'Finalizando acceso',
        successEyebrowLoading: 'Acceso en progreso',
        syncingDescription:
          'Estamos dejando lista la cuenta autenticada para entrar al dashboard con tus guilds administrables ya resueltos.',
        holdingContextDescription:
          'El callback mantiene el contexto del login para que no pierdas el servidor que querías abrir.',
        authCard: {
          missingConfigEyebrow: 'Configuración requerida',
          missingConfigTitle: 'Falta conectar Supabase',
          missingConfigDescription:
            'Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para activar el login con Discord, sincronizar servidores y guardar configuraciones del bot.',
          protectedAccess: 'Acceso protegido',
          cardTitle: 'Inicia sesión para entrar al panel de control',
          cardDescription:
            'Accede con Discord para validar tu sesión, sincronizar guilds administrables y operar el dashboard con permisos reales.',
          loadingCta: 'Conectando...',
          cta: 'Continuar con Discord',
          trustLine: 'Cifrado seguro - Sincronización de servidores - Acceso con Supabase',
          trustFooter: 'TON618 mantiene el branding y el flujo oficial de Discord OAuth',
        },
        state: {
          preparing: 'Preparando autenticación con Discord...',
          exchanging: 'Intercambiando código por sesión segura...',
          syncing: 'Sincronizando servidores administrables con Supabase...',
          redirectingWithGuilds: 'Listo. Redirigiendo al panel con tus servidores sincronizados...',
          redirectingWithoutGuilds: 'Listo. Redirigiendo al dashboard para continuar con la cuenta autenticada...',
          retryingSync: 'Reintentando sincronización de servidores...',
          secureAccessFailed: 'El acceso seguro no pudo completarse.',
        },
        errors: {
          sessionValidationFailed: 'No se pudo validar la sesión actual del dashboard.',
          userLoadFailed: 'No se pudo cargar el usuario autenticado del dashboard.',
          startLoginFailed: 'No se pudo iniciar el acceso con Discord para el dashboard.',
          signOutFailed: 'No se pudo cerrar la sesión del dashboard.',
          restartLoginFailed: 'No se pudo reiniciar el login.',
          restartLoginAction: 'No se pudo reiniciar el login con Discord.',
          missingSessionAfterCallback:
            'No hay una sesión válida del dashboard después del callback. Vuelve a iniciar sesión desde el dashboard.',
          missingProviderToken:
            'Discord no devolvió provider_token. Repite el login para sincronizar servidores.',
          invalidSession:
            'La sesión del dashboard es inválida o expiró. Reinicia el login para continuar.',
          callbackFailed: 'No se pudo completar el callback del dashboard.',
          missingOauthCode: 'No llegó un código OAuth válido al callback.',
          syncMissingToken: 'No llegó un provider token válido para sincronizar los servidores.',
          syncEmptyResponse: 'La función sync-discord-guilds respondió vacío.',
          syncFailed: 'No se pudieron sincronizar los servidores administrables con Supabase.',
          exchangeFailed: 'No se pudo intercambiar el código OAuth con Supabase.',
          exchangeTimeout:
            'El intercambio OAuth tardó demasiado ({{seconds}}s). Revisa la red, Supabase Auth y la configuración de redirect URLs.',
          syncTimeout:
            'La sincronización inicial de servidores tardó demasiado ({{seconds}}s). Revisa la función sync-discord-guilds, la red y el estado de Supabase.',
        },
      },
      dashboard: {
        pageTitle: 'Dashboard',
        metaDescription: 'Dashboard profesional para administrar configuraciones, actividad y analíticas de tu bot de Discord.',
        inbox: {
          workflow: {
            new: 'Nuevo',
            triage: 'Triage',
            waitingStaff: 'Esperando staff',
            waitingUser: 'Esperando usuario',
            escalated: 'Escalado',
            resolved: 'Resuelto',
            closed: 'Cerrado'
          },
          filters: {
            all: 'Todos',
            open: 'Abiertos',
            closed: 'Cerrados',
            urgent: 'Urgente',
            high: 'Alta',
            normal: 'Normal',
            low: 'Baja',
            breached: 'Incumplido',
            warning: 'Por vencer',
            healthy: 'Saludable',
            paused: 'Pausado',
            resolved: 'Resuelto',
            allQueue: 'Toda la cola',
            unclaimed: 'Sin reclamar',
            claimed: 'Reclamados',
            unassigned: 'Sin asignar',
            assigned: 'Asignados',
            allCategories: 'Todas las categorias'
          },
          visibility: {
            internal: 'Interno',
            public: 'Cliente',
            system: 'Sistema'
          },
          actions: {
            claim: 'reclamar el ticket',
            unclaim: 'liberar el ticket',
            assignSelf: 'asignarte el ticket',
            unassign: 'desasignar el ticket',
            setStatus: 'actualizar el estado',
            close: 'cerrar el ticket',
            reopen: 'reabrir el ticket',
            addNote: 'guardar la nota interna',
            addTag: 'agregar el tag',
            removeTag: 'remover el tag',
            replyCustomer: 'enviar la respuesta',
            postMacro: 'publicar la macro',
            setPriority: 'actualizar la prioridad',
            fallback: 'ejecutar la accion'
          }
        },
        shell: {
          brandDescription: 'Navegacion por tareas para configurar, revisar y operar el servidor.',
          activeServer: 'Servidor activo',
          selectServer: 'Selecciona un servidor',
          serverReady: 'Inventario sincronizado y listo para terminar la configuracion.',
          serverPending: 'Puedes elegirlo ahora y completar la instalacion despues.',
          serverEmpty: 'Elige un servidor administrable para abrir configuracion, actividad y tickets.',
          readyBadge: 'Listo',
          pendingBadge: 'Pendiente',
          guildSelector: 'Selector de guild',
          guildsCount: '{{count}} guilds',
          taskNavigation: 'Navegacion por tareas',
          session: 'Sesion',
          syncingInventory: 'Actualizando inventario...',
          panelReady: 'Panel listo para operar',
          lastHeartbeat: 'Ultimo heartbeat {{time}}.',
          logout: 'Cerrar sesion',
          skipToContent: 'Saltar al contenido del dashboard',
          openMenuAria: 'Abrir navegacion del dashboard',
          closeMenuAria: 'Cerrar navegacion del dashboard',
          navAria: 'Navegacion del dashboard',
          headerDescription: 'Centro de control guiado para terminar configuracion, detectar bloqueos y saber exactamente que sigue sin tener que adivinar a que modulo entrar.',
          membersCount: '{{count}} miembros',
          planBadge: 'Plan {{tier}}',
          heartbeatBadge: 'Ultimo heartbeat {{time}}',
          focusServer: 'Servidor en foco',
          focusReadyInfo: 'Este servidor ya tiene el bot y puede cargar snapshot completo.',
          focusPendingInfo: 'Este servidor aun necesita instalacion o una sincronizacion completa.',
          defaultUser: 'Administrador',
          lastSync: 'Ultima sincronizacion {{time}}',
          bridgeHealth: 'Salud del bridge',
          bridgeNoDetails: 'Sin detalles adicionales reportados por el bridge.',
          syncActivity: 'Actividad de sincronizacion',
          configSync: 'Config {{time}}',
          inventorySync: 'Inventario {{time}}. Cola {{pending}} pendientes y {{failed}} fallidas.',
          syncFailed: 'La re-sincronizacion no pudo completarse',
          reviewNeeded: 'Hay cambios que requieren revision. Vuelve a Inicio para ver que tarea necesita atencion antes de seguir aplicando cambios.',
          statusBotActive: 'Bot activo en el servidor',
          statusBotMissing: 'Bot sin instalar',
          statusInQueue: '{{count}} en cola',
          statusFailed: '{{count}} fallidas',
          inviteSuffix: ' - invitar',
          readySuffix: ' - listo',
          errorBoundary: {
            eyebrow: 'Error del modulo',
            title: 'Este modulo fallo al renderizar'
          },
          configSaveError: 'No se pudo registrar la solicitud de cambio.',
          sectionStatus: {
            active: 'Activo',
            basic: 'Basico',
            needsAttention: 'Requiere revision',
            notConfigured: 'No configurado'
          }
        },
        actions: {
          retryValidation: 'Reintentar validación',
          restartDiscord: 'Volver a iniciar con Discord',
          retryLoad: 'Reintentar carga',
          resyncAccess: 'Re-sincronizar acceso',
          goToAvailableGuild: 'Ir al servidor disponible',
          retrySnapshot: 'Reintentar snapshot',
          resyncServer: 'Re-sincronizar servidor',
          resyncNow: 'Re-sincronizar ahora',
          syncingNow: 'Sincronizando...',
          switchAccount: 'Cambiar de cuenta',
        },
        inviteBot: {
          helper: 'Este servidor aún no tiene el bot instalado.',
          cta: 'Invitar bot a este servidor',
        },
        errors: {
          authValidation: 'No se pudo validar la sesión del dashboard.',
          guildsLoad: 'Intenta sincronizar otra vez o revisa la configuración de Supabase.',
          snapshotLoad: 'Revisa tablas, políticas RLS y el bridge del bot.',
        },
        states: {
          authLoading: {
            eyebrow: 'Acceso seguro',
            title: 'Validando sesión del dashboard',
            description: 'Estamos comprobando tu sesión con Supabase antes de cargar servidores, permisos y estado operativo.',
            pill: 'Verificando acceso',
          },
          authError: {
            eyebrow: 'Acceso no disponible',
            title: 'No pudimos validar tu sesión',
          },
          guildsLoading: {
            eyebrow: 'Sincronización inicial',
            title: 'Cargando tus servidores administrables',
            description: 'Estamos consultando el acceso ya sincronizado para preparar el selector de guild, el estado de salud y el snapshot del panel.',
            pill: 'Preparando shell',
          },
          guildsError: {
            eyebrow: 'Error de datos',
            title: 'No pudimos cargar tus servidores',
          },
          emptyGuilds: {
            eyebrow: 'Sin servidores',
            title: 'No encontramos guilds administrables para esta cuenta',
            description: 'Asegúrate de tener permisos de administración o Manage Server en Discord y vuelve a sincronizar el acceso.',
          },
          invalidGuild: {
            eyebrow: 'Servidor inválido',
            title: 'Ese guild ya no está disponible para esta sesión',
            description:
              'El servidor solicitado ({{guildId}}) no aparece entre tus guilds administrables actuales. Puede haber cambiado el acceso, la sincronización o la URL compartida.',
          },
          noSelectedGuild: {
            eyebrow: 'Selección requerida',
            title: 'Escoge un servidor para continuar',
            description:
              'En cuanto elijas un guild, cargaremos configuración aplicada, inventario, auditoría y analíticas asociadas.',
          },
          snapshotError: {
            eyebrow: 'Módulo no disponible',
            title: 'No pudimos cargar este servidor',
          },
        },
      },
    },
  },
};

function normalizeLanguageCode(language?: string): string {
  return language?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

function applyDocumentLanguage(language?: string) {
  if (typeof document === 'undefined') {
    return;
  }

  const normalizedLanguage = normalizeLanguageCode(language);
  document.documentElement.lang = normalizedLanguage;
  document.documentElement.setAttribute('xml:lang', normalizedLanguage);
}

const savedLanguage =
  typeof window !== 'undefined'
    ? normalizeLanguageCode(localStorage.getItem('i18nextLng') || 'en')
    : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: 'en',
  supportedLngs: ['en', 'es'],
  nonExplicitSupportedLngs: true,
  load: 'languageOnly',
  cleanCode: true,
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  const normalizedLanguage = normalizeLanguageCode(lng);

  if (typeof window !== 'undefined') {
    localStorage.setItem('i18nextLng', normalizedLanguage);
  }

  applyDocumentLanguage(normalizedLanguage);
});

applyDocumentLanguage(i18n.resolvedLanguage || i18n.language || savedLanguage);

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        features: 'Features',
        architecture: 'Architecture',
        whyTon: 'Why TON',
        network: 'Network',
        cta: 'Initialize HUD',
        mobileCta: 'Initialize Dashboard'
      },
      hero: {
        badge: 'Quantum Protocol v2.5.0 Active',
        titleMain: 'Beyond',
        titleAccent: 'Gravity',
        description: 'Forge your Discord ecosystem within the singularity.',
        descriptionSub: 'Massive automation, extreme precision, cosmic scale.',
        ctaPrimary: 'Launch Protocol',
        ctaSecondary: 'Access Terminal',
        scroll: 'Singular Exploration'
      },
      features: {
        tag: 'Tactical Advantage',
        title: 'Operational',
        titleAccent: 'Superiority',
        description: 'A highly-calibrated utility core designed to command the next generation of complex digital infrastructures.',
        items: {
          moderation: {
            title: 'Kinetic Moderation',
            desc: 'Neural-linked enforcement protocols that sanitize threats before they penetrate your community ecosystem.',
            status: 'ENFORCER ACTIVE'
          },
          autonomy: {
            title: 'Core Autonomy',
            desc: 'Sophisticated event-loops and automated role architectures that evolve with your server\'s complexity.',
            status: 'LOGIC STABLE'
          },
          latency: {
            title: 'Sub-Zero Latency',
            desc: 'High-frequency command processing across decentralized shard clusters for near-instant execution.',
            status: 'FLOW OPTIMIZED'
          },
          security: {
            title: 'Cryptographic Integrity',
            desc: 'Military-grade data protection and sophisticated intrusion detection to maintain total sovereign security.',
            status: 'SHIELD VERIFIED'
          },
          analytics: {
            title: 'Neural Analytics',
            desc: 'Deep-space telemetry and interaction mapping. Visualize every data point within your digital horizon.',
            status: 'COGNITION LIVE'
          },
          network: {
            title: 'Omni-Scale Network',
            desc: 'Architected for massive expansion. Seamlessly sustain multi-million member ecosystems with absolute stability.',
            status: 'HORIZON EXPANDED'
          },
          modular: {
            title: 'Modular DNA',
            desc: 'Granular configuration patterns. Tailor the singularity core to your server\'s specific operational requirements.',
            status: 'CORE CUSTOMIZED'
          },
          comms: {
            title: 'Unified Comms',
            desc: 'Seamless integration across the Discord API. A bridge between your community and the next generation of tools.',
            status: 'SIGNAL CLEAR'
          }
        }
      },
      experience: {
        title: 'Architect the',
        titleAccent: 'Void',
        subtitle: 'Scaling civilizations beyond the event horizon.',
        card1Title: 'Vanguard Shield',
        card1Desc: 'Advanced kinetic barriers protecting your server against the pressures of extreme growth.',
        card2Title: 'Neural Sharding',
        card2Desc: 'Dynamic shard distribution allowing for uninterrupted processing at hyper-massive scales.'
      },
      why: {
        tag: 'Elite Engineering',
        title: 'Engineered',
        titleAccent: 'Superiority',
        description: 'In a universe of generic templates, TON618 is the only utility forged with the scale and power of a supermassive singularity.',
        stats: {
          uptime: 'Uptime Protocol',
          uptimeValue: 'Always watched',
          uptimeSub: 'Live telemetry backed',
          speed: 'Processing Speed',
          speedValue: 'Built to respond',
          speedSub: 'Performance shown live'
        },
        reasons: {
          precision: {
            title: 'Unmatched Precision',
            desc: 'Every command is executed with absolute accuracy. No edge cases, no failures. Just pure technical dominance.'
          },
          performance: {
            title: 'Quantum Performance',
            desc: 'Built on a custom high-concurrency engine processing thousands of operations per second with minimal latency.'
          },
          security: {
            title: 'Fortress Security',
            desc: 'Advanced threat mitigation going beyond filtering. We protect your community with corporate-grade protocols.'
          },
          integration: {
            title: 'Neural Integration',
            desc: 'A modular, intelligent core designed to adapt and evolve with your server\'s unique ecosystem.'
          }
        }
      },
      stats: {
        badgeOnline: 'Telemetry Online',
        badgeLoading: 'Sync In Progress',
        badgeOffline: 'Protocol Restricted',
        title: 'Proven',
        titleAccent: 'Scale',
        description: 'Live telemetry data verified by our global synchronization layer. Power without compromise.',
        lastUpdated: 'Last updated {{value}}',
        status: {
          syncing: 'Refreshing live telemetry',
          standby: 'Awaiting live telemetry',
          fallback: 'Fallback metrics remain visible while the live feed stabilizes.'
        },
        cards: {
          clusters: { label: 'Active Clusters', sub: 'Across Global Nodes' },
          souls: { label: 'Synchronized Souls', sub: 'Verified Identities' },
          ops: { label: 'Operations Executed', sub: 'Real-time Throughput' },
          stability: { label: 'Stability Index', sub: 'L1 Uptime Standard' }
        }
      },
      final: {
        tag: 'Protocol Finalization',
        title: 'Expand Your',
        titleAccent: 'Empire',
        description: 'The singularity is ready. Initiate the synchronization protocol and bring cosmic-scale power to your Discord server today.',
        cta: 'Initialize Sync',
        nodes: {
          active: 'NODE-01 ACTIVE',
          encryption: 'ENCRYPTION VERIFIED',
          stabilized: 'VOID STABILIZED'
        }
      },
      footer: {
        tagline: 'The most massive Discord automation utility in the known universe. Engineered for absolute dominance and community stability.',
        navTitle: 'Navigation',
        govTitle: 'Governance',
        nav: {
          features: 'Features',
          stats: 'Stats',
          commands: 'Commands',
          docs: 'Documentation'
        },
        gov: {
          terms: 'terms protocol',
          privacy: 'privacy protocol',
          cookies: 'cookies protocol'
        },
        copyright: '{{year}} TON618 PROJECT',
        stabilized: 'VOID STABILIZED NODE',
        commanded: 'COMMANDED BY MILO0DEV'
      },
      legal: {
        close: 'Close HUD',
        core: 'Core Protocol',
        update: 'Protocol Update',
        status: 'Active',
        terms: {
          title: 'Terms of Service',
          content: 'By using this bot you agree to use it responsibly, follow Discord policies, and avoid abuse. Service availability may change over time, and features can be updated without prior notice.'
        },
        privacy: {
          title: 'Privacy Policy',
          content: 'We only process data required for bot functionality, moderation, and analytics. We do not sell personal data. You can request removal of server-related data by contacting support.'
        },
        cookies: {
          title: 'Cookies Policy',
          content: 'This site may use essential and analytics cookies to improve performance and user experience. You can control cookies through your browser settings at any time.'
        }
      }
    }
  },
  es: {
    translation: {
      nav: {
        features: 'Características',
        architecture: 'Arquitectura',
        whyTon: 'Por qué TON',
        network: 'Red',
        cta: 'Inicializar HUD',
        mobileCta: 'Iniciar Panel'
      },
      hero: {
        badge: 'Protocolo Quantum v2.5.0 Activo',
        titleMain: 'Más allá de la',
        titleAccent: 'Gravedad',
        description: 'Forja tu ecosistema de Discord dentro de la singularidad.',
        descriptionSub: 'Automatización masiva, precisión extrema, escala cósmica.',
        ctaPrimary: 'Lanzar Protocolo',
        ctaSecondary: 'Acceder a Terminal',
        scroll: 'Exploración Singular'
      },
      features: {
        tag: 'Ventaja Táctica',
        title: 'Superioridad',
        titleAccent: 'Operativa',
        description: 'Un núcleo de utilidad altamente calibrado diseñado para comandar la próxima generación de infraestructuras digitales complejas.',
        items: {
          moderation: {
            title: 'Moderación Kinética',
            desc: 'Protocolos de cumplimiento vinculados neuronalmente que desinfectan amenazas antes de que penetren tu ecosistema comunitario.',
            status: 'EJECUTOR ACTIVO'
          },
          autonomy: {
            title: 'Autonomía Central',
            desc: 'Circuitos de eventos sofisticados y arquitecturas de roles automatizadas que evolucionan con la complejidad de tu servidor.',
            status: 'LÓGICA ESTABLE'
          },
          latency: {
            title: 'Latencia Sub-Cero',
            desc: 'Procesamiento de comandos de alta frecuencia a través de clústeres de fragmentos descentralizados para una ejecución casi instantánea.',
            status: 'FLUJO OPTIMIZADO'
          },
          security: {
            title: 'Integridad Criptográfica',
            desc: 'Protección de datos de grado militar y detección de intrusiones sofisticada para mantener una seguridad soberana total.',
            status: 'ESCUDO VERIFICADO'
          },
          analytics: {
            title: 'Analítica Neural',
            desc: 'Telemetría de espacio profundo y mapeo de interacciones. Visualiza cada punto de datos dentro de tu horizonte digital.',
            status: 'COGNICIÓN EN VIVO'
          },
          network: {
            title: 'Red Omni-Escala',
            desc: 'Arquitectado para una expansión masiva. Mantén ecosistemas de millones de miembros sin problemas con estabilidad absoluta.',
            status: 'HORIZONTE EXPANDIDO'
          },
          modular: {
            title: 'ADN Modular',
            desc: 'Patrones de configuración granulares. Adapta el núcleo de la singularidad a los requerimientos operativos específicos de tu servidor.',
            status: 'NÚCLEO PERSONALIZADO'
          },
          comms: {
            title: 'Comunicaciones Unidas',
            desc: 'Integración fluida a través de la API de Discord. Un puente entre tu comunidad y la próxima generación de herramientas.',
            status: 'SEÑAL LIMPIA'
          }
        }
      },
      experience: {
        title: 'Arquitecta el',
        titleAccent: 'Vacío',
        subtitle: 'Escalando civilizaciones más allá del horizonte de sucesos.',
        card1Title: 'Escudo Vanguardia',
        card1Desc: 'Barreras kinéticas avanzadas que protegen tu servidor contra las presiones del crecimiento extremo.',
        card2Title: 'Fragmentación Neural',
        card2Desc: 'Distribución dinámica de fragmentos que permite un procesamiento ininterrumpido a escalas híper-masivas.'
      },
      why: {
        tag: 'Ingeniería de Élite',
        title: 'Superioridad',
        titleAccent: 'Técnica',
        description: 'En un universo de plantillas genéricas, TON618 es la única utilidad forjada con la escala y el poder de una singularidad supermasiva.',
        stats: {
          uptime: 'Protocolo de Actividad',
          uptimeValue: 'Siempre monitoreado',
          uptimeSub: 'Respaldado por telemetria en vivo',
          speed: 'Velocidad de Proceso',
          speedValue: 'Hecho para responder',
          speedSub: 'Rendimiento visible en vivo'
        },
        reasons: {
          precision: {
            title: 'Precisión Inigualable',
            desc: 'Cada comando se ejecuta con exactitud absoluta. Sin casos límite, sin fallos. Solo pura dominancia técnica.'
          },
          performance: {
            title: 'Rendimiento Quantum',
            desc: 'Construido sobre un motor de alta concurrencia personalizado que procesa miles de operaciones por segundo con latencia mínima.'
          },
          security: {
            title: 'Seguridad Fortaleza',
            desc: 'Mitigación de amenazas avanzada que va más allá del filtrado. Protegemos tu comunidad con protocolos de grado corporativo.'
          },
          integration: {
            title: 'Integración Neural',
            desc: 'Un núcleo inteligente y modular diseñado para adaptarse y evolucionar con el ecosistema único de tu servidor.'
          }
        }
      },
      stats: {
        badgeOnline: 'Telemetría Online',
        badgeLoading: 'Sincronizando Datos',
        badgeOffline: 'Protocolo Restringido',
        title: 'Escala',
        titleAccent: 'Probada',
        description: 'Datos de telemetría en vivo verificados por nuestra capa de sincronización global. Poder sin concesiones.',
        lastUpdated: 'Actualizado {{value}}',
        status: {
          syncing: 'Actualizando telemetría en vivo',
          standby: 'Esperando telemetría en vivo',
          fallback: 'Las métricas base siguen visibles mientras se estabiliza la señal en vivo.'
        },
        cards: {
          clusters: { label: 'Clústeres Activos', sub: 'En Nodos Globales' },
          souls: { label: 'Almas Sincronizadas', sub: 'Identidades Verificadas' },
          ops: { label: 'Operaciones Ejecutadas', sub: 'Rendimiento Real' },
          stability: { label: 'Índice de Estabilidad', sub: 'Estándar de Actividad L1' }
        }
      },
      final: {
        tag: 'Finalización de Protocolo',
        title: 'Expande tu',
        titleAccent: 'Imperio',
        description: 'La singularidad está lista. Inicia el protocolo de sincronización y lleva el poder a escala cósmica a tu servidor de Discord hoy mismo.',
        cta: 'Inicializar Sincronización',
        nodes: {
          active: 'NODO-01 ACTIVO',
          encryption: 'ENCRIPTACIÓN VERIFICADA',
          stabilized: 'VACÍO ESTABILIZADO'
        }
      },
      footer: {
        tagline: 'La utilidad de automatización de Discord más masiva del universo conocido. Diseñada para la dominancia absoluta y la estabilidad de la comunidad.',
        navTitle: 'Navegación',
        govTitle: 'Gobernanza',
        nav: {
          features: 'Características',
          stats: 'Estadísticas',
          commands: 'Comandos',
          docs: 'Documentación'
        },
        gov: {
          terms: 'protocolo de términos',
          privacy: 'protocolo de privacidad',
          cookies: 'protocolo de cookies'
        },
        copyright: '{{year}} PROYECTO TON618',
        stabilized: 'NODO ESTABILIZADO DEL VACÍO',
        commanded: 'COMANDADO POR MILO0DEV'
      },
      legal: {
        close: 'Cerrar HUD',
        core: 'Protocolo Central',
        update: 'Actualización de Protocolo',
        status: 'Activo',
        terms: {
          title: 'Términos de Servicio',
          content: 'Al usar este bot aceptas usarlo de manera responsable, seguir las políticas de Discord y evitar el abuso. La disponibilidad del servicio puede cambiar con el tiempo y las funciones pueden actualizarse sin previo aviso.'
        },
        privacy: {
          title: 'Política de Privacidad',
          content: 'Solo procesamos los datos requeridos para la funcionalidad del bot, moderación y analíticas. No vendemos datos personales. Puedes solicitar la eliminación de datos relacionados con el servidor contactando a soporte.'
        },
        cookies: {
          title: 'Política de Cookies',
          content: 'Este sitio puede usar cookies esenciales y de analítica para mejorar el rendimiento y la experiencia del usuario. Puedes controlar las cookies a través de la configuración de tu navegador en cualquier momento.'
        }
      }
    }
  }
};

const savedLanguage = localStorage.getItem('i18nextLng') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;

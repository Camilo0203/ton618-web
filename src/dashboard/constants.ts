import {
  Activity,
  BarChart3,
  Bot,
  Command,
  Compass,
  Inbox,
  LayoutGrid,
  MessageSquareQuote,
  Settings2,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type {
  ConfigMutationSectionId,
  DashboardNavShortcut,
  DashboardSectionId,
  DashboardTaskGroupId,
} from './types';

export const DASHBOARD_GUILD_STORAGE_KEY = 'dashboard:last-guild-id';
export const DASHBOARD_SECTION_STORAGE_PREFIX = 'dashboard:last-section:';

export const dashboardQueryKeys = {
  auth: ['dashboard', 'auth'] as const,
  guilds: ['dashboard', 'guilds'] as const,
  snapshot: (guildId: string) => ['dashboard', 'snapshot', guildId] as const,
};

export interface DashboardSectionMeta {
  id: DashboardSectionId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface DashboardTaskGroup {
  id: DashboardTaskGroupId;
  label: string;
  description: string;
  icon: LucideIcon;
  sections: DashboardSectionId[];
  shortcuts: DashboardNavShortcut[];
}

export const dashboardSections: DashboardSectionMeta[] = [
  {
    id: 'overview',
    label: 'Inicio',
    description: 'Lo que ya funciona, lo que falta y que deberias hacer ahora.',
    icon: LayoutGrid,
  },
  {
    id: 'inbox',
    label: 'Bandeja de soporte',
    description: 'Cola activa, macros y seguimiento.',
    icon: Inbox,
  },
  {
    id: 'general',
    label: 'Configuracion inicial',
    description: 'Idioma, comandos y base del panel.',
    icon: SlidersHorizontal,
  },
  {
    id: 'server_roles',
    label: 'Roles y canales',
    description: 'Canales clave, staff y permisos que destraban el resto.',
    icon: Bot,
  },
  {
    id: 'tickets',
    label: 'Tickets',
    description: 'Flujo de soporte, SLA y automatizacion.',
    icon: Ticket,
  },
  {
    id: 'verification',
    label: 'Verificacion de acceso',
    description: 'Acceso de miembros y proteccion anti-raid.',
    icon: Shield,
  },
  {
    id: 'welcome',
    label: 'Bienvenida',
    description: 'Entrada, despedida y autoroles.',
    icon: Sparkles,
  },
  {
    id: 'suggestions',
    label: 'Sugerencias de la comunidad',
    description: 'Canales, revision y feedback.',
    icon: MessageSquareQuote,
  },
  {
    id: 'modlogs',
    label: 'Registro de moderacion',
    description: 'Eventos del staff y trazabilidad.',
    icon: ShieldCheck,
  },
  {
    id: 'commands',
    label: 'Comandos',
    description: 'Disponibilidad y limites de uso.',
    icon: Command,
  },
  {
    id: 'system',
    label: 'Sistema del bot',
    description: 'Backups, sincronizacion y salud tecnica.',
    icon: Wrench,
  },
  {
    id: 'activity',
    label: 'Actividad reciente',
    description: 'Cambios, cola y eventos recientes.',
    icon: Activity,
  },
  {
    id: 'analytics',
    label: 'Analitica',
    description: 'Uso real, tickets y rendimiento.',
    icon: BarChart3,
  },
];

export const dashboardTaskGroups: DashboardTaskGroup[] = [
  {
    id: 'home',
    label: 'Inicio',
    description: 'Portada operativa del servidor y siguientes pasos.',
    icon: LayoutGrid,
    sections: ['overview', 'activity'],
    shortcuts: [
      {
        id: 'home-summary',
        label: 'Resumen',
        description: 'Vista general del estado actual.',
        sectionId: 'overview',
      },
      {
        id: 'home-checklist',
        label: 'Checklist',
        description: 'Tareas clave para completar la puesta en marcha.',
        sectionId: 'overview',
      },
      {
        id: 'home-pending',
        label: 'Cambios pendientes',
        description: 'Solicitudes y eventos por revisar.',
        sectionId: 'activity',
      },
    ],
  },
  {
    id: 'setup',
    label: 'Configuracion inicial',
    description: 'Base operativa para dejar el bot listo.',
    icon: Compass,
    sections: ['general', 'server_roles', 'commands'],
    shortcuts: [
      {
        id: 'setup-basics',
        label: 'Ajustes basicos',
        description: 'Idioma, zona horaria y modo de comandos.',
        sectionId: 'general',
      },
      {
        id: 'setup-roles',
        label: 'Roles y canales',
        description: 'Conecta staff, logs y canales principales.',
        sectionId: 'server_roles',
      },
      {
        id: 'setup-permissions',
        label: 'Permisos',
        description: 'Ajusta disponibilidad y limites de comandos.',
        sectionId: 'commands',
      },
    ],
  },
  {
    id: 'community',
    label: 'Comunidad',
    description: 'Experiencias visibles para miembros nuevos y comunidad.',
    icon: Sparkles,
    sections: ['welcome', 'verification', 'suggestions'],
    shortcuts: [
      {
        id: 'community-welcome',
        label: 'Bienvenida',
        description: 'Entrada, despedida y autorol.',
        sectionId: 'welcome',
      },
      {
        id: 'community-verification',
        label: 'Verificacion',
        description: 'Acceso seguro y proteccion de ingreso.',
        sectionId: 'verification',
      },
      {
        id: 'community-suggestions',
        label: 'Sugerencias',
        description: 'Canal comunitario y revision interna.',
        sectionId: 'suggestions',
      },
      {
        id: 'community-autoroles',
        label: 'Autoroles',
        description: 'Se gestiona desde bienvenida.',
        sectionId: 'welcome',
      },
    ],
  },
  {
    id: 'support',
    label: 'Soporte',
    description: 'Atencion operativa, tickets y seguimiento real.',
    icon: Ticket,
    sections: ['tickets', 'inbox'],
    shortcuts: [
      {
        id: 'support-tickets',
        label: 'Tickets',
        description: 'Reglas, limites y automatizaciones.',
        sectionId: 'tickets',
      },
      {
        id: 'support-inbox',
        label: 'Bandeja',
        description: 'Cola activa y conversaciones abiertas.',
        sectionId: 'inbox',
      },
      {
        id: 'support-macros',
        label: 'Macros',
        description: 'Acceso rapido desde la bandeja.',
        sectionId: 'inbox',
      },
      {
        id: 'support-sla',
        label: 'SLA',
        description: 'Objetivos de respuesta y alertas.',
        sectionId: 'tickets',
      },
    ],
  },
  {
    id: 'moderation',
    label: 'Moderacion',
    description: 'Registro operativo y seguimiento del staff.',
    icon: ShieldCheck,
    sections: ['modlogs', 'activity'],
    shortcuts: [
      {
        id: 'moderation-log',
        label: 'Registro',
        description: 'Eventos que quedan guardados.',
        sectionId: 'modlogs',
      },
      {
        id: 'moderation-rules',
        label: 'Automatizacion',
        description: 'Controles tecnicos desde sistema.',
        sectionId: 'system',
      },
      {
        id: 'moderation-staff',
        label: 'Acciones del staff',
        description: 'Actividad y cambios recientes.',
        sectionId: 'activity',
      },
    ],
  },
  {
    id: 'system',
    label: 'Sistema',
    description: 'Estado tecnico, respaldo y rendimiento del bot.',
    icon: Settings2,
    sections: ['system', 'analytics'],
    shortcuts: [
      {
        id: 'system-sync',
        label: 'Sincronizacion',
        description: 'Heartbeat, cola y bridge.',
        sectionId: 'system',
      },
      {
        id: 'system-backups',
        label: 'Backups',
        description: 'Copias y restauracion.',
        sectionId: 'system',
      },
      {
        id: 'system-diagnostics',
        label: 'Diagnostico',
        description: 'Estado tecnico general.',
        sectionId: 'system',
      },
      {
        id: 'system-analytics',
        label: 'Analitica',
        description: 'Uso del bot y rendimiento.',
        sectionId: 'analytics',
      },
    ],
  },
];

export const dashboardSectionToMutationSection: Record<
  DashboardSectionId,
  ConfigMutationSectionId | null
> = {
  overview: null,
  inbox: null,
  general: 'general',
  server_roles: 'server_roles_channels',
  tickets: 'tickets',
  verification: 'verification',
  welcome: 'welcome',
  suggestions: 'suggestions',
  modlogs: 'modlogs',
  commands: 'commands',
  system: 'system',
  activity: null,
  analytics: null,
};

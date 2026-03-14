import {
  Activity,
  BarChart3,
  Bot,
  Command,
  Inbox,
  LayoutGrid,
  MessageSquareQuote,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { ConfigMutationSectionId, DashboardSectionId } from './types';

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

export const dashboardSections: DashboardSectionMeta[] = [
  {
    id: 'overview',
    label: 'Resumen',
    description: 'Salud operativa, setup y estado aplicado.',
    icon: LayoutGrid,
  },
  {
    id: 'inbox',
    label: 'Bandeja viva',
    description: 'Bandeja viva con claim, bitacora, macros y SLA.',
    icon: Inbox,
  },
  {
    id: 'general',
    label: 'General',
    description: 'Idioma, invocacion y preferencias del panel.',
    icon: SlidersHorizontal,
  },
  {
    id: 'server_roles',
    label: 'Servidor y roles',
    description: 'Canales base, paneles, staff y permisos clave.',
    icon: Bot,
  },
  {
    id: 'tickets',
    label: 'Tickets y SLA',
    description: 'Limites, SLA, autoasignacion e incidente.',
    icon: Ticket,
  },
  {
    id: 'verification',
    label: 'Verificacion',
    description: 'Panel, roles, antiraid y expiracion.',
    icon: Shield,
  },
  {
    id: 'welcome',
    label: 'Bienvenida',
    description: 'Bienvenidas, despedidas, DM y autoroles.',
    icon: Sparkles,
  },
  {
    id: 'suggestions',
    label: 'Sugerencias',
    description: 'Canales, anonimato, razones y cooldown.',
    icon: MessageSquareQuote,
  },
  {
    id: 'modlogs',
    label: 'Modlogs',
    description: 'Eventos auditables y canal de logs.',
    icon: ShieldCheck,
  },
  {
    id: 'commands',
    label: 'Comandos',
    description: 'Comandos, limites globales y overrides.',
    icon: Command,
  },
  {
    id: 'system',
    label: 'Sistema',
    description: 'Mantenimiento, backups y estado del bridge.',
    icon: Wrench,
  },
  {
    id: 'activity',
    label: 'Actividad',
    description: 'Auditoria unificada de solicitudes y cambios.',
    icon: Activity,
  },
  {
    id: 'analytics',
    label: 'Analitica',
    description: 'KPIs reales de comandos, tickets y SLA.',
    icon: BarChart3,
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

import {
  Activity,
  BarChart3,
  Bot,
  Command,
  Compass,
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
  billing: (guildId: string) => ['dashboard', 'billing', guildId] as const,
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
    label: 'dashboard.sections.overview.label',
    description: 'dashboard.sections.overview.description',
    icon: LayoutGrid,
  },
  {
    id: 'general',
    label: 'dashboard.sections.general.label',
    description: 'dashboard.sections.general.description',
    icon: SlidersHorizontal,
  },
  {
    id: 'server_roles',
    label: 'dashboard.sections.server_roles.label',
    description: 'dashboard.sections.server_roles.description',
    icon: Bot,
  },
  {
    id: 'tickets',
    label: 'dashboard.sections.tickets.label',
    description: 'dashboard.sections.tickets.description',
    icon: Ticket,
  },
  {
    id: 'verification',
    label: 'dashboard.sections.verification.label',
    description: 'dashboard.sections.verification.description',
    icon: Shield,
  },
  {
    id: 'welcome',
    label: 'dashboard.sections.welcome.label',
    description: 'dashboard.sections.welcome.description',
    icon: Sparkles,
  },
  {
    id: 'suggestions',
    label: 'dashboard.sections.suggestions.label',
    description: 'dashboard.sections.suggestions.description',
    icon: MessageSquareQuote,
  },
  {
    id: 'modlogs',
    label: 'dashboard.sections.modlogs.label',
    description: 'dashboard.sections.modlogs.description',
    icon: ShieldCheck,
  },
  {
    id: 'commands',
    label: 'dashboard.sections.commands.label',
    description: 'dashboard.sections.commands.description',
    icon: Command,
  },
  {
    id: 'system',
    label: 'dashboard.sections.system.label',
    description: 'dashboard.sections.system.description',
    icon: Wrench,
  },
  {
    id: 'activity',
    label: 'dashboard.sections.activity.label',
    description: 'dashboard.sections.activity.description',
    icon: Activity,
  },
  {
    id: 'analytics',
    label: 'dashboard.sections.analytics.label',
    description: 'dashboard.sections.analytics.description',
    icon: BarChart3,
  },
];

export const dashboardTaskGroups: DashboardTaskGroup[] = [
  {
    id: 'home',
    label: 'dashboard.taskGroups.home.label',
    description: 'dashboard.taskGroups.home.description',
    icon: LayoutGrid,
    sections: ['overview', 'activity'],
    shortcuts: [
      {
        id: 'home-summary',
        label: 'dashboard.shortcuts.home-summary.label',
        description: 'dashboard.shortcuts.home-summary.description',
        sectionId: 'overview',
      },
      {
        id: 'home-checklist',
        label: 'dashboard.shortcuts.home-checklist.label',
        description: 'dashboard.shortcuts.home-checklist.description',
        sectionId: 'overview',
      },
      {
        id: 'home-pending',
        label: 'dashboard.shortcuts.home-pending.label',
        description: 'dashboard.shortcuts.home-pending.description',
        sectionId: 'activity',
      },
    ],
  },
  {
    id: 'setup',
    label: 'dashboard.taskGroups.setup.label',
    description: 'dashboard.taskGroups.setup.description',
    icon: Compass,
    sections: ['general', 'server_roles', 'commands'],
    shortcuts: [
      {
        id: 'setup-basics',
        label: 'dashboard.shortcuts.setup-basics.label',
        description: 'dashboard.shortcuts.setup-basics.description',
        sectionId: 'general',
      },
      {
        id: 'setup-roles',
        label: 'dashboard.shortcuts.setup-roles.label',
        description: 'dashboard.shortcuts.setup-roles.description',
        sectionId: 'server_roles',
      },
      {
        id: 'setup-permissions',
        label: 'dashboard.shortcuts.setup-permissions.label',
        description: 'dashboard.shortcuts.setup-permissions.description',
        sectionId: 'commands',
      },
    ],
  },
  {
    id: 'community',
    label: 'dashboard.taskGroups.community.label',
    description: 'dashboard.taskGroups.community.description',
    icon: Sparkles,
    sections: ['welcome', 'verification', 'suggestions'],
    shortcuts: [
      {
        id: 'community-welcome',
        label: 'dashboard.shortcuts.community-welcome.label',
        description: 'dashboard.shortcuts.community-welcome.description',
        sectionId: 'welcome',
      },
      {
        id: 'community-verification',
        label: 'dashboard.shortcuts.community-verification.label',
        description: 'dashboard.shortcuts.community-verification.description',
        sectionId: 'verification',
      },
      {
        id: 'community-suggestions',
        label: 'dashboard.shortcuts.community-suggestions.label',
        description: 'dashboard.shortcuts.community-suggestions.description',
        sectionId: 'suggestions',
      },
      {
        id: 'community-autoroles',
        label: 'dashboard.shortcuts.community-autoroles.label',
        description: 'dashboard.shortcuts.community-autoroles.description',
        sectionId: 'welcome',
      },
    ],
  },
  {
    id: 'support',
    label: 'dashboard.taskGroups.support.label',
    description: 'dashboard.taskGroups.support.description',
    icon: Ticket,
    sections: ['tickets'],
    shortcuts: [
      {
        id: 'support-tickets',
        label: 'dashboard.shortcuts.support-tickets.label',
        description: 'dashboard.shortcuts.support-tickets.description',
        sectionId: 'tickets',
      },
      {
        id: 'support-sla',
        label: 'dashboard.shortcuts.support-sla.label',
        description: 'dashboard.shortcuts.support-sla.description',
        sectionId: 'tickets',
      },
    ],
  },
  {
    id: 'moderation',
    label: 'dashboard.taskGroups.moderation.label',
    description: 'dashboard.taskGroups.moderation.description',
    icon: ShieldCheck,
    sections: ['modlogs', 'activity'],
    shortcuts: [
      {
        id: 'moderation-log',
        label: 'dashboard.shortcuts.moderation-log.label',
        description: 'dashboard.shortcuts.moderation-log.description',
        sectionId: 'modlogs',
      },
      {
        id: 'moderation-rules',
        label: 'dashboard.shortcuts.moderation-rules.label',
        description: 'dashboard.shortcuts.moderation-rules.description',
        sectionId: 'system',
      },
      {
        id: 'moderation-staff',
        label: 'dashboard.shortcuts.moderation-staff.label',
        description: 'dashboard.shortcuts.moderation-staff.description',
        sectionId: 'activity',
      },
    ],
  },
  {
    id: 'system',
    label: 'dashboard.taskGroups.system.label',
    description: 'dashboard.taskGroups.system.description',
    icon: Settings2,
    sections: ['system', 'analytics'],
    shortcuts: [
      {
        id: 'system-sync',
        label: 'dashboard.shortcuts.system-sync.label',
        description: 'dashboard.shortcuts.system-sync.description',
        sectionId: 'system',
      },
      {
        id: 'system-backups',
        label: 'dashboard.shortcuts.system-backups.label',
        description: 'dashboard.shortcuts.system-backups.description',
        sectionId: 'system',
      },
      {
        id: 'system-diagnostics',
        label: 'dashboard.shortcuts.system-diagnostics.label',
        description: 'dashboard.shortcuts.system-diagnostics.description',
        sectionId: 'system',
      },
      {
        id: 'system-analytics',
        label: 'dashboard.shortcuts.system-analytics.label',
        description: 'dashboard.shortcuts.system-analytics.description',
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

import { describe, expect, it } from 'vitest';
import {
  defaultGuildConfig,
  defaultGuildSyncStatus,
} from './schemas';
import type {
  DashboardGuild,
  GuildBackupManifest,
  GuildConfig,
  GuildConfigMutation,
  GuildSyncStatus,
} from './types';
import {
  getDashboardChecklist,
  getDashboardQuickActions,
  getDashboardSectionStates,
} from './utils';

function createGuild(overrides: Partial<DashboardGuild> = {}): DashboardGuild {
  return {
    guildId: 'guild-1',
    guildName: 'TON618',
    guildIcon: null,
    permissionsRaw: '8',
    canManage: true,
    isOwner: true,
    botInstalled: true,
    memberCount: 128,
    premiumTier: '2',
    botLastSeenAt: '2026-03-17T22:00:00.000Z',
    lastSyncedAt: '2026-03-17T22:00:00.000Z',
    ...overrides,
  };
}

function createConfig(overrides: Partial<GuildConfig> = {}): GuildConfig {
  return {
    guildId: 'guild-1',
    ...defaultGuildConfig,
    ...overrides,
  };
}

function createSyncStatus(overrides: Partial<GuildSyncStatus> = {}): GuildSyncStatus {
  return {
    ...defaultGuildSyncStatus,
    guildId: 'guild-1',
    bridgeStatus: 'healthy',
    ...overrides,
  };
}

describe('getDashboardSectionStates', () => {
  it('marks configured sections as active and surfaces actionable issues', () => {
    const config = createConfig({
      generalSettings: {
        ...defaultGuildConfig.generalSettings,
        timezone: '',
        commandMode: 'prefix',
        prefix: '',
      },
      serverRolesChannelsSettings: {
        ...defaultGuildConfig.serverRolesChannelsSettings,
        dashboardChannelId: '1111111111111111',
        ticketPanelChannelId: '2222222222222222',
        logsChannelId: '3333333333333333',
        supportRoleId: '4444444444444444',
        adminRoleId: '5555555555555555',
      },
      ticketsSettings: {
        ...defaultGuildConfig.ticketsSettings,
        maxTickets: 3,
        slaMinutes: 0,
        autoAssignEnabled: true,
      },
    });

    const states = getDashboardSectionStates(
      config,
      createGuild(),
      createSyncStatus({ bridgeStatus: 'degraded' }),
      [],
      [],
    );

    const general = states.find((state) => state.sectionId === 'general');
    const tickets = states.find((state) => state.sectionId === 'tickets');
    const system = states.find((state) => state.sectionId === 'system');

    expect(general?.status).toBe('basic');
    expect(general?.messages).toContain('Falta elegir la zona horaria principal del servidor.');
    expect(tickets?.messages).toContain('Define un SLA base para saber cuando un ticket necesita seguimiento.');
    expect(system?.status).toBe('needs_attention');
    expect(system?.messages).toContain('La sincronizacion funciona, pero llega con retraso.');
  });
});

describe('getDashboardChecklist', () => {
  it('keeps install and backup steps visible until the server is really ready', () => {
    const guild = createGuild({ botInstalled: false });
    const config = createConfig();
    const syncStatus = createSyncStatus({ bridgeStatus: 'error' });
    const backups: GuildBackupManifest[] = [];
    const mutations: GuildConfigMutation[] = [];

    const sectionStates = getDashboardSectionStates(config, guild, syncStatus, backups, mutations);
    const checklist = getDashboardChecklist(guild, sectionStates, backups, syncStatus);

    const selectServer = checklist.find((step) => step.id === 'select-server');
    const backup = checklist.find((step) => step.id === 'backup');
    const sync = checklist.find((step) => step.id === 'sync');

    expect(selectServer?.complete).toBe(false);
    expect(selectServer?.status).toBe('basic');
    expect(backup?.complete).toBe(false);
    expect(sync?.status).toBe('basic');
    expect(sync?.summary).toBe('El bot todavia no esta instalado en este servidor.');
  });
});

describe('getDashboardQuickActions', () => {
  it('prioritizes the next checklist step and avoids duplicate section actions', () => {
    const config = createConfig({
      serverRolesChannelsSettings: {
        ...defaultGuildConfig.serverRolesChannelsSettings,
        dashboardChannelId: '1111111111111111',
      },
      ticketsSettings: {
        ...defaultGuildConfig.ticketsSettings,
        maxTickets: 3,
        slaMinutes: 0,
      },
    });

    const sectionStates = getDashboardSectionStates(
      config,
      createGuild(),
      createSyncStatus({ bridgeStatus: 'degraded' }),
      [],
      [],
    );
    const checklist = getDashboardChecklist(createGuild(), sectionStates, [], createSyncStatus({ bridgeStatus: 'degraded' }));
    const actions = getDashboardQuickActions(sectionStates, checklist, createSyncStatus({ bridgeStatus: 'degraded' }));

    expect(actions[0]?.id).toBe(`checklist-${checklist.find((step) => !step.complete)?.id}`);
    expect(actions.some((action) => action.sectionId === 'system')).toBe(true);
    expect(new Set(actions.map((action) => action.sectionId)).size).toBe(actions.length);
  });
});

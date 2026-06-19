import { describe, expect, it, vi } from 'vitest';
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
  isGuildAccessFresh,
  normalizeGuildConfig,
  type DashboardChecklistStep,
  type DashboardSectionState,
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

function createBackup(overrides: Partial<GuildBackupManifest> = {}): GuildBackupManifest {
  return {
    backupId: 'backup-1',
    guildId: 'guild-1',
    actorUserId: 'user-1',
    source: 'manual',
    schemaVersion: 1,
    exportedAt: '2026-03-17T20:00:00.000Z',
    createdAt: '2026-03-17T20:00:00.000Z',
    metadata: {},
    ...overrides,
  };
}

function createMutation(overrides: Partial<GuildConfigMutation> = {}): GuildConfigMutation {
  return {
    id: 'mutation-1',
    guildId: 'guild-1',
    actorUserId: 'user-1',
    mutationType: 'config',
    section: 'system',
    status: 'pending',
    requestedPayload: {},
    appliedPayload: null,
    metadata: {},
    errorMessage: null,
    requestedAt: '2026-03-17T21:00:00.000Z',
    appliedAt: null,
    failedAt: null,
    supersededAt: null,
    updatedAt: '2026-03-17T21:00:00.000Z',
    ...overrides,
  };
}

function getState(
  states: ReturnType<typeof getDashboardSectionStates>,
  sectionId: ReturnType<typeof getDashboardSectionStates>[number]['sectionId'],
) {
  const state = states.find((entry) => entry.sectionId === sectionId);
  expect(state).toBeDefined();
  return state!;
}

function getStep(
  checklist: ReturnType<typeof getDashboardChecklist>,
  id: string,
) {
  const step = checklist.find((entry) => entry.id === id);
  expect(step).toBeDefined();
  return step!;
}

function createSectionState(overrides: Partial<DashboardSectionState>): DashboardSectionState {
  return {
    sectionId: 'overview',
    label: 'Overview',
    description: '',
    groupId: 'home',
    status: 'active',
    progress: 1,
    summary: 'Activo',
    messages: [],
    ...overrides,
  };
}

function createChecklistStep(overrides: Partial<DashboardChecklistStep>): DashboardChecklistStep {
  return {
    id: 'step-1',
    label: 'Paso',
    description: 'Descripcion',
    sectionId: 'overview',
    status: 'not_configured',
    complete: false,
    summary: 'Pendiente',
    ...overrides,
  };
}

describe('getDashboardSectionStates', () => {
  it('normaliza preferencias legacy de moderacion sin descartar la configuracion completa', () => {
    const config = normalizeGuildConfig('guild-1', {
      guild_id: 'guild-1',
      general_settings: defaultGuildConfig.generalSettings,
      server_roles_channels_settings: defaultGuildConfig.serverRolesChannelsSettings,
      tickets_settings: defaultGuildConfig.ticketsSettings,
      verification_settings: defaultGuildConfig.verificationSettings,
      welcome_settings: defaultGuildConfig.welcomeSettings,
      suggestion_settings: defaultGuildConfig.suggestionSettings,
      modlog_settings: defaultGuildConfig.modlogSettings,
      command_settings: defaultGuildConfig.commandSettings,
      system_settings: defaultGuildConfig.systemSettings,
      dashboard_preferences: {
        ...defaultGuildConfig.dashboardPreferences,
        defaultSection: 'moderation',
      },
    });

    expect(config.dashboardPreferences.defaultSection).toBe('system');
    expect(config.generalSettings.language).toBe(defaultGuildConfig.generalSettings.language);
  });

  it('surfacea bloqueos base cuando el bot no esta instalado y no hay backup', () => {
    const states = getDashboardSectionStates(
      createConfig(),
      createGuild({ botInstalled: false }),
      createSyncStatus({ bridgeStatus: 'error' }),
      [],
      [],
    );

    const system = getState(states, 'system');

    expect(system.status).toBe('basic');
    expect(system.messages).toContain('El bot todavía no está instalado en este servidor.');
    expect(system.messages).toContain('El bot está conectado, pero la sincronización reporta errores.');
    expect(system.messages).toContain('Todavía no existe un backup inicial.');
  });

  it('distingue sincronizacion healthy, degraded y error sin cambiar el contrato de estado', () => {
    const baseConfig = createConfig({
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
        slaMinutes: 15,
      },
    });
    const backups = [createBackup()];

    const healthy = getState(
      getDashboardSectionStates(baseConfig, createGuild(), createSyncStatus({ bridgeStatus: 'healthy' }), backups, []),
      'system',
    );
    const degraded = getState(
      getDashboardSectionStates(baseConfig, createGuild(), createSyncStatus({ bridgeStatus: 'degraded' }), backups, []),
      'system',
    );
    const errored = getState(
      getDashboardSectionStates(baseConfig, createGuild(), createSyncStatus({ bridgeStatus: 'error' }), backups, []),
      'system',
    );

    expect(healthy.status).toBe('active');
    expect(healthy.messages).toEqual([]);
    expect(degraded.status).toBe('needs_attention');
    expect(degraded.summary).toBe('La sincronización funciona, pero llega con retraso.');
    expect(errored.status).toBe('needs_attention');
    expect(errored.summary).toBe('El bot está conectado, pero la sincronización reporta errores.');
  });

  it('marca tickets y roles/canales como incompletos con mensajes accionables', () => {
    const states = getDashboardSectionStates(
      createConfig({
        serverRolesChannelsSettings: {
          ...defaultGuildConfig.serverRolesChannelsSettings,
          dashboardChannelId: '1111111111111111',
        },
        ticketsSettings: {
          ...defaultGuildConfig.ticketsSettings,
          slaMinutes: 0,
          autoAssignEnabled: true,
          dailySlaReportEnabled: true,
          slaEscalationEnabled: true,
        },
      }),
      createGuild(),
      createSyncStatus(),
      [],
      [],
    );

    const roles = getState(states, 'server_roles');
    const tickets = getState(states, 'tickets');

    expect(roles.messages).toContain('Falta elegir el canal donde se publicará el panel de tickets.');
    expect(roles.messages).toContain('Aún no has seleccionado un rol de soporte.');
    expect(roles.messages).toContain('Falta definir el rol administrador del bot.');
    expect(tickets.messages).toContain('Falta elegir el canal de tickets.');
    expect(tickets.messages).toContain('Define un SLA base para saber cuándo un ticket necesita seguimiento.');
    expect(tickets.messages).toContain('La autoasignación está activa, pero todavía no existe un rol base de soporte.');
    expect(tickets.messages).toContain('El escalado de SLA está activo pero no tiene rol ni canal de aviso.');
    expect(tickets.messages).toContain('El reporte diario está activo pero no tiene canal asignado.');
  });

  it('refleja verification, welcome y comandos invalidos con mensajes coherentes', () => {
    const states = getDashboardSectionStates(
      createConfig({
        generalSettings: {
          ...defaultGuildConfig.generalSettings,
          timezone: '',
          commandMode: 'prefix',
          prefix: '',
        },
        verificationSettings: {
          ...defaultGuildConfig.verificationSettings,
          enabled: true,
          channelId: null,
          verifiedRoleId: null,
          mode: 'question',
          questionAnswer: '',
        },
        welcomeSettings: {
          ...defaultGuildConfig.welcomeSettings,
          welcomeEnabled: true,
          welcomeChannelId: null,
          welcomeDm: false,
          welcomeAutoroleId: null,
        },
      }),
      createGuild(),
      createSyncStatus(),
      [],
      [],
    );

    const verification = getState(states, 'verification');
    const welcome = getState(states, 'welcome');
    const commands = getState(states, 'commands');
    const general = getState(states, 'general');

    expect(verification.messages).toContain('La verificación está activa pero no tiene canal asignado.');
    expect(verification.messages).toContain('La verificación necesita un rol para miembros verificados.');
    expect(verification.messages).toContain('La verificación por pregunta necesita una respuesta correcta.');
    expect(welcome.messages).toContain('La bienvenida está activa pero no tiene canal asignado.');
    expect(welcome.messages).toContain('Puedes completar la experiencia asignando un autorrol de entrada.');
    expect(welcome.messages).toContain('La bienvenida ya publica mensajes, pero todavía no acompaña al miembro con DM o autorrol.');
    expect(commands.messages).toContain('Elegiste comandos por prefijo, pero aún no definiste el prefijo.');
    expect(commands.messages).toContain('Falta elegir una zona horaria base para reportes y automatizaciones.');
    expect(general.messages).toContain('Falta elegir una zona horaria base para reportes y automatizaciones.');
  });

  it('usa los contadores de syncStatus para mutations fallidas y pendientes cuando existen', () => {
    const states = getDashboardSectionStates(
      createConfig(),
      createGuild(),
      createSyncStatus({
        bridgeStatus: 'degraded',
        failedMutations: 2,
        pendingMutations: 3,
      }),
      [],
      [
        createMutation({ status: 'failed' }),
        createMutation({ id: 'mutation-2', status: 'pending' }),
        createMutation({ id: 'mutation-3', status: 'pending' }),
        createMutation({ id: 'mutation-4', status: 'pending' }),
        createMutation({ id: 'mutation-5', status: 'pending' }),
      ],
    );

    const system = getState(states, 'system');

    expect(system.messages).toContain('Hay 2 cambios que no pudo aplicar el bot.');
    expect(system.messages).toContain('Hay 3 cambios pendientes por aplicar.');
  });
});

describe('getDashboardChecklist', () => {
  it('mantiene visibles los pasos de instalacion, backup y sincronizacion hasta que el servidor este listo', () => {
    const guild = createGuild({ botInstalled: false });
    const sectionStates = getDashboardSectionStates(
      createConfig(),
      guild,
      createSyncStatus({ bridgeStatus: 'error' }),
      [],
      [],
    );

    const checklist = getDashboardChecklist(guild, sectionStates, [], createSyncStatus({ bridgeStatus: 'error' }));

    expect(getStep(checklist, 'select-server')).toMatchObject({
      complete: false,
      status: 'basic',
      summary: 'El servidor ya fue elegido, pero el bot aún no está dentro.',
    });
    expect(getStep(checklist, 'backup')).toMatchObject({
      complete: false,
      status: 'not_configured',
      summary: 'Todavía no existe una copia segura inicial.',
    });
    expect(getStep(checklist, 'sync')).toMatchObject({
      complete: false,
      status: 'basic',
      summary: 'El bot todavía no está instalado en este servidor.',
    });
  });

  it('apunta el paso de member experience a welcome cuando welcome requiere atencion', () => {
    const states = getDashboardSectionStates(
      createConfig({
        welcomeSettings: {
          ...defaultGuildConfig.welcomeSettings,
          welcomeEnabled: true,
          welcomeChannelId: null,
        },
      }),
      createGuild(),
      createSyncStatus(),
      [],
      [],
    );

    const checklist = getDashboardChecklist(createGuild(), states, [], createSyncStatus());
    const memberExperience = getStep(checklist, 'member-experience');

    expect(memberExperience.sectionId).toBe('welcome');
    expect(memberExperience.status).toBe('active');
    expect(memberExperience.summary).toBe('La bienvenida está activa pero no tiene canal asignado.');
  });

  it('mantiene completa la experiencia de miembros si verification ya esta activa aunque welcome siga pendiente', () => {
    const states = getDashboardSectionStates(
      createConfig({
        verificationSettings: {
          ...defaultGuildConfig.verificationSettings,
          enabled: true,
          channelId: '1111111111111111',
          verifiedRoleId: '2222222222222222',
        },
        welcomeSettings: {
          ...defaultGuildConfig.welcomeSettings,
          welcomeEnabled: true,
          welcomeChannelId: null,
        },
      }),
      createGuild(),
      createSyncStatus(),
      [],
      [],
    );

    const checklist = getDashboardChecklist(createGuild(), states, [], createSyncStatus());
    const memberExperience = getStep(checklist, 'member-experience');

    expect(memberExperience.complete).toBe(true);
    expect(memberExperience.status).toBe('active');
    expect(memberExperience.summary).toBe('La bienvenida está activa pero no tiene canal asignado.');
  });

  it('mantiene backup y sync activos cuando ya existen backup y bridge healthy', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-18T12:00:00.000Z'));

    const backups = [createBackup({ createdAt: '2026-03-18T10:00:00.000Z' })];
    const sectionStates = getDashboardSectionStates(
      createConfig(),
      createGuild(),
      createSyncStatus({ bridgeStatus: 'healthy' }),
      backups,
      [],
    );

    const checklist = getDashboardChecklist(createGuild(), sectionStates, backups, createSyncStatus({ bridgeStatus: 'healthy' }));

    expect(getStep(checklist, 'backup')).toMatchObject({
      complete: true,
      status: 'active',
      summary: 'Ya existe una copia segura desde hace 2 horas.',
    });
    expect(getStep(checklist, 'sync')).toMatchObject({
      complete: true,
      status: 'active',
      summary: 'Activo',
    });

    vi.useRealTimers();
  });
});

describe('getDashboardQuickActions', () => {
  it('prioriza el siguiente paso recomendado y evita duplicados por seccion', () => {
    const config = createConfig({
      serverRolesChannelsSettings: {
        ...defaultGuildConfig.serverRolesChannelsSettings,
        dashboardChannelId: '1111111111111111',
      },
      ticketsSettings: {
        ...defaultGuildConfig.ticketsSettings,
        slaMinutes: 0,
      },
    });

    const syncStatus = createSyncStatus({ bridgeStatus: 'degraded', failedMutations: 1 });
    const sectionStates = getDashboardSectionStates(config, createGuild(), syncStatus, [], []);
    const checklist = getDashboardChecklist(createGuild(), sectionStates, [], syncStatus);
    const actions = getDashboardQuickActions(sectionStates, checklist, syncStatus);

    expect(actions[0]).toMatchObject({
      id: `checklist-${checklist.find((step) => !step.complete)?.id}`,
    });
    expect(actions.map((action) => action.sectionId)).toEqual(['server_roles', 'system', 'tickets', 'inbox']);
    expect(new Set(actions.map((action) => action.sectionId)).size).toBe(actions.length);
  });

  it('ofrece revisar sincronizacion cuando el bridge tiene errores y system no fue ocupado por la checklist', () => {
    const config = createConfig({
      generalSettings: {
        ...defaultGuildConfig.generalSettings,
        timezone: '',
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
        slaMinutes: 15,
      },
    });
    const backups = [createBackup()];
    const syncStatus = createSyncStatus({ bridgeStatus: 'error' });
    const sectionStates = getDashboardSectionStates(config, createGuild(), syncStatus, backups, []);
    const checklist = getDashboardChecklist(createGuild(), sectionStates, backups, syncStatus);
    const actions = getDashboardQuickActions(sectionStates, checklist, syncStatus);

    expect(actions).toContainEqual({
      id: 'review-sync',
      label: 'Revisar estado del bot',
      description: 'El bot necesita revisión antes de seguir aplicando cambios.',
      sectionId: 'system',
      priority: 98,
    });
  });

  it('sugiere preparar acceso de miembros cuando verification y welcome siguen sin configurar', () => {
    const sectionStates: DashboardSectionState[] = [
      createSectionState({
        sectionId: 'verification',
        label: 'Verificacion',
        groupId: 'community',
        status: 'not_configured',
        progress: 0,
        summary: 'Falta activar una puerta de entrada.',
      }),
      createSectionState({
        sectionId: 'welcome',
        label: 'Bienvenida',
        groupId: 'community',
        status: 'not_configured',
        progress: 0,
        summary: 'Falta activar una experiencia de bienvenida.',
      }),
      createSectionState({
        sectionId: 'tickets',
        label: 'Tickets',
        groupId: 'support',
        status: 'active',
      }),
      createSectionState({
        sectionId: 'server_roles',
        label: 'Roles',
        groupId: 'setup',
        status: 'active',
      }),
      createSectionState({
        sectionId: 'system',
        label: 'Sistema',
        groupId: 'system',
        status: 'active',
      }),
    ];
    const checklist: DashboardChecklistStep[] = [
      createChecklistStep({
        id: 'language-and-commands',
        label: 'Configurar idioma y comandos',
        sectionId: 'general',
        complete: true,
        status: 'active',
        summary: 'Activo',
      }),
    ];
    const actions = getDashboardQuickActions(sectionStates, checklist, createSyncStatus());

    expect(actions).toContainEqual({
      id: 'member-experience',
      label: 'Definir llegada de miembros',
      description: 'Activa bienvenida o verificación para que el acceso no quede improvisado.',
      sectionId: 'verification',
      priority: 88,
    });
  });
});

describe('isGuildAccessFresh', () => {
  it('solo acepta accesos sincronizados dentro de la ventana permitida', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-03T18:00:00.000Z'));

    expect(isGuildAccessFresh('2026-04-03T17:00:00.000Z')).toBe(true);
    expect(isGuildAccessFresh('2026-04-02T17:59:59.000Z')).toBe(false);
    expect(isGuildAccessFresh(null)).toBe(false);
    expect(isGuildAccessFresh('not-a-date')).toBe(false);

    vi.useRealTimers();
  });
});

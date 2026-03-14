import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DISCORD_ADMINISTRATOR = 8n;
const DISCORD_MANAGE_GUILD = 32n;

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  permissions?: string;
  permissions_new?: string;
}

interface InstalledGuildRow {
  guild_id: string;
  guild_name: string;
  guild_icon: string | null;
  member_count: number | null;
  premium_tier: string | null;
  last_heartbeat_at: string | null;
}

interface ExistingAccessRow {
  id: string;
  guild_id: string;
}

type BotGuildRow = InstalledGuildRow;

interface DiscordGuildDetails {
  id: string;
  name: string;
  icon: string | null;
  owner_id: string;
}

interface DiscordGuildMember {
  roles: string[];
}

interface DiscordRole {
  id: string;
  permissions: string;
}

function hasManageablePermissions(permissionsRaw: string | null | undefined, isOwner = false): boolean {
  if (isOwner) {
    return true;
  }

  try {
    const permissions = BigInt(permissionsRaw ?? '0');
    return (
      (permissions & DISCORD_ADMINISTRATOR) === DISCORD_ADMINISTRATOR
      || (permissions & DISCORD_MANAGE_GUILD) === DISCORD_MANAGE_GUILD
    );
  } catch {
    return false;
  }
}

function resolveDiscordUserId(user: { user_metadata?: Record<string, unknown> | null }): string | null {
  const metadata = user.user_metadata && typeof user.user_metadata === 'object'
    ? user.user_metadata
    : {};

  const providerId = typeof metadata.provider_id === 'string' ? metadata.provider_id : null;
  const subject = typeof metadata.sub === 'string' ? metadata.sub : null;

  return providerId ?? subject;
}

async function fetchDiscordResource<T>(
  path: string,
  token: string,
  authScheme: 'Bearer' | 'Bot' = 'Bearer',
): Promise<T | null> {
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    headers: {
      Authorization: `${authScheme} ${token}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return await response.json() as T;
}

async function resolveManageableGuildsWithBotToken(
  adminClient: ReturnType<typeof createClient>,
  discordUserId: string,
  botToken: string,
): Promise<DiscordGuild[]> {
  const { data: botGuilds, error } = await adminClient
    .from('bot_guilds')
    .select('guild_id, guild_name, guild_icon, member_count, premium_tier, last_heartbeat_at')
    .returns<BotGuildRow[]>();

  if (error) {
    throw error;
  }

  const manageableGuilds: DiscordGuild[] = [];

  for (const installedGuild of botGuilds ?? []) {
    const [guild, member, roles] = await Promise.all([
      fetchDiscordResource<DiscordGuildDetails>(`/guilds/${installedGuild.guild_id}`, botToken, 'Bot'),
      fetchDiscordResource<DiscordGuildMember>(`/guilds/${installedGuild.guild_id}/members/${discordUserId}`, botToken, 'Bot'),
      fetchDiscordResource<DiscordRole[]>(`/guilds/${installedGuild.guild_id}/roles`, botToken, 'Bot'),
    ]);

    if (!guild || !member || !roles) {
      continue;
    }

    const roleMap = new Map(roles.map((role) => [role.id, role] as const));
    let permissions = 0n;

    for (const roleId of member.roles ?? []) {
      const role = roleMap.get(roleId);
      if (role?.permissions) {
        permissions |= BigInt(role.permissions);
      }
    }

    const everyoneRole = roleMap.get(guild.id);
    if (everyoneRole?.permissions) {
      permissions |= BigInt(everyoneRole.permissions);
    }

    const isOwner = guild.owner_id === discordUserId;
    const permissionsRaw = permissions.toString();
    if (!hasManageablePermissions(permissionsRaw, isOwner)) {
      continue;
    }

    manageableGuilds.push({
      id: guild.id,
      name: guild.name || installedGuild.guild_name,
      icon: guild.icon ?? installedGuild.guild_icon,
      owner: isOwner,
      permissions_new: permissionsRaw,
    });
  }

  return manageableGuilds;
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authHeader = request.headers.get('Authorization');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase environment variables.');
    }

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { providerToken } = await request.json();
    if (typeof providerToken !== 'string' || !providerToken) {
      return new Response(JSON.stringify({ error: 'Missing Discord provider token.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid Supabase session.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const discordResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${providerToken}`,
      },
    });

    if (!discordResponse.ok) {
      return new Response(JSON.stringify({ error: 'Discord guild sync failed.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const discordGuilds = (await discordResponse.json()) as DiscordGuild[];
    let manageableGuilds = discordGuilds.filter((guild) => {
      const permissionsRaw = guild.permissions_new ?? guild.permissions ?? '0';
      return hasManageablePermissions(permissionsRaw, Boolean(guild.owner));
    });

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const nowIso = new Date().toISOString();

    if (!manageableGuilds.length) {
      const discordUserId = resolveDiscordUserId(user);
      const discordBotToken = Deno.env.get('DISCORD_BOT_TOKEN');

      if (discordUserId && discordBotToken) {
        manageableGuilds = await resolveManageableGuildsWithBotToken(
          adminClient,
          discordUserId,
          discordBotToken,
        );
      }
    }

    if (!manageableGuilds.length) {
      await adminClient.from('user_guild_access').delete().eq('user_id', user.id);

      return new Response(JSON.stringify({
        guilds: [],
        syncedAt: nowIso,
        manageableCount: 0,
        installedCount: 0,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const guildIds = manageableGuilds.map((guild) => guild.id);
    const { data: installedGuilds, error: installedError } = await adminClient
      .from('bot_guilds')
      .select('guild_id, guild_name, guild_icon, member_count, premium_tier, last_heartbeat_at')
      .in('guild_id', guildIds)
      .returns<InstalledGuildRow[]>();

    if (installedError) {
      throw installedError;
    }

    const installedById = new Map(
      (installedGuilds ?? []).map((guild: InstalledGuildRow) => [guild.guild_id, guild] as const),
    );

    const accessRows = manageableGuilds.map((guild) => {
      const permissionsRaw = guild.permissions_new ?? guild.permissions ?? '0';
      const installedGuild = installedById.get(guild.id);

      return {
        user_id: user.id,
        guild_id: guild.id,
        guild_name: guild.name,
        guild_icon: guild.icon,
        permissions_raw: permissionsRaw,
        can_manage: true,
        is_owner: Boolean(guild.owner),
        bot_installed: Boolean(installedGuild),
        member_count: installedGuild?.member_count ?? null,
        premium_tier: installedGuild?.premium_tier ?? null,
        bot_last_seen_at: installedGuild?.last_heartbeat_at ?? null,
        last_synced_at: nowIso,
      };
    });

    const { error: upsertError } = await adminClient
      .from('user_guild_access')
      .upsert(accessRows, { onConflict: 'user_id,guild_id' });

    if (upsertError) {
      throw upsertError;
    }

    const guildIdSet = new Set(guildIds);
    const { data: existingRows } = await adminClient
      .from('user_guild_access')
      .select('id, guild_id')
      .eq('user_id', user.id)
      .returns<ExistingAccessRow[]>();

    const staleIds = (existingRows ?? [])
      .filter((row: ExistingAccessRow) => !guildIdSet.has(row.guild_id))
      .map((row: ExistingAccessRow) => row.id);

    if (staleIds.length) {
      await adminClient.from('user_guild_access').delete().in('id', staleIds);
    }

    const responseGuilds = accessRows
      .sort((left, right) => {
        if (left.bot_installed !== right.bot_installed) {
          return left.bot_installed ? -1 : 1;
        }

        return left.guild_name.localeCompare(right.guild_name);
      })
      .map((guild) => ({
        guildId: guild.guild_id,
        guildName: guild.guild_name,
        guildIcon: guild.guild_icon,
        permissionsRaw: guild.permissions_raw,
        canManage: guild.can_manage,
        isOwner: guild.is_owner,
        botInstalled: guild.bot_installed,
        memberCount: guild.member_count,
        premiumTier: guild.premium_tier,
        botLastSeenAt: guild.bot_last_seen_at,
        lastSyncedAt: guild.last_synced_at,
      }));

    return new Response(JSON.stringify({
      guilds: responseGuilds,
      syncedAt: nowIso,
      manageableCount: responseGuilds.length,
      installedCount: responseGuilds.filter((guild) => guild.botInstalled).length,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected sync error.';

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

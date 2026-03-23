# TON618 Ops Console Beta Checklist

## Goal

Validate TON618 as an ops console for Discord staff instead of a generic bot.

## Entry criteria

- The server has active staff and real support load.
- The bot is installed and visible in the dashboard.
- Discord OAuth and Supabase auth complete without manual fixes.
- The guild snapshot loads with config, inbox, sync status and playbooks.

## Beta setup per server

1. Install the bot and confirm `/health` responds.
2. Sync the guild into the dashboard and confirm `guild_sync_status` is healthy or degraded but readable.
3. Configure:
   - support role
   - ticket panel channel
   - logs channel
   - base SLA
   - escalation role or channel
4. Open the inbox and verify:
   - tickets appear
   - macros appear
   - customer history appears
   - playbook recommendations appear
5. Confirm at least these playbooks are active:
   - support triage
   - SLA escalation
   - incident mode
   - customer recovery

## Weekly metrics

- First response time
- Tickets in warning
- Tickets breached
- Pending playbook recommendations
- Confirmed vs dismissed recommendations
- Active inbox sessions per week
- Incident mode activations

## QA path before admitting a server

- Login with Discord
- Guild switch
- Snapshot refresh
- Ticket action from dashboard
- Recommendation confirm/dismiss
- Macro post from recommendation
- Build fingerprint visible from bot health

## Exit criteria for beta

- 3+ servers use the inbox weekly.
- 3+ servers generate playbook recommendations from real ticket flow.
- No auth regressions across Discord OAuth and Supabase sessions.
- No config loss during syncs or restarts.
- Staff reports that the dashboard reduces response friction versus previous tooling.

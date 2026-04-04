import { z } from 'zod';
import type { DashboardSectionId, ConfigMutationSectionId } from '../types';

export const dashboardSectionIds = [
  'overview',
  'general',
  'server_roles',
  'tickets',
  'verification',
  'welcome',
  'suggestions',
  'modlogs',
  'commands',
  'system',
  'activity',
  'analytics',
  'playbooks',
  'inbox',
] as const satisfies readonly DashboardSectionId[];

export const configMutationSectionIds = [
  'general',
  'server_roles_channels',
  'tickets',
  'verification',
  'welcome',
  'suggestions',
  'modlogs',
  'commands',
  'system',
] as const satisfies readonly ConfigMutationSectionId[];

export function emptyStringToNull(value: unknown) {
  if (typeof value === 'string' && !value.trim()) {
    return null;
  }

  return value;
}

export const discordIdSchema = z.preprocess(
  emptyStringToNull,
  z.string().trim().regex(/^\d{16,22}$/).nullable(),
);

export const textOrNullSchema = z.preprocess(
  emptyStringToNull,
  z.string().trim().max(1000).nullable(),
);

export const urlOrNullSchema = z.preprocess(
  emptyStringToNull,
  z.string().trim().url().nullable(),
);

export const stringRecordSchema = z.record(z.string(), z.number().int().nonnegative());

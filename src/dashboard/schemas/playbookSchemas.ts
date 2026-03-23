import { z } from 'zod';
import { ticketInboxItemSchema, ticketMacroSchema, ticketWorkflowStatusSchema } from './ticketSchemas';

export const playbookTierSchema = z.enum(['free', 'pro', 'enterprise']);
export const playbookExecutionModeSchema = z.enum(['assistive', 'manual', 'guided']);
export const playbookRecommendationStatusSchema = z.enum(['pending', 'applied', 'dismissed']);
export const playbookRiskLevelSchema = z.enum(['new', 'returning', 'watch']);
export const playbookToneSchema = z.enum(['neutral', 'info', 'success', 'warning', 'danger']);

export const playbookDefinitionSchema = z.object({
  guildId: z.string().min(1),
  playbookId: z.string().min(1),
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  tier: playbookTierSchema,
  executionMode: playbookExecutionModeSchema,
  summary: z.string().min(1),
  triggerSummary: z.string().min(1),
  isEnabled: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
  updatedAt: z.string().nullable(),
});

export const playbookRunSchema = z.object({
  runId: z.string().min(1),
  guildId: z.string().min(1),
  playbookId: z.string().min(1),
  ticketId: z.string().min(1),
  userId: z.string().min(1),
  status: playbookRecommendationStatusSchema,
  tone: playbookToneSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  reason: z.string().min(1),
  suggestedAction: z.string().nullable(),
  suggestedPriority: ticketInboxItemSchema.shape.priority.nullable(),
  suggestedStatus: ticketWorkflowStatusSchema.nullable(),
  suggestedMacroId: ticketMacroSchema.shape.macroId.nullable(),
  confidence: z.number().min(0).max(1),
  sortOrder: z.number().int().nonnegative(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string().min(1),
  updatedAt: z.string().nullable(),
});

export const customerMemorySchema = z.object({
  guildId: z.string().min(1),
  userId: z.string().min(1),
  displayLabel: z.string().min(1),
  totalTickets: z.number().int().nonnegative(),
  openTickets: z.number().int().nonnegative(),
  resolvedTickets: z.number().int().nonnegative(),
  breachedTickets: z.number().int().nonnegative(),
  recentTags: z.array(z.string().min(1)),
  lastTicketAt: z.string().nullable(),
  lastResolvedAt: z.string().nullable(),
  riskLevel: playbookRiskLevelSchema,
  summary: z.string().min(1),
  updatedAt: z.string().nullable(),
});

export const ticketRecommendationSchema = z.object({
  recommendationId: z.string().min(1),
  guildId: z.string().min(1),
  ticketId: z.string().min(1),
  userId: z.string().min(1),
  playbookId: z.string().min(1),
  status: playbookRecommendationStatusSchema,
  tone: playbookToneSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  reason: z.string().min(1),
  suggestedAction: z.string().nullable(),
  suggestedPriority: ticketInboxItemSchema.shape.priority.nullable(),
  suggestedStatus: ticketWorkflowStatusSchema.nullable(),
  suggestedMacroId: ticketMacroSchema.shape.macroId.nullable(),
  confidence: z.number().min(0).max(1),
  customerRiskLevel: playbookRiskLevelSchema,
  customerSummary: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string().min(1),
  updatedAt: z.string().nullable(),
});

export const playbookWorkspaceSchema = z.object({
  definitions: z.array(playbookDefinitionSchema),
  runs: z.array(playbookRunSchema),
  customerMemory: z.array(customerMemorySchema),
  recommendations: z.array(ticketRecommendationSchema),
});

import { z } from 'zod'
import { baseEntitySchema } from './common.model'
import { taskPersonSchema, taskTagSchema } from './taskOptions'

export const taskPrioritySchema = z.enum(['low', 'medium', 'high'])
export type TaskPriority = z.infer<typeof taskPrioritySchema>

export const taskStatusSchema = z.enum(['pending', 'in_progress', 'done'])
export type TaskStatus = z.infer<typeof taskStatusSchema>

export const taskKindSchema = z.enum(['simple', 'full'])
export type TaskKind = z.infer<typeof taskKindSchema>

export const taskUrgencySchema = z.enum(['overdue', 'warning', 'ok', 'none'])
export type TaskUrgencyLevel = z.infer<typeof taskUrgencySchema>

export const blockRecordSchema = z.object({
  id: z.uuid(),
  reason: z.string().min(1, 'Informe o motivo do bloqueio'),
  blockedAt: z.coerce.date(),
  unblockedAt: z.coerce.date().optional(),
})
export type BlockRecord = z.infer<typeof blockRecordSchema>

export const taskLinkSchema = z.object({
  id: z.uuid(),
  label: z.string().optional(),
  url: z.url('Informe uma URL válida'),
})
export type TaskLink = z.infer<typeof taskLinkSchema>

export const taskHistoryActionSchema = z.enum([
  'created',
  'status_changed',
  'priority_changed',
  'deadline_changed',
  'blocked',
  'unblocked',
  'edited',
  'completed',
])
export type TaskHistoryAction = z.infer<typeof taskHistoryActionSchema>

export const taskHistoryEntrySchema = z.object({
  id: z.uuid(),
  action: taskHistoryActionSchema,
  description: z.string(),
  at: z.coerce.date(),
})
export type TaskHistoryEntry = z.infer<typeof taskHistoryEntrySchema>

const taskSharedFields = {
  title: z.string().min(1, 'Título é obrigatório'),
  status: taskStatusSchema.default('pending'),
  priority: taskPrioritySchema.default('medium'),
  deadline: z.coerce.date().optional(),
  timeSpentHours: z.coerce.number().min(0).optional(),
  isBlocked: z.boolean().default(false),
  blockHistory: z.array(blockRecordSchema).default([]),
  history: z.array(taskHistoryEntrySchema).default([]),
}

export const simpleTaskSchema = baseEntitySchema.extend({
  kind: z.literal('simple'),
  ...taskSharedFields,
})
export type SimpleTask = z.infer<typeof simpleTaskSchema>

export const fullTaskSchema = baseEntitySchema.extend({
  kind: z.literal('full'),
  ...taskSharedFields,
  description: z.string().default(''),
  assignee: taskPersonSchema.optional(),
  reporter: taskPersonSchema.optional(),
  estimatedHours: z.coerce.number().min(0).optional(),
  tags: z.array(taskTagSchema).default([]),
  externalRef: z.string().optional(),
  links: z.array(taskLinkSchema).default([]),
})
export type FullTask = z.infer<typeof fullTaskSchema>

export const taskSchema = z.discriminatedUnion('kind', [simpleTaskSchema, fullTaskSchema])
export type Task = z.infer<typeof taskSchema>

export const createSimpleTaskInputSchema = z.object({
  kind: z.literal('simple'),
  title: z.string().min(1, 'Título é obrigatório'),
  priority: taskPrioritySchema,
  deadline: z.coerce.date().optional(),
})
export type CreateSimpleTaskInput = z.infer<typeof createSimpleTaskInputSchema>

export const createFullTaskInputSchema = z.object({
  kind: z.literal('full'),
  title: z.string().min(1, 'Título é obrigatório'),
  priority: taskPrioritySchema,
  deadline: z.coerce.date().optional(),
  description: z.string().optional(),
  assignee: taskPersonSchema.optional(),
  reporter: taskPersonSchema.optional(),
  estimatedHours: z.coerce.number().min(0).optional(),
  tags: z.array(taskTagSchema).optional(),
  externalRef: z.string().optional(),
  links: z.array(taskLinkSchema).optional(),
})
export type CreateFullTaskInput = z.infer<typeof createFullTaskInputSchema>

export const createTaskInputSchema = z.discriminatedUnion('kind', [
  createSimpleTaskInputSchema,
  createFullTaskInputSchema,
])
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>

export const updateTaskInputSchema = z.object({
  title: z.string().min(1).optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  deadline: z.coerce.date().optional(),
  timeSpentHours: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  assignee: taskPersonSchema.optional(),
  reporter: taskPersonSchema.optional(),
  estimatedHours: z.coerce.number().min(0).optional(),
  tags: z.array(taskTagSchema).optional(),
  externalRef: z.string().optional(),
  links: z.array(taskLinkSchema).optional(),
  changeReason: z.string().optional(),
})
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>

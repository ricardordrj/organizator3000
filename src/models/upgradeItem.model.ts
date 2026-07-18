import { z } from 'zod'
import { baseEntitySchema } from './common.model'

export const upgradeItemSchema = baseEntitySchema.extend({
  phaseId: z.uuid(),
  title: z.string().min(1, 'Título é obrigatório'),
  notes: z.string().optional(),
  priceCents: z.number().int().positive().optional(),
  isDone: z.boolean(),
  orderIndex: z.number().int(),
})
export type UpgradeItem = z.infer<typeof upgradeItemSchema>

export const createUpgradeItemInputSchema = z.object({
  phaseId: z.uuid(),
  title: z.string().min(1, 'Título é obrigatório'),
  notes: z.string().min(1).optional(),
  priceCents: z.number().int().positive().optional(),
})
export type CreateUpgradeItemInput = z.infer<typeof createUpgradeItemInputSchema>

export const updateUpgradeItemInputSchema = z.object({
  title: z.string().min(1).optional(),
  notes: z.string().min(1).nullable().optional(),
  priceCents: z.number().int().positive().nullable().optional(),
  orderIndex: z.number().int().optional(),
})
export type UpdateUpgradeItemInput = z.infer<typeof updateUpgradeItemInputSchema>

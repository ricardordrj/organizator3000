import { z } from 'zod'
import { baseEntitySchema } from './common.model'

export const upgradePhaseSchema = baseEntitySchema.extend({
  title: z.string().min(1, 'Título é obrigatório'),
  orderIndex: z.number().int(),
})
export type UpgradePhase = z.infer<typeof upgradePhaseSchema>

export const createUpgradePhaseInputSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
})
export type CreateUpgradePhaseInput = z.infer<typeof createUpgradePhaseInputSchema>

export const updateUpgradePhaseInputSchema = z.object({
  title: z.string().min(1).optional(),
  orderIndex: z.number().int().optional(),
})
export type UpdateUpgradePhaseInput = z.infer<typeof updateUpgradePhaseInputSchema>

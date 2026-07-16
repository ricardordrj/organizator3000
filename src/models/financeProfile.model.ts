import { z } from 'zod'
import { baseEntitySchema } from './common.model'

export const financeProfileSchema = baseEntitySchema.extend({
  name: z.string().min(1, 'Nome é obrigatório'),
})
export type FinanceProfile = z.infer<typeof financeProfileSchema>

export const createFinanceProfileInputSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
})
export type CreateFinanceProfileInput = z.infer<typeof createFinanceProfileInputSchema>

export const updateFinanceProfileInputSchema = z.object({
  name: z.string().min(1).optional(),
})
export type UpdateFinanceProfileInput = z.infer<typeof updateFinanceProfileInputSchema>

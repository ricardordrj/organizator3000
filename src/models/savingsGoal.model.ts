import { z } from 'zod'
import { baseEntitySchema } from './common.model'

export const savingsGoalSchema = baseEntitySchema.extend({
  profileId: z.uuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
  targetCents: z.number().int().positive(),
  currentCents: z.number().int().min(0),
  deadline: z.coerce.date().optional(),
})
export type SavingsGoal = z.infer<typeof savingsGoalSchema>

export const createSavingsGoalInputSchema = z.object({
  profileId: z.uuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
  targetCents: z.number().int().positive('Meta deve ser maior que zero'),
  deadline: z.coerce.date().optional(),
})
export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalInputSchema>

export const updateSavingsGoalInputSchema = z.object({
  name: z.string().min(1).optional(),
  targetCents: z.number().int().positive().optional(),
  deadline: z.coerce.date().optional(),
})
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalInputSchema>

export const contributeSavingsGoalInputSchema = z.object({
  amountCents: z.number().int().positive('Valor deve ser maior que zero'),
})
export type ContributeSavingsGoalInput = z.infer<typeof contributeSavingsGoalInputSchema>

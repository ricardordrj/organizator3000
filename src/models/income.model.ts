import { z } from 'zod'
import { baseEntitySchema } from './common.model'

export const incomeKindSchema = z.enum(['salary', 'meal_voucher', 'other'])
export type IncomeKind = z.infer<typeof incomeKindSchema>

export const incomeSchema = baseEntitySchema.extend({
  profileId: z.uuid(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amountCents: z.number().int().positive(),
  kind: incomeKindSchema,
})
export type Income = z.infer<typeof incomeSchema>

export const createIncomeInputSchema = z.object({
  profileId: z.uuid(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amountCents: z.number().int().positive('Valor deve ser maior que zero'),
  kind: incomeKindSchema,
})
export type CreateIncomeInput = z.infer<typeof createIncomeInputSchema>

export const updateIncomeInputSchema = z.object({
  description: z.string().min(1).optional(),
  amountCents: z.number().int().positive().optional(),
  kind: incomeKindSchema.optional(),
})
export type UpdateIncomeInput = z.infer<typeof updateIncomeInputSchema>

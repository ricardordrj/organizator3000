import { z } from 'zod'
import { baseEntitySchema } from './common.model'

export const expenseCategorySchema = z.enum([
  'moradia',
  'mercado',
  'transporte',
  'lazer',
  'saude',
  'assinatura',
  'outros',
])
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>

export const expenseKindSchema = z.enum(['bill', 'subscription'])
export type ExpenseKind = z.infer<typeof expenseKindSchema>

export const expenseSchema = baseEntitySchema.extend({
  profileId: z.uuid(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amountCents: z.number().int().positive(),
  category: expenseCategorySchema,
  kind: expenseKindSchema,
  dueDay: z.number().int().min(1).max(31),
  lastPaidAt: z.coerce.date().optional(),
  isPaidThisCycle: z.boolean(),
})
export type Expense = z.infer<typeof expenseSchema>

export const createExpenseInputSchema = z.object({
  profileId: z.uuid(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amountCents: z.number().int().positive('Valor deve ser maior que zero'),
  category: expenseCategorySchema,
  kind: expenseKindSchema,
  dueDay: z.number().int().min(1).max(31),
})
export type CreateExpenseInput = z.infer<typeof createExpenseInputSchema>

export const updateExpenseInputSchema = z.object({
  description: z.string().min(1).optional(),
  amountCents: z.number().int().positive().optional(),
  category: expenseCategorySchema.optional(),
  kind: expenseKindSchema.optional(),
  dueDay: z.number().int().min(1).max(31).optional(),
})
export type UpdateExpenseInput = z.infer<typeof updateExpenseInputSchema>

import { z } from 'zod'

export const mealVoucherPurchaseSchema = z.object({
  id: z.uuid(),
  profileId: z.uuid(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amountCents: z.number().int().positive(),
  purchasedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})
export type MealVoucherPurchase = z.infer<typeof mealVoucherPurchaseSchema>

export const createMealVoucherPurchaseInputSchema = z.object({
  profileId: z.uuid(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amountCents: z.number().int().positive('Valor deve ser maior que zero'),
  purchasedAt: z.date().optional(),
})
export type CreateMealVoucherPurchaseInput = z.infer<typeof createMealVoucherPurchaseInputSchema>

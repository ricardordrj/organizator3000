import { z } from 'zod'
import { baseEntitySchema } from './common.model'

export const shoppingUrgencySchema = z.enum(['baixa', 'media', 'alta'])
export type ShoppingUrgency = z.infer<typeof shoppingUrgencySchema>

export const shoppingItemSchema = baseEntitySchema.extend({
  profileId: z.uuid(),
  title: z.string().min(1, 'Título é obrigatório'),
  notes: z.string().optional(),
  priceCents: z.number().int().positive().optional(),
  urgency: shoppingUrgencySchema,
  isDone: z.boolean(),
  orderIndex: z.number().int(),
})
export type ShoppingItem = z.infer<typeof shoppingItemSchema>

export const createShoppingItemInputSchema = z.object({
  profileId: z.uuid(),
  title: z.string().min(1, 'Título é obrigatório'),
  notes: z.string().min(1).optional(),
  priceCents: z.number().int().positive().optional(),
  urgency: shoppingUrgencySchema.optional(),
})
export type CreateShoppingItemInput = z.infer<typeof createShoppingItemInputSchema>

export const updateShoppingItemInputSchema = z.object({
  title: z.string().min(1).optional(),
  notes: z.string().min(1).nullable().optional(),
  priceCents: z.number().int().positive().nullable().optional(),
  urgency: shoppingUrgencySchema.optional(),
  orderIndex: z.number().int().optional(),
})
export type UpdateShoppingItemInput = z.infer<typeof updateShoppingItemInputSchema>

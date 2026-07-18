import { z } from 'zod'
import { baseEntitySchema } from './common.model'

export const shoppingProfileSchema = baseEntitySchema.extend({
  name: z.string().min(1, 'Nome é obrigatório'),
})
export type ShoppingProfile = z.infer<typeof shoppingProfileSchema>

export const createShoppingProfileInputSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
})
export type CreateShoppingProfileInput = z.infer<typeof createShoppingProfileInputSchema>

export const updateShoppingProfileInputSchema = z.object({
  name: z.string().min(1).optional(),
})
export type UpdateShoppingProfileInput = z.infer<typeof updateShoppingProfileInputSchema>

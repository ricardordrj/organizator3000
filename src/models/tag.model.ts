import { z } from 'zod'
import { baseEntitySchema } from './common.model'

export const tagSchema = baseEntitySchema.extend({
  name: z.string().min(1, 'Nome é obrigatório'),
  color: z.string().optional(),
})
export type Tag = z.infer<typeof tagSchema>

export const createTagInputSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  color: z.string().optional(),
})
export type CreateTagInput = z.infer<typeof createTagInputSchema>

export const updateTagInputSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
})
export type UpdateTagInput = z.infer<typeof updateTagInputSchema>

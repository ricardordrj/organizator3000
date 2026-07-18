import { z } from 'zod'
import { baseEntitySchema } from './common.model'

export const loreCategoryKindSchema = z.enum(['dark_fantasy', 'personal_project'])
export type LoreCategoryKind = z.infer<typeof loreCategoryKindSchema>

export const loreCategorySchema = baseEntitySchema.extend({
  kind: loreCategoryKindSchema,
  title: z.string().min(1, 'Título é obrigatório'),
  orderIndex: z.number().int(),
})
export type LoreCategory = z.infer<typeof loreCategorySchema>

export const createLoreCategoryInputSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  kind: loreCategoryKindSchema.optional(),
})
export type CreateLoreCategoryInput = z.infer<typeof createLoreCategoryInputSchema>

export const updateLoreCategoryInputSchema = z.object({
  title: z.string().min(1).optional(),
  orderIndex: z.number().int().optional(),
})
export type UpdateLoreCategoryInput = z.infer<typeof updateLoreCategoryInputSchema>

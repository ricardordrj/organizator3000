import { z } from 'zod'
import { baseEntitySchema } from './common.model'

export const loreEntrySchema = baseEntitySchema.extend({
  categoryId: z.uuid(),
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string(),
  images: z.array(z.string()),
  orderIndex: z.number().int(),
})
export type LoreEntry = z.infer<typeof loreEntrySchema>

export const createLoreEntryInputSchema = z.object({
  categoryId: z.uuid(),
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  images: z.array(z.string().url()).default([]),
})
export type CreateLoreEntryInput = z.infer<typeof createLoreEntryInputSchema>

export const updateLoreEntryInputSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  images: z.array(z.string().url()).optional(),
  orderIndex: z.number().int().optional(),
})
export type UpdateLoreEntryInput = z.infer<typeof updateLoreEntryInputSchema>

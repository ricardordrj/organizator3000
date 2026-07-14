import { z } from 'zod'
import { baseEntitySchema } from './common.model'

export const noteSchema = baseEntitySchema.extend({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().default(''),
  tags: z.array(z.string()).default([]),
})
export type Note = z.infer<typeof noteSchema>

export const createNoteInputSchema = noteSchema.pick({
  title: true,
  content: true,
  tags: true,
}).partial({ content: true, tags: true })
export type CreateNoteInput = z.infer<typeof createNoteInputSchema>

export const updateNoteInputSchema = createNoteInputSchema.partial()
export type UpdateNoteInput = z.infer<typeof updateNoteInputSchema>

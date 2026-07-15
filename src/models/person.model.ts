import { z } from 'zod'
import { baseEntitySchema } from './common.model'

export const personRoleSchema = z.enum(['dev', 'po'])
export type PersonRole = z.infer<typeof personRoleSchema>

export const personSchema = baseEntitySchema.extend({
  name: z.string().min(1, 'Nome é obrigatório'),
  role: personRoleSchema,
})
export type Person = z.infer<typeof personSchema>

export const createPersonInputSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  role: personRoleSchema,
})
export type CreatePersonInput = z.infer<typeof createPersonInputSchema>

export const updatePersonInputSchema = z.object({
  name: z.string().min(1).optional(),
})
export type UpdatePersonInput = z.infer<typeof updatePersonInputSchema>

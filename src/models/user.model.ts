import { z } from 'zod'

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.email().optional(),
  avatarColor: z.string().default('#6366f1'),
})
export type User = z.infer<typeof userSchema>

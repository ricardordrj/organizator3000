import { z } from 'zod'
import { taskAttachmentSchema } from './attachment.model'

export const taskResponseSchema = z.object({
  id: z.uuid(),
  taskId: z.uuid(),
  message: z.string(),
  createdAt: z.coerce.date(),
  attachments: z.array(taskAttachmentSchema).default([]),
})
export type TaskResponse = z.infer<typeof taskResponseSchema>

export const createResponseInputSchema = z.object({
  message: z.string().min(1, 'Mensagem é obrigatória'),
})
export type CreateResponseInput = z.infer<typeof createResponseInputSchema>

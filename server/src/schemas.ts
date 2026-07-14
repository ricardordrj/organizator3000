import { z } from 'zod'

export const taskPrioritySchema = z.enum(['low', 'medium', 'high'])

/**
 * 'done' é excluído de propósito: conclusão só acontece via POST /tasks/:id/complete,
 * nunca por um PATCH genérico de status.
 */
export const editableTaskStatusSchema = z.enum(['pending', 'in_progress'])

export const taskLinkSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  url: z.string().url(),
})

const sharedCreateFields = {
  title: z.string().min(1, 'Título é obrigatório'),
  priority: taskPrioritySchema,
  deadline: z.coerce.date().optional(),
}

export const createTaskInputSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('simple'),
    ...sharedCreateFields,
  }),
  z.object({
    kind: z.literal('full'),
    ...sharedCreateFields,
    description: z.string().optional(),
    assignee: z.string().optional(),
    reporter: z.string().optional(),
    estimatedHours: z.coerce.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
    externalRef: z.string().optional(),
    links: z.array(taskLinkSchema).optional(),
  }),
])
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>

export const updateTaskInputSchema = z.object({
  title: z.string().min(1).optional(),
  status: editableTaskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  deadline: z.coerce.date().optional(),
  timeSpentHours: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  assignee: z.string().optional(),
  reporter: z.string().optional(),
  estimatedHours: z.coerce.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  externalRef: z.string().optional(),
  links: z.array(taskLinkSchema).optional(),
  changeReason: z.string().optional(),
})
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>

export const blockTaskInputSchema = z.object({
  reason: z.string().min(1, 'Informe o motivo do bloqueio'),
})

export const createNoteInputSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
})
export type CreateNoteInput = z.infer<typeof createNoteInputSchema>

export const updateNoteInputSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
})
export type UpdateNoteInput = z.infer<typeof updateNoteInputSchema>

export const settingsInputSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['pt-BR', 'en-US']),
})
export type SettingsInput = z.infer<typeof settingsInputSchema>

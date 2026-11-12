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
    assigneeId: z.string().optional(),
    reporterId: z.string().optional(),
    estimatedHours: z.coerce.number().min(0).optional(),
    tagIds: z.array(z.string()).optional(),
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
  assigneeId: z.string().optional(),
  reporterId: z.string().optional(),
  estimatedHours: z.coerce.number().min(0).optional(),
  tagIds: z.array(z.string()).optional(),
  externalRef: z.string().optional(),
  links: z.array(taskLinkSchema).optional(),
  changeReason: z.string().optional(),
})
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>

export const personRoleSchema = z.enum(['dev', 'po'])

export const createPersonInputSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  role: personRoleSchema,
})
export type CreatePersonInput = z.infer<typeof createPersonInputSchema>

export const updatePersonInputSchema = z.object({
  name: z.string().min(1).optional(),
})
export type UpdatePersonInput = z.infer<typeof updatePersonInputSchema>

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

export const blockTaskInputSchema = z.object({
  reason: z.string().min(1, 'Informe o motivo do bloqueio'),
})

export const createResponseInputSchema = z.object({
  message: z.string().min(1, 'Mensagem é obrigatória'),
})
export type CreateResponseInput = z.infer<typeof createResponseInputSchema>

export const createFinanceProfileInputSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
})
export type CreateFinanceProfileInput = z.infer<typeof createFinanceProfileInputSchema>

export const updateFinanceProfileInputSchema = z.object({
  name: z.string().min(1).optional(),
})
export type UpdateFinanceProfileInput = z.infer<typeof updateFinanceProfileInputSchema>

export const expenseCategorySchema = z.enum([
  'moradia',
  'mercado',
  'transporte',
  'lazer',
  'saude',
  'assinatura',
  'outros',
])
export const expenseKindSchema = z.enum(['bill', 'subscription'])

export const createExpenseInputSchema = z.object({
  profileId: z.string().min(1, 'Perfil é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amountCents: z.coerce.number().int().positive('Valor deve ser maior que zero'),
  category: expenseCategorySchema,
  kind: expenseKindSchema,
  dueDay: z.coerce.number().int().min(1).max(31),
})
export type CreateExpenseInput = z.infer<typeof createExpenseInputSchema>

export const updateExpenseInputSchema = z.object({
  description: z.string().min(1).optional(),
  amountCents: z.coerce.number().int().positive().optional(),
  category: expenseCategorySchema.optional(),
  kind: expenseKindSchema.optional(),
  dueDay: z.coerce.number().int().min(1).max(31).optional(),
})
export type UpdateExpenseInput = z.infer<typeof updateExpenseInputSchema>

export const incomeKindSchema = z.enum(['salary', 'meal_voucher', 'other'])

export const createIncomeInputSchema = z.object({
  profileId: z.string().min(1, 'Perfil é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amountCents: z.coerce.number().int().positive('Valor deve ser maior que zero'),
  kind: incomeKindSchema,
})
export type CreateIncomeInput = z.infer<typeof createIncomeInputSchema>

export const updateIncomeInputSchema = z.object({
  description: z.string().min(1).optional(),
  amountCents: z.coerce.number().int().positive().optional(),
  kind: incomeKindSchema.optional(),
})
export type UpdateIncomeInput = z.infer<typeof updateIncomeInputSchema>

export const createMealVoucherPurchaseInputSchema = z.object({
  profileId: z.string().min(1, 'Perfil é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amountCents: z.coerce.number().int().positive('Valor deve ser maior que zero'),
  purchasedAt: z.coerce.date().optional(),
})
export type CreateMealVoucherPurchaseInput = z.infer<typeof createMealVoucherPurchaseInputSchema>

export const createSavingsGoalInputSchema = z.object({
  profileId: z.string().min(1, 'Perfil é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  targetCents: z.coerce.number().int().positive('Meta deve ser maior que zero'),
  deadline: z.coerce.date().optional(),
})
export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalInputSchema>

export const updateSavingsGoalInputSchema = z.object({
  name: z.string().min(1).optional(),
  targetCents: z.coerce.number().int().positive().optional(),
  deadline: z.coerce.date().optional(),
})
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalInputSchema>

export const contributeSavingsGoalInputSchema = z.object({
  amountCents: z.coerce.number().int().positive('Valor deve ser maior que zero'),
})
export type ContributeSavingsGoalInput = z.infer<typeof contributeSavingsGoalInputSchema>

export const settingsInputSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['pt-BR', 'en-US']),
})
export type SettingsInput = z.infer<typeof settingsInputSchema>

export const createUpgradePhaseInputSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
})
export type CreateUpgradePhaseInput = z.infer<typeof createUpgradePhaseInputSchema>

export const updateUpgradePhaseInputSchema = z.object({
  title: z.string().min(1).optional(),
  orderIndex: z.coerce.number().int().optional(),
})
export type UpdateUpgradePhaseInput = z.infer<typeof updateUpgradePhaseInputSchema>

export const createUpgradeItemInputSchema = z.object({
  phaseId: z.string().min(1, 'Fase é obrigatória'),
  title: z.string().min(1, 'Título é obrigatório'),
  notes: z.string().min(1).optional(),
  priceCents: z.coerce.number().int().positive().optional(),
})
export type CreateUpgradeItemInput = z.infer<typeof createUpgradeItemInputSchema>

export const updateUpgradeItemInputSchema = z.object({
  title: z.string().min(1).optional(),
  notes: z.string().min(1).nullable().optional(),
  priceCents: z.coerce.number().int().positive().nullable().optional(),
  orderIndex: z.coerce.number().int().optional(),
})
export type UpdateUpgradeItemInput = z.infer<typeof updateUpgradeItemInputSchema>

export const loreCategoryKindSchema = z.enum(['dark_fantasy', 'personal_project'])

export const createLoreCategoryInputSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  kind: loreCategoryKindSchema.optional(),
})
export type CreateLoreCategoryInput = z.infer<typeof createLoreCategoryInputSchema>

export const updateLoreCategoryInputSchema = z.object({
  title: z.string().min(1).optional(),
  orderIndex: z.coerce.number().int().optional(),
})
export type UpdateLoreCategoryInput = z.infer<typeof updateLoreCategoryInputSchema>

export const createLoreEntryInputSchema = z.object({
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  images: z.array(z.string().url()).default([]),
})
export type CreateLoreEntryInput = z.infer<typeof createLoreEntryInputSchema>

export const updateLoreEntryInputSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  images: z.array(z.string().url()).optional(),
  orderIndex: z.coerce.number().int().optional(),
})
export type UpdateLoreEntryInput = z.infer<typeof updateLoreEntryInputSchema>

export const createShoppingProfileInputSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
})
export type CreateShoppingProfileInput = z.infer<typeof createShoppingProfileInputSchema>

export const updateShoppingProfileInputSchema = z.object({
  name: z.string().min(1).optional(),
})
export type UpdateShoppingProfileInput = z.infer<typeof updateShoppingProfileInputSchema>

export const shoppingUrgencySchema = z.enum(['baixa', 'media', 'alta'])

export const createShoppingItemInputSchema = z.object({
  profileId: z.string().min(1, 'Perfil é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  notes: z.string().min(1).optional(),
  priceCents: z.coerce.number().int().positive().optional(),
  urgency: shoppingUrgencySchema.optional(),
})
export type CreateShoppingItemInput = z.infer<typeof createShoppingItemInputSchema>

export const updateShoppingItemInputSchema = z.object({
  title: z.string().min(1).optional(),
  notes: z.string().min(1).nullable().optional(),
  priceCents: z.coerce.number().int().positive().nullable().optional(),
  urgency: shoppingUrgencySchema.optional(),
  orderIndex: z.coerce.number().int().optional(),
})
export type UpdateShoppingItemInput = z.infer<typeof updateShoppingItemInputSchema>

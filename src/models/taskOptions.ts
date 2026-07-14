import { z } from 'zod'

export const TASK_TAGS = [
  'bug',
  'feature',
  'chore',
  'docs',
  'urgente',
  'backend',
  'frontend',
  'infra',
  'design',
] as const
export const taskTagSchema = z.enum(TASK_TAGS)
export type TaskTag = z.infer<typeof taskTagSchema>

/**
 * Lista fechada de pessoas (dev/PO) usada nos campos de responsável e aberto por.
 * Edite este array para refletir o time real do projeto.
 */
export const TASK_PEOPLE = ['Dev 1', 'Dev 2', 'Dev 3', 'PO 1', 'PO 2'] as const
export const taskPersonSchema = z.enum(TASK_PEOPLE)
export type TaskPerson = z.infer<typeof taskPersonSchema>

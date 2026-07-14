import type { TaskKind, TaskPriority, TaskStatus, TaskHistoryAction, TaskUrgencyLevel } from '@/models'

export const kindLabels: Record<TaskKind, string> = {
  simple: 'Simples',
  full: 'Completa',
}

export const priorityLabels: Record<TaskPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
}

export const priorityBadgeVariant: Record<TaskPriority, 'secondary' | 'default' | 'destructive'> = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
}

export const statusLabels: Record<TaskStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  done: 'Concluída',
}

export const urgencyLabels: Record<TaskUrgencyLevel, string> = {
  overdue: 'Prazo estourado',
  warning: 'Próximo do prazo',
  ok: 'No prazo',
  none: 'Sem prazo',
}

/** Classes de cor literal (verde/amarelo/vermelho) pedidas para o status de urgência. */
export const urgencyColorClass: Record<TaskUrgencyLevel, string> = {
  overdue: 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400',
  warning: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
  ok: 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  none: 'border-transparent bg-muted text-muted-foreground',
}

export const historyActionLabels: Record<TaskHistoryAction, string> = {
  created: 'Criada',
  status_changed: 'Status alterado',
  priority_changed: 'Prioridade alterada',
  deadline_changed: 'Prazo alterado',
  blocked: 'Bloqueada',
  unblocked: 'Desbloqueada',
  edited: 'Editada',
  completed: 'Concluída',
}

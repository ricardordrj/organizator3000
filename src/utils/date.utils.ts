import type { TaskUrgencyLevel } from '@/models'

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}min`
  return m ? `${h}h${m}min` : `${h}h`
}

export function formatTimeRemaining(ms: number): string {
  const minutes = Math.round(Math.abs(ms) / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const label = days > 0 ? `${days}d` : hours > 0 ? `${hours}h` : `${minutes}min`
  return ms < 0 ? `atrasada há ${label}` : `em ${label}`
}

export interface TaskUrgencyInfo {
  level: TaskUrgencyLevel
  elapsedRatio: number | null
  msRemaining: number | null
}

const URGENCY_WARNING_THRESHOLD = 0.7

export function getTaskUrgency(
  openedAt: Date,
  deadline: Date | undefined,
  isDone: boolean,
  now: Date = new Date(),
): TaskUrgencyInfo {
  if (!deadline || isDone) {
    return { level: 'none', elapsedRatio: null, msRemaining: null }
  }

  const totalWindowMs = deadline.getTime() - openedAt.getTime()
  const msRemaining = deadline.getTime() - now.getTime()
  const elapsedRatio =
    totalWindowMs > 0 ? (now.getTime() - openedAt.getTime()) / totalWindowMs : 1

  if (msRemaining <= 0) return { level: 'overdue', elapsedRatio, msRemaining }
  if (elapsedRatio >= URGENCY_WARNING_THRESHOLD) return { level: 'warning', elapsedRatio, msRemaining }
  return { level: 'ok', elapsedRatio, msRemaining }
}

const urgencyRank: Record<TaskUrgencyLevel, number> = {
  overdue: 0,
  warning: 1,
  ok: 2,
  none: 3,
}

export function compareTaskUrgency(a: TaskUrgencyInfo, b: TaskUrgencyInfo): number {
  const rankDiff = urgencyRank[a.level] - urgencyRank[b.level]
  if (rankDiff !== 0) return rankDiff
  if (a.msRemaining !== null && b.msRemaining !== null) return a.msRemaining - b.msRemaining
  return 0
}

import type { ShoppingUrgency } from '@/models'

export const urgencyLabels: Record<ShoppingUrgency, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

export const urgencyBadgeClassNames: Record<ShoppingUrgency, string> = {
  alta: 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400',
  media: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
  baixa: 'border-transparent bg-slate-500/15 text-slate-600 dark:text-slate-300',
}

export const urgencyOrder: Record<ShoppingUrgency, number> = {
  alta: 0,
  media: 1,
  baixa: 2,
}

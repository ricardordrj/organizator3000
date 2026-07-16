import type { ExpenseCategory, ExpenseKind } from '@/models'

export const categoryLabels: Record<ExpenseCategory, string> = {
  moradia: 'Moradia',
  mercado: 'Mercado',
  transporte: 'Transporte',
  lazer: 'Lazer',
  saude: 'Saúde',
  assinatura: 'Assinatura',
  outros: 'Outros',
}

export const kindLabels: Record<ExpenseKind, string> = {
  bill: 'Conta',
  subscription: 'Assinatura',
}

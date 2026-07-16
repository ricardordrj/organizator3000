import type { ExpenseCategory, ExpenseKind, IncomeKind } from '@/models'

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

export const incomeKindLabels: Record<IncomeKind, string> = {
  salary: 'Salário',
  meal_voucher: 'Vale Alimentação',
  other: 'Outra renda',
}

import { useAppStore } from '@/store/useAppStore'

export function useExpenses() {
  const expenses = useAppStore((state) => state.expenses)
  const addExpense = useAppStore((state) => state.addExpense)
  const editExpense = useAppStore((state) => state.editExpense)
  const markExpensePaid = useAppStore((state) => state.markExpensePaid)
  const removeExpense = useAppStore((state) => state.removeExpense)

  return { expenses, addExpense, editExpense, markExpensePaid, removeExpense }
}

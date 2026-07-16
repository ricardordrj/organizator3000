import { useAppStore } from '@/store/useAppStore'

export function useIncomes() {
  const incomes = useAppStore((state) => state.incomes)
  const addIncome = useAppStore((state) => state.addIncome)
  const editIncome = useAppStore((state) => state.editIncome)
  const removeIncome = useAppStore((state) => state.removeIncome)

  return { incomes, addIncome, editIncome, removeIncome }
}

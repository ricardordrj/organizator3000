import { useAppStore } from '@/store/useAppStore'

export function useSavingsGoals() {
  const savingsGoals = useAppStore((state) => state.savingsGoals)
  const addSavingsGoal = useAppStore((state) => state.addSavingsGoal)
  const editSavingsGoal = useAppStore((state) => state.editSavingsGoal)
  const contributeSavingsGoal = useAppStore((state) => state.contributeSavingsGoal)
  const removeSavingsGoal = useAppStore((state) => state.removeSavingsGoal)

  return { savingsGoals, addSavingsGoal, editSavingsGoal, contributeSavingsGoal, removeSavingsGoal }
}

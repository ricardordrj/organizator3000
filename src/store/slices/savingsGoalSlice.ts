import type { StateCreator } from 'zustand'
import { savingsGoalService } from '@/services'
import type { AppState, SavingsGoalSlice } from '../types'

export const createSavingsGoalSlice: StateCreator<AppState, [], [], SavingsGoalSlice> = (set, get) => ({
  savingsGoals: [],
  addSavingsGoal: async (input) => {
    const goal = await savingsGoalService.create(input)
    set({ savingsGoals: [...get().savingsGoals, goal] })
    return goal
  },
  editSavingsGoal: async (id, patch) => {
    const updated = await savingsGoalService.update(id, patch)
    if (!updated) return
    set({ savingsGoals: get().savingsGoals.map((goal) => (goal.id === id ? updated : goal)) })
  },
  contributeSavingsGoal: async (id, amountCents) => {
    const updated = await savingsGoalService.contribute(id, { amountCents })
    if (!updated) return
    set({ savingsGoals: get().savingsGoals.map((goal) => (goal.id === id ? updated : goal)) })
  },
  removeSavingsGoal: async (id) => {
    await savingsGoalService.remove(id)
    set({ savingsGoals: get().savingsGoals.filter((goal) => goal.id !== id) })
  },
})

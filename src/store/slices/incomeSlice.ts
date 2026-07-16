import type { StateCreator } from 'zustand'
import { incomeService } from '@/services'
import type { AppState, IncomeSlice } from '../types'

export const createIncomeSlice: StateCreator<AppState, [], [], IncomeSlice> = (set, get) => ({
  incomes: [],
  addIncome: async (input) => {
    const income = await incomeService.create(input)
    set({ incomes: [...get().incomes, income] })
    return income
  },
  editIncome: async (id, patch) => {
    const updated = await incomeService.update(id, patch)
    if (!updated) return
    set({ incomes: get().incomes.map((income) => (income.id === id ? updated : income)) })
  },
  removeIncome: async (id) => {
    await incomeService.remove(id)
    set({ incomes: get().incomes.filter((income) => income.id !== id) })
  },
})

import type { StateCreator } from 'zustand'
import { expenseService } from '@/services'
import type { AppState, ExpenseSlice } from '../types'

export const createExpenseSlice: StateCreator<AppState, [], [], ExpenseSlice> = (set, get) => ({
  expenses: [],
  addExpense: async (input) => {
    const expense = await expenseService.create(input)
    set({ expenses: [...get().expenses, expense] })
    return expense
  },
  editExpense: async (id, patch) => {
    const updated = await expenseService.update(id, patch)
    if (!updated) return
    set({ expenses: get().expenses.map((expense) => (expense.id === id ? updated : expense)) })
  },
  markExpensePaid: async (id) => {
    const updated = await expenseService.markPaid(id)
    if (!updated) return
    set({ expenses: get().expenses.map((expense) => (expense.id === id ? updated : expense)) })
  },
  removeExpense: async (id) => {
    await expenseService.remove(id)
    set({ expenses: get().expenses.filter((expense) => expense.id !== id) })
  },
})

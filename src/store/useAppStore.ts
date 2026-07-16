import { create } from 'zustand'
import {
  taskService,
  settingsService,
  personService,
  tagService,
  expenseService,
  savingsGoalService,
  incomeService,
  mealVoucherPurchaseService,
} from '@/services'
import { createUiSlice } from './slices/uiSlice'
import { createTaskSlice } from './slices/taskSlice'
import { createPersonSlice } from './slices/personSlice'
import { createTagSlice } from './slices/tagSlice'
import { createExpenseSlice } from './slices/expenseSlice'
import { createSavingsGoalSlice } from './slices/savingsGoalSlice'
import { createIncomeSlice } from './slices/incomeSlice'
import { createMealVoucherPurchaseSlice } from './slices/mealVoucherPurchaseSlice'
import type { AppState } from './types'

export const useAppStore = create<AppState>()((set, get, api) => ({
  ...createUiSlice(set, get, api),
  ...createTaskSlice(set, get, api),
  ...createPersonSlice(set, get, api),
  ...createTagSlice(set, get, api),
  ...createExpenseSlice(set, get, api),
  ...createSavingsGoalSlice(set, get, api),
  ...createIncomeSlice(set, get, api),
  ...createMealVoucherPurchaseSlice(set, get, api),
  hydrate: async () => {
    const [settings, tasks, people, tags, expenses, savingsGoals, incomes, mealVoucherPurchases] = await Promise.all([
      settingsService.get(),
      taskService.list(),
      personService.list(),
      tagService.list(),
      expenseService.list(),
      savingsGoalService.list(),
      incomeService.list(),
      mealVoucherPurchaseService.list(),
    ])
    set({
      settings,
      tasks,
      people,
      tags,
      expenses,
      savingsGoals,
      incomes,
      mealVoucherPurchases,
      isHydrated: true,
    })
  },
}))

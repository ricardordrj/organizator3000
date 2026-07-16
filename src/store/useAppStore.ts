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
  financeProfileService,
} from '@/services'
import { createUiSlice } from './slices/uiSlice'
import { createTaskSlice } from './slices/taskSlice'
import { createPersonSlice } from './slices/personSlice'
import { createTagSlice } from './slices/tagSlice'
import { createExpenseSlice } from './slices/expenseSlice'
import { createSavingsGoalSlice } from './slices/savingsGoalSlice'
import { createIncomeSlice } from './slices/incomeSlice'
import { createMealVoucherPurchaseSlice } from './slices/mealVoucherPurchaseSlice'
import { createFinanceProfileSlice } from './slices/financeProfileSlice'
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
  ...createFinanceProfileSlice(set, get, api),
  hydrate: async () => {
    const [settings, tasks, people, tags, expenses, savingsGoals, incomes, mealVoucherPurchases, financeProfiles] =
      await Promise.all([
        settingsService.get(),
        taskService.list(),
        personService.list(),
        tagService.list(),
        expenseService.list(),
        savingsGoalService.list(),
        incomeService.list(),
        mealVoucherPurchaseService.list(),
        financeProfileService.list(),
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
      financeProfiles,
      isHydrated: true,
    })
    const currentActiveId = get().activeFinanceProfileId
    const stillValid = currentActiveId && financeProfiles.some((p) => p.id === currentActiveId)
    if (!stillValid) {
      get().setActiveFinanceProfileId(financeProfiles[0]?.id ?? null)
    }
  },
}))

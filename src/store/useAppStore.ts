import { create } from 'zustand'
import { taskService, settingsService, personService, tagService, expenseService, savingsGoalService } from '@/services'
import { createUiSlice } from './slices/uiSlice'
import { createTaskSlice } from './slices/taskSlice'
import { createPersonSlice } from './slices/personSlice'
import { createTagSlice } from './slices/tagSlice'
import { createExpenseSlice } from './slices/expenseSlice'
import { createSavingsGoalSlice } from './slices/savingsGoalSlice'
import type { AppState } from './types'

export const useAppStore = create<AppState>()((set, get, api) => ({
  ...createUiSlice(set, get, api),
  ...createTaskSlice(set, get, api),
  ...createPersonSlice(set, get, api),
  ...createTagSlice(set, get, api),
  ...createExpenseSlice(set, get, api),
  ...createSavingsGoalSlice(set, get, api),
  hydrate: async () => {
    const [settings, tasks, people, tags, expenses, savingsGoals] = await Promise.all([
      settingsService.get(),
      taskService.list(),
      personService.list(),
      tagService.list(),
      expenseService.list(),
      savingsGoalService.list(),
    ])
    set({ settings, tasks, people, tags, expenses, savingsGoals, isHydrated: true })
  },
}))

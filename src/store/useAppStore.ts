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
  upgradePhaseService,
  upgradeItemService,
  loreCategoryService,
  loreEntryService,
  shoppingProfileService,
  shoppingItemService,
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
import { createUpgradePhaseSlice } from './slices/upgradePhaseSlice'
import { createUpgradeItemSlice } from './slices/upgradeItemSlice'
import { createLoreCategorySlice } from './slices/loreCategorySlice'
import { createLoreEntrySlice } from './slices/loreEntrySlice'
import { createShoppingProfileSlice } from './slices/shoppingProfileSlice'
import { createShoppingItemSlice } from './slices/shoppingItemSlice'
import { createCommanderPlayerSlice } from './slices/commanderPlayerSlice'
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
  ...createUpgradePhaseSlice(set, get, api),
  ...createUpgradeItemSlice(set, get, api),
  ...createLoreCategorySlice(set, get, api),
  ...createLoreEntrySlice(set, get, api),
  ...createShoppingProfileSlice(set, get, api),
  ...createShoppingItemSlice(set, get, api),
  ...createCommanderPlayerSlice(set, get, api),
  hydrate: async () => {
    const [
      settings,
      tasks,
      people,
      tags,
      expenses,
      savingsGoals,
      incomes,
      mealVoucherPurchases,
      financeProfiles,
      upgradePhases,
      upgradeItems,
      loreCategories,
      loreEntries,
      shoppingProfiles,
      shoppingItems,
    ] = await Promise.all([
      settingsService.get(),
      taskService.list(),
      personService.list(),
      tagService.list(),
      expenseService.list(),
      savingsGoalService.list(),
      incomeService.list(),
      mealVoucherPurchaseService.list(),
      financeProfileService.list(),
      upgradePhaseService.list(),
      upgradeItemService.list(),
      loreCategoryService.list(),
      loreEntryService.list(),
      shoppingProfileService.list(),
      shoppingItemService.list(),
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
      upgradePhases,
      upgradeItems,
      loreCategories,
      loreEntries,
      shoppingProfiles,
      shoppingItems,
      isHydrated: true,
    })
    const currentActiveId = get().activeFinanceProfileId
    const stillValid = currentActiveId && financeProfiles.some((p) => p.id === currentActiveId)
    if (!stillValid) {
      get().setActiveFinanceProfileId(financeProfiles[0]?.id ?? null)
    }
    const currentActiveShoppingId = get().activeShoppingProfileId
    const stillValidShopping = currentActiveShoppingId && shoppingProfiles.some((p) => p.id === currentActiveShoppingId)
    if (!stillValidShopping) {
      get().setActiveShoppingProfileId(shoppingProfiles[0]?.id ?? null)
    }
  },
}))

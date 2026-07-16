import type { StateCreator } from 'zustand'
import { mealVoucherPurchaseService } from '@/services'
import type { AppState, MealVoucherPurchaseSlice } from '../types'

export const createMealVoucherPurchaseSlice: StateCreator<AppState, [], [], MealVoucherPurchaseSlice> = (
  set,
  get,
) => ({
  mealVoucherPurchases: [],
  addMealVoucherPurchase: async (input) => {
    const purchase = await mealVoucherPurchaseService.create(input)
    set({ mealVoucherPurchases: [...get().mealVoucherPurchases, purchase] })
    return purchase
  },
  removeMealVoucherPurchase: async (id) => {
    await mealVoucherPurchaseService.remove(id)
    set({ mealVoucherPurchases: get().mealVoucherPurchases.filter((purchase) => purchase.id !== id) })
  },
})

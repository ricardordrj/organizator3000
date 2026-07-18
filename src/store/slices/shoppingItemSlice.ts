import type { StateCreator } from 'zustand'
import { shoppingItemService } from '@/services'
import type { AppState, ShoppingItemSlice } from '../types'

export const createShoppingItemSlice: StateCreator<AppState, [], [], ShoppingItemSlice> = (set, get) => ({
  shoppingItems: [],
  addShoppingItem: async (input) => {
    const item = await shoppingItemService.create(input)
    set({ shoppingItems: [...get().shoppingItems, item] })
    return item
  },
  editShoppingItem: async (id, patch) => {
    const updated = await shoppingItemService.update(id, patch)
    if (!updated) return
    set({ shoppingItems: get().shoppingItems.map((item) => (item.id === id ? updated : item)) })
  },
  toggleShoppingItem: async (id) => {
    const updated = await shoppingItemService.toggle(id)
    if (!updated) return
    set({ shoppingItems: get().shoppingItems.map((item) => (item.id === id ? updated : item)) })
  },
  removeShoppingItem: async (id) => {
    await shoppingItemService.remove(id)
    set({ shoppingItems: get().shoppingItems.filter((item) => item.id !== id) })
  },
})

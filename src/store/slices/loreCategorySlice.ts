import type { StateCreator } from 'zustand'
import { loreCategoryService } from '@/services'
import type { AppState, LoreCategorySlice } from '../types'

export const createLoreCategorySlice: StateCreator<AppState, [], [], LoreCategorySlice> = (set, get) => ({
  loreCategories: [],
  addLoreCategory: async (input) => {
    const category = await loreCategoryService.create(input)
    set({ loreCategories: [...get().loreCategories, category] })
    return category
  },
  editLoreCategory: async (id, patch) => {
    const updated = await loreCategoryService.update(id, patch)
    if (!updated) return
    set({ loreCategories: get().loreCategories.map((category) => (category.id === id ? updated : category)) })
  },
  removeLoreCategory: async (id) => {
    await loreCategoryService.remove(id)
    set({
      loreCategories: get().loreCategories.filter((category) => category.id !== id),
      loreEntries: get().loreEntries.filter((entry) => entry.categoryId !== id),
    })
  },
})

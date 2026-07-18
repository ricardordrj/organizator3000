import type { StateCreator } from 'zustand'
import { shoppingProfileService } from '@/services'
import type { AppState, ShoppingProfileSlice } from '../types'

export const createShoppingProfileSlice: StateCreator<AppState, [], [], ShoppingProfileSlice> = (set, get) => ({
  shoppingProfiles: [],
  addShoppingProfile: async (input) => {
    const profile = await shoppingProfileService.create(input)
    set({ shoppingProfiles: [...get().shoppingProfiles, profile] })
    return profile
  },
  editShoppingProfile: async (id, patch) => {
    const updated = await shoppingProfileService.update(id, patch)
    if (!updated) return
    set({ shoppingProfiles: get().shoppingProfiles.map((profile) => (profile.id === id ? updated : profile)) })
  },
  removeShoppingProfile: async (id) => {
    await shoppingProfileService.remove(id)
    set({ shoppingProfiles: get().shoppingProfiles.filter((profile) => profile.id !== id) })
    if (get().activeShoppingProfileId === id) {
      const fallback = get().shoppingProfiles[0]?.id ?? null
      get().setActiveShoppingProfileId(fallback)
    }
  },
})

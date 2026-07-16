import type { StateCreator } from 'zustand'
import { financeProfileService } from '@/services'
import type { AppState, FinanceProfileSlice } from '../types'

export const createFinanceProfileSlice: StateCreator<AppState, [], [], FinanceProfileSlice> = (set, get) => ({
  financeProfiles: [],
  addFinanceProfile: async (input) => {
    const profile = await financeProfileService.create(input)
    set({ financeProfiles: [...get().financeProfiles, profile] })
    return profile
  },
  editFinanceProfile: async (id, patch) => {
    const updated = await financeProfileService.update(id, patch)
    if (!updated) return
    set({ financeProfiles: get().financeProfiles.map((profile) => (profile.id === id ? updated : profile)) })
  },
  removeFinanceProfile: async (id) => {
    await financeProfileService.remove(id)
    set({ financeProfiles: get().financeProfiles.filter((profile) => profile.id !== id) })
    if (get().activeFinanceProfileId === id) {
      const fallback = get().financeProfiles[0]?.id ?? null
      get().setActiveFinanceProfileId(fallback)
    }
  },
})

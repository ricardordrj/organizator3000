import type { StateCreator } from 'zustand'
import { upgradeItemService } from '@/services'
import type { AppState, UpgradeItemSlice } from '../types'

export const createUpgradeItemSlice: StateCreator<AppState, [], [], UpgradeItemSlice> = (set, get) => ({
  upgradeItems: [],
  addUpgradeItem: async (input) => {
    const item = await upgradeItemService.create(input)
    set({ upgradeItems: [...get().upgradeItems, item] })
    return item
  },
  editUpgradeItem: async (id, patch) => {
    const updated = await upgradeItemService.update(id, patch)
    if (!updated) return
    set({ upgradeItems: get().upgradeItems.map((item) => (item.id === id ? updated : item)) })
  },
  toggleUpgradeItem: async (id) => {
    const updated = await upgradeItemService.toggle(id)
    if (!updated) return
    set({ upgradeItems: get().upgradeItems.map((item) => (item.id === id ? updated : item)) })
  },
  removeUpgradeItem: async (id) => {
    await upgradeItemService.remove(id)
    set({ upgradeItems: get().upgradeItems.filter((item) => item.id !== id) })
  },
})

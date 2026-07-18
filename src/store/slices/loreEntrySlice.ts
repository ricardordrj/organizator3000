import type { StateCreator } from 'zustand'
import { loreEntryService } from '@/services'
import type { AppState, LoreEntrySlice } from '../types'

export const createLoreEntrySlice: StateCreator<AppState, [], [], LoreEntrySlice> = (set, get) => ({
  loreEntries: [],
  addLoreEntry: async (input) => {
    const entry = await loreEntryService.create(input)
    set({ loreEntries: [...get().loreEntries, entry] })
    return entry
  },
  editLoreEntry: async (id, patch) => {
    const updated = await loreEntryService.update(id, patch)
    if (!updated) return
    set({ loreEntries: get().loreEntries.map((entry) => (entry.id === id ? updated : entry)) })
  },
  removeLoreEntry: async (id) => {
    await loreEntryService.remove(id)
    set({ loreEntries: get().loreEntries.filter((entry) => entry.id !== id) })
  },
})

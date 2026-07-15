import type { StateCreator } from 'zustand'
import { tagService } from '@/services'
import type { AppState, TagSlice } from '../types'

export const createTagSlice: StateCreator<AppState, [], [], TagSlice> = (set, get) => ({
  tags: [],
  addTag: async (input) => {
    const tag = await tagService.create(input)
    set({ tags: [...get().tags, tag] })
    return tag
  },
  editTag: async (id, patch) => {
    const updated = await tagService.update(id, patch)
    if (!updated) return
    set({ tags: get().tags.map((tag) => (tag.id === id ? updated : tag)) })
  },
  removeTag: async (id) => {
    await tagService.remove(id)
    set({ tags: get().tags.filter((tag) => tag.id !== id) })
  },
})

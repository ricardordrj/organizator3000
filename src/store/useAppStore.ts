import { create } from 'zustand'
import { taskService, settingsService, personService, tagService } from '@/services'
import { createUiSlice } from './slices/uiSlice'
import { createTaskSlice } from './slices/taskSlice'
import { createPersonSlice } from './slices/personSlice'
import { createTagSlice } from './slices/tagSlice'
import type { AppState } from './types'

export const useAppStore = create<AppState>()((set, get, api) => ({
  ...createUiSlice(set, get, api),
  ...createTaskSlice(set, get, api),
  ...createPersonSlice(set, get, api),
  ...createTagSlice(set, get, api),
  hydrate: async () => {
    const [settings, tasks, people, tags] = await Promise.all([
      settingsService.get(),
      taskService.list(),
      personService.list(),
      tagService.list(),
    ])
    set({ settings, tasks, people, tags, isHydrated: true })
  },
}))

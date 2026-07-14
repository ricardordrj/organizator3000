import { create } from 'zustand'
import { taskService, noteService, settingsService } from '@/services'
import { createUiSlice } from './slices/uiSlice'
import { createTaskSlice } from './slices/taskSlice'
import { createNoteSlice } from './slices/noteSlice'
import type { AppState } from './types'

export const useAppStore = create<AppState>()((set, get, api) => ({
  ...createUiSlice(set, get, api),
  ...createTaskSlice(set, get, api),
  ...createNoteSlice(set, get, api),
  hydrate: async () => {
    const [settings, tasks, notes] = await Promise.all([
      settingsService.get(),
      taskService.list(),
      noteService.list(),
    ])
    set({ settings, tasks, notes, isHydrated: true })
  },
}))

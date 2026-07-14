import type { StateCreator } from 'zustand'
import { defaultAppSettings } from '@/models'
import { settingsService } from '@/services'
import type { AppState, UiSlice } from '../types'

export const createUiSlice: StateCreator<AppState, [], [], UiSlice> = (set, get) => ({
  settings: defaultAppSettings,
  isHydrated: false,
  setTheme: async (theme) => {
    const settings = await settingsService.save({ ...get().settings, theme })
    set({ settings })
  },
})

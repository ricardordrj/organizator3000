import type { StateCreator } from 'zustand'
import { defaultAppSettings } from '@/models'
import { settingsService } from '@/services'
import type { AppState, UiSlice } from '../types'

const NOTIFICATIONS_STORAGE_KEY = 'task-deadline-notifications-enabled'
const ACTIVE_FINANCE_PROFILE_STORAGE_KEY = 'active-finance-profile-id'

function loadNotificationsEnabled(): boolean {
  return typeof localStorage !== 'undefined' && localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) === 'true'
}

function loadActiveFinanceProfileId(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(ACTIVE_FINANCE_PROFILE_STORAGE_KEY)
}

export const createUiSlice: StateCreator<AppState, [], [], UiSlice> = (set, get) => ({
  settings: defaultAppSettings,
  isHydrated: false,
  notificationsEnabled: loadNotificationsEnabled(),
  activeFinanceProfileId: loadActiveFinanceProfileId(),
  setTheme: async (theme) => {
    const settings = await settingsService.save({ ...get().settings, theme })
    set({ settings })
  },
  setNotificationsEnabled: async (enabled) => {
    if (enabled) {
      if (typeof Notification === 'undefined') return
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
    }
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, String(enabled))
    set({ notificationsEnabled: enabled })
  },
  setActiveFinanceProfileId: (id) => {
    if (id) localStorage.setItem(ACTIVE_FINANCE_PROFILE_STORAGE_KEY, id)
    else localStorage.removeItem(ACTIVE_FINANCE_PROFILE_STORAGE_KEY)
    set({ activeFinanceProfileId: id })
  },
})

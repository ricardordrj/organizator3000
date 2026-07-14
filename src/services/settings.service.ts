import { appSettingsSchema } from '@/models'
import type { AppSettings } from '@/models'
import { apiClient } from './apiClient'

export const settingsService = {
  async get(): Promise<AppSettings> {
    const raw = await apiClient.get<unknown>('/settings')
    return appSettingsSchema.parse(raw)
  },

  async save(settings: AppSettings): Promise<AppSettings> {
    const raw = await apiClient.put<unknown>('/settings', settings)
    return appSettingsSchema.parse(raw)
  },
}

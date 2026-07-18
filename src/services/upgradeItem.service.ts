import { upgradeItemSchema } from '@/models'
import type { UpgradeItem, CreateUpgradeItemInput, UpdateUpgradeItemInput } from '@/models'
import { apiClient } from './apiClient'

export const upgradeItemService = {
  async list(): Promise<UpgradeItem[]> {
    const raw = await apiClient.get<unknown[]>('/upgrade-items')
    return raw.map((i) => upgradeItemSchema.parse(i))
  },

  async create(input: CreateUpgradeItemInput): Promise<UpgradeItem> {
    const raw = await apiClient.post<unknown>('/upgrade-items', input)
    return upgradeItemSchema.parse(raw)
  },

  async update(id: string, patch: UpdateUpgradeItemInput): Promise<UpgradeItem | undefined> {
    const raw = await apiClient.patch<unknown>(`/upgrade-items/${id}`, patch)
    return upgradeItemSchema.parse(raw)
  },

  async toggle(id: string): Promise<UpgradeItem | undefined> {
    const raw = await apiClient.post<unknown>(`/upgrade-items/${id}/toggle`)
    return upgradeItemSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/upgrade-items/${id}`)
  },
}

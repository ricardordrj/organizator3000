import { upgradePhaseSchema } from '@/models'
import type { UpgradePhase, CreateUpgradePhaseInput, UpdateUpgradePhaseInput } from '@/models'
import { apiClient } from './apiClient'

export const upgradePhaseService = {
  async list(): Promise<UpgradePhase[]> {
    const raw = await apiClient.get<unknown[]>('/upgrade-phases')
    return raw.map((p) => upgradePhaseSchema.parse(p))
  },

  async create(input: CreateUpgradePhaseInput): Promise<UpgradePhase> {
    const raw = await apiClient.post<unknown>('/upgrade-phases', input)
    return upgradePhaseSchema.parse(raw)
  },

  async update(id: string, patch: UpdateUpgradePhaseInput): Promise<UpgradePhase | undefined> {
    const raw = await apiClient.patch<unknown>(`/upgrade-phases/${id}`, patch)
    return upgradePhaseSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/upgrade-phases/${id}`)
  },
}

import { financeProfileSchema } from '@/models'
import type { FinanceProfile, CreateFinanceProfileInput, UpdateFinanceProfileInput } from '@/models'
import { apiClient } from './apiClient'

export const financeProfileService = {
  async list(): Promise<FinanceProfile[]> {
    const raw = await apiClient.get<unknown[]>('/finance-profiles')
    return raw.map((p) => financeProfileSchema.parse(p))
  },

  async create(input: CreateFinanceProfileInput): Promise<FinanceProfile> {
    const raw = await apiClient.post<unknown>('/finance-profiles', input)
    return financeProfileSchema.parse(raw)
  },

  async update(id: string, patch: UpdateFinanceProfileInput): Promise<FinanceProfile | undefined> {
    const raw = await apiClient.patch<unknown>(`/finance-profiles/${id}`, patch)
    return financeProfileSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/finance-profiles/${id}`)
  },
}

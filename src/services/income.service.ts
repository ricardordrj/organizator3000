import { incomeSchema } from '@/models'
import type { Income, CreateIncomeInput, UpdateIncomeInput } from '@/models'
import { apiClient } from './apiClient'

export const incomeService = {
  async list(): Promise<Income[]> {
    const raw = await apiClient.get<unknown[]>('/incomes')
    return raw.map((i) => incomeSchema.parse(i))
  },

  async create(input: CreateIncomeInput): Promise<Income> {
    const raw = await apiClient.post<unknown>('/incomes', input)
    return incomeSchema.parse(raw)
  },

  async update(id: string, patch: UpdateIncomeInput): Promise<Income | undefined> {
    const raw = await apiClient.patch<unknown>(`/incomes/${id}`, patch)
    return incomeSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/incomes/${id}`)
  },
}

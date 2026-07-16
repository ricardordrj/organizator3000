import { savingsGoalSchema } from '@/models'
import type { SavingsGoal, CreateSavingsGoalInput, UpdateSavingsGoalInput, ContributeSavingsGoalInput } from '@/models'
import { apiClient } from './apiClient'

export const savingsGoalService = {
  async list(): Promise<SavingsGoal[]> {
    const raw = await apiClient.get<unknown[]>('/savings-goals')
    return raw.map((g) => savingsGoalSchema.parse(g))
  },

  async create(input: CreateSavingsGoalInput): Promise<SavingsGoal> {
    const raw = await apiClient.post<unknown>('/savings-goals', input)
    return savingsGoalSchema.parse(raw)
  },

  async update(id: string, patch: UpdateSavingsGoalInput): Promise<SavingsGoal | undefined> {
    const raw = await apiClient.patch<unknown>(`/savings-goals/${id}`, patch)
    return savingsGoalSchema.parse(raw)
  },

  async contribute(id: string, input: ContributeSavingsGoalInput): Promise<SavingsGoal | undefined> {
    const raw = await apiClient.post<unknown>(`/savings-goals/${id}/contribute`, input)
    return savingsGoalSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/savings-goals/${id}`)
  },
}

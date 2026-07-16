import { expenseSchema } from '@/models'
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from '@/models'
import { apiClient } from './apiClient'

export const expenseService = {
  async list(): Promise<Expense[]> {
    const raw = await apiClient.get<unknown[]>('/expenses')
    return raw.map((e) => expenseSchema.parse(e))
  },

  async create(input: CreateExpenseInput): Promise<Expense> {
    const raw = await apiClient.post<unknown>('/expenses', input)
    return expenseSchema.parse(raw)
  },

  async update(id: string, patch: UpdateExpenseInput): Promise<Expense | undefined> {
    const raw = await apiClient.patch<unknown>(`/expenses/${id}`, patch)
    return expenseSchema.parse(raw)
  },

  async markPaid(id: string): Promise<Expense | undefined> {
    const raw = await apiClient.post<unknown>(`/expenses/${id}/pay`)
    return expenseSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/expenses/${id}`)
  },
}

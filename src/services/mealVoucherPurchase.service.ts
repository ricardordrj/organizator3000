import { mealVoucherPurchaseSchema } from '@/models'
import type { MealVoucherPurchase, CreateMealVoucherPurchaseInput } from '@/models'
import { apiClient } from './apiClient'

export const mealVoucherPurchaseService = {
  async list(): Promise<MealVoucherPurchase[]> {
    const raw = await apiClient.get<unknown[]>('/meal-voucher-purchases')
    return raw.map((p) => mealVoucherPurchaseSchema.parse(p))
  },

  async create(input: CreateMealVoucherPurchaseInput): Promise<MealVoucherPurchase> {
    const raw = await apiClient.post<unknown>('/meal-voucher-purchases', input)
    return mealVoucherPurchaseSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/meal-voucher-purchases/${id}`)
  },
}

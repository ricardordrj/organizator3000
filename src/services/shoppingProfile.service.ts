import { shoppingProfileSchema } from '@/models'
import type { ShoppingProfile, CreateShoppingProfileInput, UpdateShoppingProfileInput } from '@/models'
import { apiClient } from './apiClient'

export const shoppingProfileService = {
  async list(): Promise<ShoppingProfile[]> {
    const raw = await apiClient.get<unknown[]>('/shopping-profiles')
    return raw.map((p) => shoppingProfileSchema.parse(p))
  },

  async create(input: CreateShoppingProfileInput): Promise<ShoppingProfile> {
    const raw = await apiClient.post<unknown>('/shopping-profiles', input)
    return shoppingProfileSchema.parse(raw)
  },

  async update(id: string, patch: UpdateShoppingProfileInput): Promise<ShoppingProfile | undefined> {
    const raw = await apiClient.patch<unknown>(`/shopping-profiles/${id}`, patch)
    return shoppingProfileSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/shopping-profiles/${id}`)
  },
}

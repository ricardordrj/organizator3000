import { shoppingItemSchema } from '@/models'
import type { ShoppingItem, CreateShoppingItemInput, UpdateShoppingItemInput } from '@/models'
import { apiClient } from './apiClient'

export const shoppingItemService = {
  async list(): Promise<ShoppingItem[]> {
    const raw = await apiClient.get<unknown[]>('/shopping-items')
    return raw.map((i) => shoppingItemSchema.parse(i))
  },

  async create(input: CreateShoppingItemInput): Promise<ShoppingItem> {
    const raw = await apiClient.post<unknown>('/shopping-items', input)
    return shoppingItemSchema.parse(raw)
  },

  async update(id: string, patch: UpdateShoppingItemInput): Promise<ShoppingItem | undefined> {
    const raw = await apiClient.patch<unknown>(`/shopping-items/${id}`, patch)
    return shoppingItemSchema.parse(raw)
  },

  async toggle(id: string): Promise<ShoppingItem | undefined> {
    const raw = await apiClient.post<unknown>(`/shopping-items/${id}/toggle`)
    return shoppingItemSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/shopping-items/${id}`)
  },
}

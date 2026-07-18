import { loreCategorySchema } from '@/models'
import type { LoreCategory, CreateLoreCategoryInput, UpdateLoreCategoryInput } from '@/models'
import { apiClient } from './apiClient'

export const loreCategoryService = {
  async list(): Promise<LoreCategory[]> {
    const raw = await apiClient.get<unknown[]>('/lore-categories')
    return raw.map((c) => loreCategorySchema.parse(c))
  },

  async create(input: CreateLoreCategoryInput): Promise<LoreCategory> {
    const raw = await apiClient.post<unknown>('/lore-categories', input)
    return loreCategorySchema.parse(raw)
  },

  async update(id: string, patch: UpdateLoreCategoryInput): Promise<LoreCategory | undefined> {
    const raw = await apiClient.patch<unknown>(`/lore-categories/${id}`, patch)
    return loreCategorySchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/lore-categories/${id}`)
  },
}

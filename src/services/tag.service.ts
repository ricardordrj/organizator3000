import { tagSchema } from '@/models'
import type { Tag, CreateTagInput, UpdateTagInput } from '@/models'
import { apiClient } from './apiClient'

export const tagService = {
  async list(): Promise<Tag[]> {
    const raw = await apiClient.get<unknown[]>('/tags')
    return raw.map((t) => tagSchema.parse(t))
  },

  async create(input: CreateTagInput): Promise<Tag> {
    const raw = await apiClient.post<unknown>('/tags', input)
    return tagSchema.parse(raw)
  },

  async update(id: string, patch: UpdateTagInput): Promise<Tag | undefined> {
    const raw = await apiClient.patch<unknown>(`/tags/${id}`, patch)
    return tagSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/tags/${id}`)
  },
}

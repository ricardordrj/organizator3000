import { loreEntrySchema } from '@/models'
import type { LoreEntry, CreateLoreEntryInput, UpdateLoreEntryInput } from '@/models'
import { apiClient } from './apiClient'

export const loreEntryService = {
  async list(): Promise<LoreEntry[]> {
    const raw = await apiClient.get<unknown[]>('/lore-entries')
    return raw.map((e) => loreEntrySchema.parse(e))
  },

  async create(input: CreateLoreEntryInput): Promise<LoreEntry> {
    const raw = await apiClient.post<unknown>('/lore-entries', input)
    return loreEntrySchema.parse(raw)
  },

  async update(id: string, patch: UpdateLoreEntryInput): Promise<LoreEntry | undefined> {
    const raw = await apiClient.patch<unknown>(`/lore-entries/${id}`, patch)
    return loreEntrySchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/lore-entries/${id}`)
  },
}

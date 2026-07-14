import { noteSchema } from '@/models'
import type { Note, CreateNoteInput, UpdateNoteInput } from '@/models'
import { apiClient } from './apiClient'

export const noteService = {
  async list(): Promise<Note[]> {
    const raw = await apiClient.get<unknown[]>('/notes')
    return raw.map((n) => noteSchema.parse(n))
  },

  async create(input: CreateNoteInput): Promise<Note> {
    const raw = await apiClient.post<unknown>('/notes', input)
    return noteSchema.parse(raw)
  },

  async update(id: string, patch: UpdateNoteInput): Promise<Note | undefined> {
    const raw = await apiClient.patch<unknown>(`/notes/${id}`, patch)
    return noteSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/notes/${id}`)
  },
}

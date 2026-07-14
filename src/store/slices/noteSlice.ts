import type { StateCreator } from 'zustand'
import { noteService } from '@/services'
import type { AppState, NoteSlice } from '../types'

export const createNoteSlice: StateCreator<AppState, [], [], NoteSlice> = (set, get) => ({
  notes: [],
  addNote: async (input) => {
    const note = await noteService.create(input)
    set({ notes: [...get().notes, note] })
  },
  editNote: async (id, patch) => {
    const updated = await noteService.update(id, patch)
    if (!updated) return
    set({ notes: get().notes.map((note) => (note.id === id ? updated : note)) })
  },
  removeNote: async (id) => {
    await noteService.remove(id)
    set({ notes: get().notes.filter((note) => note.id !== id) })
  },
})

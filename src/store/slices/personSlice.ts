import type { StateCreator } from 'zustand'
import { personService } from '@/services'
import type { AppState, PersonSlice } from '../types'

export const createPersonSlice: StateCreator<AppState, [], [], PersonSlice> = (set, get) => ({
  people: [],
  addPerson: async (input) => {
    const person = await personService.create(input)
    set({ people: [...get().people, person] })
    return person
  },
  editPerson: async (id, patch) => {
    const updated = await personService.update(id, patch)
    if (!updated) return
    set({ people: get().people.map((person) => (person.id === id ? updated : person)) })
  },
  removePerson: async (id) => {
    await personService.remove(id)
    set({ people: get().people.filter((person) => person.id !== id) })
  },
})

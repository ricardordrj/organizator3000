import { personSchema } from '@/models'
import type { Person, PersonRole, CreatePersonInput, UpdatePersonInput } from '@/models'
import { apiClient } from './apiClient'

export const personService = {
  async list(role?: PersonRole): Promise<Person[]> {
    const query = role ? `?role=${role}` : ''
    const raw = await apiClient.get<unknown[]>(`/people${query}`)
    return raw.map((p) => personSchema.parse(p))
  },

  async create(input: CreatePersonInput): Promise<Person> {
    const raw = await apiClient.post<unknown>('/people', input)
    return personSchema.parse(raw)
  },

  async update(id: string, patch: UpdatePersonInput): Promise<Person | undefined> {
    const raw = await apiClient.patch<unknown>(`/people/${id}`, patch)
    return personSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/people/${id}`)
  },
}

import { taskSchema } from '@/models'
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/models'
import { apiClient } from './apiClient'

export const taskService = {
  async list(): Promise<Task[]> {
    const raw = await apiClient.get<unknown[]>('/tasks')
    return raw.map((t) => taskSchema.parse(t))
  },

  async get(id: string): Promise<Task | undefined> {
    const raw = await apiClient.get<unknown>(`/tasks/${id}`)
    return taskSchema.parse(raw)
  },

  async create(input: CreateTaskInput): Promise<Task> {
    const raw = await apiClient.post<unknown>('/tasks', input)
    return taskSchema.parse(raw)
  },

  async update(id: string, patch: UpdateTaskInput): Promise<Task | undefined> {
    const raw = await apiClient.patch<unknown>(`/tasks/${id}`, patch)
    return taskSchema.parse(raw)
  },

  async block(id: string, reason: string): Promise<Task | undefined> {
    const raw = await apiClient.post<unknown>(`/tasks/${id}/block`, { reason })
    return taskSchema.parse(raw)
  },

  async unblock(id: string): Promise<Task | undefined> {
    const raw = await apiClient.post<unknown>(`/tasks/${id}/unblock`)
    return taskSchema.parse(raw)
  },

  async complete(id: string): Promise<Task | undefined> {
    const raw = await apiClient.post<unknown>(`/tasks/${id}/complete`)
    return taskSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`)
  },
}

import { taskResponseSchema } from '@/models'
import type { TaskResponse, CreateResponseInput } from '@/models'
import { apiClient } from './apiClient'

export const responseService = {
  async listByTask(taskId: string): Promise<TaskResponse[]> {
    const raw = await apiClient.get<unknown[]>(`/tasks/${taskId}/responses`)
    return raw.map((r) => taskResponseSchema.parse(r))
  },

  async create(taskId: string, input: CreateResponseInput): Promise<TaskResponse> {
    const raw = await apiClient.post<unknown>(`/tasks/${taskId}/responses`, input)
    return taskResponseSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/responses/${id}`)
  },
}

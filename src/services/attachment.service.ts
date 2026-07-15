import { taskAttachmentSchema } from '@/models'
import type { TaskAttachment } from '@/models'
import { apiClient } from './apiClient'

export interface AttachmentPreview {
  content: string
  truncated: boolean
}

export const attachmentService = {
  async upload(taskId: string, file: File, responseId?: string): Promise<TaskAttachment> {
    const formData = new FormData()
    formData.append('file', file)
    if (responseId) formData.append('responseId', responseId)
    const raw = await apiClient.upload<unknown>(`/tasks/${taskId}/attachments`, formData)
    return taskAttachmentSchema.parse(raw)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/attachments/${id}`)
  },

  async preview(id: string): Promise<AttachmentPreview> {
    return apiClient.get<AttachmentPreview>(`/attachments/${id}/preview`)
  },

  downloadUrl(id: string): string {
    return `/api/attachments/${id}`
  },
}

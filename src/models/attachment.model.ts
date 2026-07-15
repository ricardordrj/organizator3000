import { z } from 'zod'

export const attachmentKindSchema = z.enum(['image', 'code'])
export type AttachmentKind = z.infer<typeof attachmentKindSchema>

export const taskAttachmentSchema = z.object({
  id: z.uuid(),
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  kind: attachmentKindSchema,
  createdAt: z.coerce.date(),
})
export type TaskAttachment = z.infer<typeof taskAttachmentSchema>

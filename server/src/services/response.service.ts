import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { responses, attachments, historyEntries, tasks } from '../db/schema.js'
import { notFound } from '../lib/errors.js'
import { attachmentService, toPublicAttachment } from './attachment.service.js'
import type { CreateResponseInput } from '../schemas.js'

type ResponseRow = typeof responses.$inferSelect
type AttachmentRow = typeof attachments.$inferSelect

function rowToResponse(row: ResponseRow, responseAttachments: AttachmentRow[]) {
  return {
    id: row.id,
    taskId: row.taskId,
    message: row.message,
    createdAt: row.createdAt,
    attachments: responseAttachments
      .filter((a) => a.responseId === row.id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(toPublicAttachment),
  }
}

export const responseService = {
  async listByTask(taskId: string) {
    const rows = await db.select().from(responses).where(eq(responses.taskId, taskId))
    const responseAttachments = await db.select().from(attachments).where(eq(attachments.taskId, taskId))
    return rows
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((row) => rowToResponse(row, responseAttachments))
  },

  async create(taskId: string, input: CreateResponseInput) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId))
    if (!task) throw notFound('Tarefa não encontrada')

    const id = randomUUID()
    const now = new Date()
    await db.insert(responses).values({ id, taskId, message: input.message, createdAt: now })
    await db.insert(historyEntries).values({
      id: randomUUID(),
      taskId,
      action: 'responded',
      description: 'Resposta registrada',
      at: now,
    })

    return rowToResponse({ id, taskId, message: input.message, createdAt: now }, [])
  },

  async remove(id: string) {
    const [row] = await db.select().from(responses).where(eq(responses.id, id))
    if (!row) throw notFound('Resposta não encontrada')

    const responseAttachments = await db.select().from(attachments).where(eq(attachments.responseId, id))
    await Promise.all(
      responseAttachments.map((a) => fs.rm(attachmentService.getFilePath(a.storedName), { force: true })),
    )
    await db.delete(responses).where(eq(responses.id, id))
  },
}

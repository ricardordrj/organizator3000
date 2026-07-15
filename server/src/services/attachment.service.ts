import { randomUUID } from 'node:crypto'
import path from 'node:path'
import fs from 'node:fs/promises'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { attachments } from '../db/schema.js'
import { env } from '../env.js'
import { notFound, badRequest } from '../lib/errors.js'
import { resolveAttachmentKind, MAX_FILE_SIZE_BYTES } from '../lib/uploadValidation.js'

const uploadsDir = path.resolve(env.UPLOADS_DIR)

async function ensureUploadsDir() {
  await fs.mkdir(uploadsDir, { recursive: true })
}

function safePathFor(storedName: string): string {
  const resolved = path.resolve(uploadsDir, storedName)
  if (resolved !== uploadsDir && !resolved.startsWith(uploadsDir + path.sep)) {
    throw badRequest('Nome de arquivo inválido')
  }
  return resolved
}

type AttachmentRow = typeof attachments.$inferSelect

/** Nunca expor `storedName` (nome interno em disco) ao cliente. */
export function toPublicAttachment(row: AttachmentRow) {
  return {
    id: row.id,
    taskId: row.taskId,
    responseId: row.responseId ?? undefined,
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    kind: row.kind,
    createdAt: row.createdAt,
  }
}

export const attachmentService = {
  async create(params: {
    taskId: string
    responseId?: string
    fileName: string
    mimeType: string
    buffer: Buffer
  }) {
    const kind = resolveAttachmentKind(params.fileName)
    if (!kind) {
      throw badRequest('Tipo de arquivo não permitido. Envie apenas imagens ou código-fonte.')
    }
    if (params.buffer.byteLength > MAX_FILE_SIZE_BYTES) {
      throw badRequest('Arquivo maior que o limite de 25MB')
    }

    await ensureUploadsDir()
    const ext = path.extname(params.fileName).toLowerCase()
    const storedName = `${randomUUID()}${ext}`
    await fs.writeFile(safePathFor(storedName), params.buffer)

    const id = randomUUID()
    await db.insert(attachments).values({
      id,
      taskId: params.taskId,
      responseId: params.responseId,
      fileName: params.fileName,
      storedName,
      mimeType: params.mimeType,
      sizeBytes: params.buffer.byteLength,
      kind,
      createdAt: new Date(),
    })

    const [row] = await db.select().from(attachments).where(eq(attachments.id, id))
    return row
  },

  async getMeta(id: string) {
    const [row] = await db.select().from(attachments).where(eq(attachments.id, id))
    if (!row) throw notFound('Anexo não encontrado')
    return row
  },

  getFilePath(storedName: string): string {
    return safePathFor(storedName)
  },

  async remove(id: string) {
    const [row] = await db.select().from(attachments).where(eq(attachments.id, id))
    if (!row) throw notFound('Anexo não encontrado')
    await db.delete(attachments).where(eq(attachments.id, id))
    await fs.rm(safePathFor(row.storedName), { force: true })
  },
}

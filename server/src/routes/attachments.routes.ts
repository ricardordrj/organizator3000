import { createReadStream } from 'node:fs'
import fs from 'node:fs/promises'
import type { FastifyInstance } from 'fastify'
import { attachmentService, toPublicAttachment } from '../services/attachment.service.js'
import { badRequest } from '../lib/errors.js'

const PREVIEW_MAX_BYTES = 200 * 1024

export async function attachmentRoutes(app: FastifyInstance) {
  app.post('/tasks/:id/attachments', async (request, reply) => {
    const { id: taskId } = request.params as { id: string }
    const data = await request.file()
    if (!data) throw badRequest('Nenhum arquivo enviado')

    const responseIdField = data.fields.responseId
    const responseId =
      responseIdField && !Array.isArray(responseIdField) && responseIdField.type === 'field'
        ? String(responseIdField.value)
        : undefined

    const buffer = await data.toBuffer()
    const attachment = await attachmentService.create({
      taskId,
      responseId,
      fileName: data.filename,
      mimeType: data.mimetype,
      buffer,
    })
    reply.code(201)
    return toPublicAttachment(attachment)
  })

  app.get('/attachments/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const meta = await attachmentService.getMeta(id)
    const filePath = attachmentService.getFilePath(meta.storedName)
    reply.header('Content-Type', meta.mimeType)
    reply.header('Content-Disposition', `inline; filename="${encodeURIComponent(meta.fileName)}"`)
    return reply.send(createReadStream(filePath))
  })

  app.get('/attachments/:id/preview', async (request) => {
    const { id } = request.params as { id: string }
    const meta = await attachmentService.getMeta(id)
    if (meta.kind !== 'code') {
      throw badRequest('Pré-visualização de texto só está disponível para arquivos de código')
    }
    const filePath = attachmentService.getFilePath(meta.storedName)
    const buffer = await fs.readFile(filePath)
    const truncated = buffer.byteLength > PREVIEW_MAX_BYTES
    const content = buffer.subarray(0, PREVIEW_MAX_BYTES).toString('utf-8')
    return { content, truncated }
  })

  app.delete('/attachments/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await attachmentService.remove(id)
    reply.code(204)
    return null
  })
}

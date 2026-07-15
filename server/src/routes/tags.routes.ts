import type { FastifyInstance } from 'fastify'
import { tagService } from '../services/tag.service.js'
import { createTagInputSchema, updateTagInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'
import { notFound } from '../lib/errors.js'

export async function tagRoutes(app: FastifyInstance) {
  app.get('/tags', async () => tagService.list())

  app.get('/tags/:id', async (request) => {
    const { id } = request.params as { id: string }
    const tag = await tagService.get(id)
    if (!tag) throw notFound('Tag não encontrada')
    return tag
  })

  app.post('/tags', async (request, reply) => {
    const input = parseBody(createTagInputSchema, request.body)
    const tag = await tagService.create(input)
    reply.code(201)
    return tag
  })

  app.patch('/tags/:id', async (request) => {
    const { id } = request.params as { id: string }
    const patch = parseBody(updateTagInputSchema, request.body)
    return tagService.update(id, patch)
  })

  app.delete('/tags/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await tagService.remove(id)
    reply.code(204)
    return null
  })
}

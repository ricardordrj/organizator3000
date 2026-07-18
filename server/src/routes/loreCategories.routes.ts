import type { FastifyInstance } from 'fastify'
import { loreCategoryService } from '../services/loreCategory.service.js'
import { createLoreCategoryInputSchema, updateLoreCategoryInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'

export async function loreCategoryRoutes(app: FastifyInstance) {
  app.get('/lore-categories', async () => loreCategoryService.list())

  app.post('/lore-categories', async (request, reply) => {
    const input = parseBody(createLoreCategoryInputSchema, request.body)
    const category = await loreCategoryService.create(input)
    reply.code(201)
    return category
  })

  app.patch('/lore-categories/:id', async (request) => {
    const { id } = request.params as { id: string }
    const patch = parseBody(updateLoreCategoryInputSchema, request.body)
    return loreCategoryService.update(id, patch)
  })

  app.delete('/lore-categories/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await loreCategoryService.remove(id)
    reply.code(204)
    return null
  })
}

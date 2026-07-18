import type { FastifyInstance } from 'fastify'
import { upgradeItemService } from '../services/upgradeItem.service.js'
import { createUpgradeItemInputSchema, updateUpgradeItemInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'

export async function upgradeItemRoutes(app: FastifyInstance) {
  app.get('/upgrade-items', async () => upgradeItemService.list())

  app.post('/upgrade-items', async (request, reply) => {
    const input = parseBody(createUpgradeItemInputSchema, request.body)
    const item = await upgradeItemService.create(input)
    reply.code(201)
    return item
  })

  app.patch('/upgrade-items/:id', async (request) => {
    const { id } = request.params as { id: string }
    const patch = parseBody(updateUpgradeItemInputSchema, request.body)
    return upgradeItemService.update(id, patch)
  })

  app.post('/upgrade-items/:id/toggle', async (request) => {
    const { id } = request.params as { id: string }
    return upgradeItemService.toggleDone(id)
  })

  app.delete('/upgrade-items/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await upgradeItemService.remove(id)
    reply.code(204)
    return null
  })
}

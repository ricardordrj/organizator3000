import type { FastifyInstance } from 'fastify'
import { upgradePhaseService } from '../services/upgradePhase.service.js'
import { createUpgradePhaseInputSchema, updateUpgradePhaseInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'

export async function upgradePhaseRoutes(app: FastifyInstance) {
  app.get('/upgrade-phases', async () => upgradePhaseService.list())

  app.post('/upgrade-phases', async (request, reply) => {
    const input = parseBody(createUpgradePhaseInputSchema, request.body)
    const phase = await upgradePhaseService.create(input)
    reply.code(201)
    return phase
  })

  app.patch('/upgrade-phases/:id', async (request) => {
    const { id } = request.params as { id: string }
    const patch = parseBody(updateUpgradePhaseInputSchema, request.body)
    return upgradePhaseService.update(id, patch)
  })

  app.delete('/upgrade-phases/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await upgradePhaseService.remove(id)
    reply.code(204)
    return null
  })
}

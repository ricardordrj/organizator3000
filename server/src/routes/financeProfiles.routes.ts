import type { FastifyInstance } from 'fastify'
import { financeProfileService } from '../services/financeProfile.service.js'
import { createFinanceProfileInputSchema, updateFinanceProfileInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'

export async function financeProfileRoutes(app: FastifyInstance) {
  app.get('/finance-profiles', async () => financeProfileService.list())

  app.post('/finance-profiles', async (request, reply) => {
    const input = parseBody(createFinanceProfileInputSchema, request.body)
    const profile = await financeProfileService.create(input)
    reply.code(201)
    return profile
  })

  app.patch('/finance-profiles/:id', async (request) => {
    const { id } = request.params as { id: string }
    const patch = parseBody(updateFinanceProfileInputSchema, request.body)
    return financeProfileService.update(id, patch)
  })

  app.delete('/finance-profiles/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await financeProfileService.remove(id)
    reply.code(204)
    return null
  })
}

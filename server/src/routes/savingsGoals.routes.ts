import type { FastifyInstance } from 'fastify'
import { savingsGoalService } from '../services/savingsGoal.service.js'
import {
  createSavingsGoalInputSchema,
  updateSavingsGoalInputSchema,
  contributeSavingsGoalInputSchema,
} from '../schemas.js'
import { parseBody } from '../lib/validate.js'
import { notFound } from '../lib/errors.js'

export async function savingsGoalRoutes(app: FastifyInstance) {
  app.get('/savings-goals', async () => savingsGoalService.list())

  app.get('/savings-goals/:id', async (request) => {
    const { id } = request.params as { id: string }
    const goal = await savingsGoalService.get(id)
    if (!goal) throw notFound('Meta não encontrada')
    return goal
  })

  app.post('/savings-goals', async (request, reply) => {
    const input = parseBody(createSavingsGoalInputSchema, request.body)
    const goal = await savingsGoalService.create(input)
    reply.code(201)
    return goal
  })

  app.patch('/savings-goals/:id', async (request) => {
    const { id } = request.params as { id: string }
    const patch = parseBody(updateSavingsGoalInputSchema, request.body)
    return savingsGoalService.update(id, patch)
  })

  app.post('/savings-goals/:id/contribute', async (request) => {
    const { id } = request.params as { id: string }
    const input = parseBody(contributeSavingsGoalInputSchema, request.body)
    return savingsGoalService.contribute(id, input)
  })

  app.delete('/savings-goals/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await savingsGoalService.remove(id)
    reply.code(204)
    return null
  })
}

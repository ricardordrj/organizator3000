import type { FastifyInstance } from 'fastify'
import { responseService } from '../services/response.service.js'
import { createResponseInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'

export async function responseRoutes(app: FastifyInstance) {
  app.get('/tasks/:taskId/responses', async (request) => {
    const { taskId } = request.params as { taskId: string }
    return responseService.listByTask(taskId)
  })

  app.post('/tasks/:taskId/responses', async (request, reply) => {
    const { taskId } = request.params as { taskId: string }
    const input = parseBody(createResponseInputSchema, request.body)
    const response = await responseService.create(taskId, input)
    reply.code(201)
    return response
  })

  app.delete('/responses/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await responseService.remove(id)
    reply.code(204)
    return null
  })
}

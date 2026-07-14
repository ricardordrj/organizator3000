import type { FastifyInstance } from 'fastify'
import { taskService } from '../services/task.service.js'
import { createTaskInputSchema, updateTaskInputSchema, blockTaskInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'
import { notFound } from '../lib/errors.js'

export async function taskRoutes(app: FastifyInstance) {
  app.get('/tasks', async () => taskService.list())

  app.get('/tasks/:id', async (request) => {
    const { id } = request.params as { id: string }
    const task = await taskService.get(id)
    if (!task) throw notFound('Tarefa não encontrada')
    return task
  })

  app.post('/tasks', async (request, reply) => {
    const input = parseBody(createTaskInputSchema, request.body)
    const task = await taskService.create(input)
    reply.code(201)
    return task
  })

  app.patch('/tasks/:id', async (request) => {
    const { id } = request.params as { id: string }
    const patch = parseBody(updateTaskInputSchema, request.body)
    return taskService.update(id, patch)
  })

  app.post('/tasks/:id/block', async (request) => {
    const { id } = request.params as { id: string }
    const { reason } = parseBody(blockTaskInputSchema, request.body)
    return taskService.block(id, reason)
  })

  app.post('/tasks/:id/unblock', async (request) => {
    const { id } = request.params as { id: string }
    return taskService.unblock(id)
  })

  app.post('/tasks/:id/complete', async (request) => {
    const { id } = request.params as { id: string }
    return taskService.complete(id)
  })

  app.delete('/tasks/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await taskService.remove(id)
    reply.code(204)
    return null
  })
}

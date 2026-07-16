import type { FastifyInstance } from 'fastify'
import { expenseService } from '../services/expense.service.js'
import { createExpenseInputSchema, updateExpenseInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'
import { notFound } from '../lib/errors.js'

export async function expenseRoutes(app: FastifyInstance) {
  app.get('/expenses', async () => expenseService.list())

  app.get('/expenses/:id', async (request) => {
    const { id } = request.params as { id: string }
    const expense = await expenseService.get(id)
    if (!expense) throw notFound('Despesa não encontrada')
    return expense
  })

  app.post('/expenses', async (request, reply) => {
    const input = parseBody(createExpenseInputSchema, request.body)
    const expense = await expenseService.create(input)
    reply.code(201)
    return expense
  })

  app.patch('/expenses/:id', async (request) => {
    const { id } = request.params as { id: string }
    const patch = parseBody(updateExpenseInputSchema, request.body)
    return expenseService.update(id, patch)
  })

  app.post('/expenses/:id/pay', async (request) => {
    const { id } = request.params as { id: string }
    return expenseService.markPaid(id)
  })

  app.delete('/expenses/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await expenseService.remove(id)
    reply.code(204)
    return null
  })
}

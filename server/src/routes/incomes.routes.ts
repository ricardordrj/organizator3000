import type { FastifyInstance } from 'fastify'
import { incomeService } from '../services/income.service.js'
import { createIncomeInputSchema, updateIncomeInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'
import { notFound } from '../lib/errors.js'

export async function incomeRoutes(app: FastifyInstance) {
  app.get('/incomes', async () => incomeService.list())

  app.post('/incomes', async (request, reply) => {
    const input = parseBody(createIncomeInputSchema, request.body)
    const income = await incomeService.create(input)
    reply.code(201)
    return income
  })

  app.patch('/incomes/:id', async (request) => {
    const { id } = request.params as { id: string }
    const patch = parseBody(updateIncomeInputSchema, request.body)
    const updated = await incomeService.update(id, patch)
    if (!updated) throw notFound('Renda não encontrada')
    return updated
  })

  app.delete('/incomes/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await incomeService.remove(id)
    reply.code(204)
    return null
  })
}

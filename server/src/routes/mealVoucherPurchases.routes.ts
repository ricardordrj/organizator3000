import type { FastifyInstance } from 'fastify'
import { mealVoucherPurchaseService } from '../services/mealVoucherPurchase.service.js'
import { createMealVoucherPurchaseInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'

export async function mealVoucherPurchaseRoutes(app: FastifyInstance) {
  app.get('/meal-voucher-purchases', async () => mealVoucherPurchaseService.list())

  app.post('/meal-voucher-purchases', async (request, reply) => {
    const input = parseBody(createMealVoucherPurchaseInputSchema, request.body)
    const purchase = await mealVoucherPurchaseService.create(input)
    reply.code(201)
    return purchase
  })

  app.delete('/meal-voucher-purchases/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await mealVoucherPurchaseService.remove(id)
    reply.code(204)
    return null
  })
}

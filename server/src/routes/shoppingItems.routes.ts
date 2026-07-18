import type { FastifyInstance } from 'fastify'
import { shoppingItemService } from '../services/shoppingItem.service.js'
import { createShoppingItemInputSchema, updateShoppingItemInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'

export async function shoppingItemRoutes(app: FastifyInstance) {
  app.get('/shopping-items', async () => shoppingItemService.list())

  app.post('/shopping-items', async (request, reply) => {
    const input = parseBody(createShoppingItemInputSchema, request.body)
    const item = await shoppingItemService.create(input)
    reply.code(201)
    return item
  })

  app.patch('/shopping-items/:id', async (request) => {
    const { id } = request.params as { id: string }
    const patch = parseBody(updateShoppingItemInputSchema, request.body)
    return shoppingItemService.update(id, patch)
  })

  app.post('/shopping-items/:id/toggle', async (request) => {
    const { id } = request.params as { id: string }
    return shoppingItemService.toggleDone(id)
  })

  app.delete('/shopping-items/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await shoppingItemService.remove(id)
    reply.code(204)
    return null
  })
}

import type { FastifyInstance } from 'fastify'
import { shoppingProfileService } from '../services/shoppingProfile.service.js'
import { createShoppingProfileInputSchema, updateShoppingProfileInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'

export async function shoppingProfileRoutes(app: FastifyInstance) {
  app.get('/shopping-profiles', async () => shoppingProfileService.list())

  app.post('/shopping-profiles', async (request, reply) => {
    const input = parseBody(createShoppingProfileInputSchema, request.body)
    const profile = await shoppingProfileService.create(input)
    reply.code(201)
    return profile
  })

  app.patch('/shopping-profiles/:id', async (request) => {
    const { id } = request.params as { id: string }
    const patch = parseBody(updateShoppingProfileInputSchema, request.body)
    return shoppingProfileService.update(id, patch)
  })

  app.delete('/shopping-profiles/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await shoppingProfileService.remove(id)
    reply.code(204)
    return null
  })
}

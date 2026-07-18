import type { FastifyInstance } from 'fastify'
import { loreEntryService } from '../services/loreEntry.service.js'
import { createLoreEntryInputSchema, updateLoreEntryInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'

export async function loreEntryRoutes(app: FastifyInstance) {
  app.get('/lore-entries', async () => loreEntryService.list())

  app.post('/lore-entries', async (request, reply) => {
    const input = parseBody(createLoreEntryInputSchema, request.body)
    const entry = await loreEntryService.create(input)
    reply.code(201)
    return entry
  })

  app.patch('/lore-entries/:id', async (request) => {
    const { id } = request.params as { id: string }
    const patch = parseBody(updateLoreEntryInputSchema, request.body)
    return loreEntryService.update(id, patch)
  })

  app.delete('/lore-entries/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await loreEntryService.remove(id)
    reply.code(204)
    return null
  })
}

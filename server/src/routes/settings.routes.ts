import type { FastifyInstance } from 'fastify'
import { settingsService } from '../services/settings.service.js'
import { settingsInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'

export async function settingsRoutes(app: FastifyInstance) {
  app.get('/settings', async () => settingsService.get())

  app.put('/settings', async (request) => {
    const input = parseBody(settingsInputSchema, request.body)
    return settingsService.save(input)
  })
}

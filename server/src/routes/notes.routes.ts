import type { FastifyInstance } from 'fastify'
import { noteService } from '../services/note.service.js'
import { createNoteInputSchema, updateNoteInputSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'

export async function noteRoutes(app: FastifyInstance) {
  app.get('/notes', async () => noteService.list())

  app.post('/notes', async (request, reply) => {
    const input = parseBody(createNoteInputSchema, request.body)
    const note = await noteService.create(input)
    reply.code(201)
    return note
  })

  app.patch('/notes/:id', async (request) => {
    const { id } = request.params as { id: string }
    const patch = parseBody(updateNoteInputSchema, request.body)
    return noteService.update(id, patch)
  })

  app.delete('/notes/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await noteService.remove(id)
    reply.code(204)
    return null
  })
}

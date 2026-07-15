import type { FastifyInstance } from 'fastify'
import { personService } from '../services/person.service.js'
import { createPersonInputSchema, updatePersonInputSchema, personRoleSchema } from '../schemas.js'
import { parseBody } from '../lib/validate.js'
import { notFound } from '../lib/errors.js'

export async function peopleRoutes(app: FastifyInstance) {
  app.get('/people', async (request) => {
    const { role } = request.query as { role?: string }
    const parsedRole = personRoleSchema.safeParse(role)
    return personService.list(parsedRole.success ? parsedRole.data : undefined)
  })

  app.get('/people/:id', async (request) => {
    const { id } = request.params as { id: string }
    const person = await personService.get(id)
    if (!person) throw notFound('Pessoa não encontrada')
    return person
  })

  app.post('/people', async (request, reply) => {
    const input = parseBody(createPersonInputSchema, request.body)
    const person = await personService.create(input)
    reply.code(201)
    return person
  })

  app.patch('/people/:id', async (request) => {
    const { id } = request.params as { id: string }
    const patch = parseBody(updatePersonInputSchema, request.body)
    return personService.update(id, patch)
  })

  app.delete('/people/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await personService.remove(id)
    reply.code(204)
    return null
  })
}

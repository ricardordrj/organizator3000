import { randomUUID } from 'node:crypto'
import { eq, or } from 'drizzle-orm'
import { db } from '../db/client.js'
import { people, tasks } from '../db/schema.js'
import { conflict, notFound } from '../lib/errors.js'
import type { CreatePersonInput, UpdatePersonInput } from '../schemas.js'

type PersonRow = typeof people.$inferSelect

function rowToPerson(row: PersonRow) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(people).where(eq(people.id, id))
  return row ? rowToPerson(row) : undefined
}

export const personService = {
  async list(role?: 'dev' | 'po') {
    const rows = role ? await db.select().from(people).where(eq(people.role, role)) : await db.select().from(people)
    return rows.map(rowToPerson)
  },

  async get(id: string) {
    return loadOne(id)
  },

  async create(input: CreatePersonInput) {
    const now = new Date()
    const id = randomUUID()
    try {
      await db.insert(people).values({ id, name: input.name, role: input.role, createdAt: now, updatedAt: now })
    } catch {
      throw conflict('Já existe uma pessoa com esse nome')
    }
    return loadOne(id)
  },

  async update(id: string, patch: UpdatePersonInput) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Pessoa não encontrada')

    try {
      await db
        .update(people)
        .set({ name: patch.name, updatedAt: new Date() })
        .where(eq(people.id, id))
    } catch {
      throw conflict('Já existe uma pessoa com esse nome')
    }
    return loadOne(id)
  },

  async remove(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Pessoa não encontrada')

    const usedIn = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(or(eq(tasks.assigneeId, id), eq(tasks.reporterId, id)))
    if (usedIn.length > 0) {
      throw conflict(`Não é possível excluir: usado em ${usedIn.length} tarefa(s)`)
    }

    await db.delete(people).where(eq(people.id, id))
  },
}

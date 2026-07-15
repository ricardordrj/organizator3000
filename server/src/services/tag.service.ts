import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { tags, taskTags } from '../db/schema.js'
import { conflict, notFound } from '../lib/errors.js'
import type { CreateTagInput, UpdateTagInput } from '../schemas.js'

type TagRow = typeof tags.$inferSelect

function rowToTag(row: TagRow) {
  return {
    id: row.id,
    name: row.name,
    color: row.color ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(tags).where(eq(tags.id, id))
  return row ? rowToTag(row) : undefined
}

export const tagService = {
  async list() {
    const rows = await db.select().from(tags)
    return rows.map(rowToTag)
  },

  async get(id: string) {
    return loadOne(id)
  },

  async create(input: CreateTagInput) {
    const now = new Date()
    const id = randomUUID()
    try {
      await db.insert(tags).values({ id, name: input.name, color: input.color, createdAt: now, updatedAt: now })
    } catch {
      throw conflict('Já existe uma tag com esse nome')
    }
    return loadOne(id)
  },

  async update(id: string, patch: UpdateTagInput) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Tag não encontrada')

    try {
      await db
        .update(tags)
        .set({ name: patch.name, color: patch.color, updatedAt: new Date() })
        .where(eq(tags.id, id))
    } catch {
      throw conflict('Já existe uma tag com esse nome')
    }
    return loadOne(id)
  },

  async remove(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Tag não encontrada')

    const usedIn = await db.select({ taskId: taskTags.taskId }).from(taskTags).where(eq(taskTags.tagId, id))
    if (usedIn.length > 0) {
      throw conflict(`Não é possível excluir: usada em ${usedIn.length} tarefa(s)`)
    }

    await db.delete(tags).where(eq(tags.id, id))
  },
}

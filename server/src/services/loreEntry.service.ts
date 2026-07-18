import { randomUUID } from 'node:crypto'
import { eq, max } from 'drizzle-orm'
import { db } from '../db/client.js'
import { loreEntries } from '../db/schema.js'
import { notFound } from '../lib/errors.js'
import type { CreateLoreEntryInput, UpdateLoreEntryInput } from '../schemas.js'

type LoreEntryRow = typeof loreEntries.$inferSelect

function rowToLoreEntry(row: LoreEntryRow) {
  return {
    id: row.id,
    categoryId: row.categoryId,
    title: row.title,
    content: row.content,
    images: row.imagesJson,
    orderIndex: row.orderIndex,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(loreEntries).where(eq(loreEntries.id, id))
  return row ? rowToLoreEntry(row) : undefined
}

export const loreEntryService = {
  async list() {
    const rows = await db.select().from(loreEntries)
    return rows.map(rowToLoreEntry).sort((a, b) => a.orderIndex - b.orderIndex)
  },

  async create(input: CreateLoreEntryInput) {
    const now = new Date()
    const id = randomUUID()
    const [row] = await db
      .select({ max: max(loreEntries.orderIndex) })
      .from(loreEntries)
      .where(eq(loreEntries.categoryId, input.categoryId))
    const orderIndex = (row?.max ?? -1) + 1
    await db.insert(loreEntries).values({
      id,
      categoryId: input.categoryId,
      title: input.title,
      content: input.content,
      imagesJson: input.images,
      orderIndex,
      createdAt: now,
      updatedAt: now,
    })
    return loadOne(id)
  },

  async update(id: string, patch: UpdateLoreEntryInput) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Página não encontrada')

    await db
      .update(loreEntries)
      .set({
        title: patch.title,
        content: patch.content,
        imagesJson: patch.images,
        orderIndex: patch.orderIndex,
        updatedAt: new Date(),
      })
      .where(eq(loreEntries.id, id))
    return loadOne(id)
  },

  async remove(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Página não encontrada')
    await db.delete(loreEntries).where(eq(loreEntries.id, id))
  },
}

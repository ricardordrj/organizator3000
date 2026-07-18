import { randomUUID } from 'node:crypto'
import { eq, max } from 'drizzle-orm'
import { db } from '../db/client.js'
import { loreCategories } from '../db/schema.js'
import { notFound } from '../lib/errors.js'
import type { CreateLoreCategoryInput, UpdateLoreCategoryInput } from '../schemas.js'

type LoreCategoryRow = typeof loreCategories.$inferSelect

function rowToLoreCategory(row: LoreCategoryRow) {
  return {
    id: row.id,
    title: row.title,
    orderIndex: row.orderIndex,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(loreCategories).where(eq(loreCategories.id, id))
  return row ? rowToLoreCategory(row) : undefined
}

export const loreCategoryService = {
  async list() {
    const rows = await db.select().from(loreCategories)
    return rows.map(rowToLoreCategory).sort((a, b) => a.orderIndex - b.orderIndex)
  },

  async create(input: CreateLoreCategoryInput) {
    const now = new Date()
    const id = randomUUID()
    const [row] = await db.select({ max: max(loreCategories.orderIndex) }).from(loreCategories)
    const orderIndex = (row?.max ?? -1) + 1
    await db.insert(loreCategories).values({
      id,
      title: input.title,
      orderIndex,
      createdAt: now,
      updatedAt: now,
    })
    return loadOne(id)
  },

  async update(id: string, patch: UpdateLoreCategoryInput) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Categoria não encontrada')

    await db
      .update(loreCategories)
      .set({
        title: patch.title,
        orderIndex: patch.orderIndex,
        updatedAt: new Date(),
      })
      .where(eq(loreCategories.id, id))
    return loadOne(id)
  },

  async remove(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Categoria não encontrada')
    await db.delete(loreCategories).where(eq(loreCategories.id, id))
  },
}

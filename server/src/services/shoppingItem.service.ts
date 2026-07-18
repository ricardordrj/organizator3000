import { randomUUID } from 'node:crypto'
import { eq, max } from 'drizzle-orm'
import { db } from '../db/client.js'
import { shoppingItems } from '../db/schema.js'
import { notFound } from '../lib/errors.js'
import type { CreateShoppingItemInput, UpdateShoppingItemInput } from '../schemas.js'

type ShoppingItemRow = typeof shoppingItems.$inferSelect

function rowToShoppingItem(row: ShoppingItemRow) {
  return {
    id: row.id,
    profileId: row.profileId,
    title: row.title,
    notes: row.notes ?? undefined,
    priceCents: row.priceCents ?? undefined,
    urgency: row.urgency,
    isDone: row.isDone,
    orderIndex: row.orderIndex,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(shoppingItems).where(eq(shoppingItems.id, id))
  return row ? rowToShoppingItem(row) : undefined
}

export const shoppingItemService = {
  async list() {
    const rows = await db.select().from(shoppingItems)
    return rows.map(rowToShoppingItem).sort((a, b) => a.orderIndex - b.orderIndex)
  },

  async create(input: CreateShoppingItemInput) {
    const now = new Date()
    const id = randomUUID()
    const [row] = await db
      .select({ max: max(shoppingItems.orderIndex) })
      .from(shoppingItems)
      .where(eq(shoppingItems.profileId, input.profileId))
    const orderIndex = (row?.max ?? -1) + 1
    await db.insert(shoppingItems).values({
      id,
      profileId: input.profileId,
      title: input.title,
      notes: input.notes,
      priceCents: input.priceCents,
      urgency: input.urgency ?? 'media',
      isDone: false,
      orderIndex,
      createdAt: now,
      updatedAt: now,
    })
    return loadOne(id)
  },

  async update(id: string, patch: UpdateShoppingItemInput) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Item não encontrado')

    await db
      .update(shoppingItems)
      .set({
        title: patch.title,
        notes: patch.notes,
        priceCents: patch.priceCents,
        urgency: patch.urgency,
        orderIndex: patch.orderIndex,
        updatedAt: new Date(),
      })
      .where(eq(shoppingItems.id, id))
    return loadOne(id)
  },

  async toggleDone(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Item não encontrado')

    await db.update(shoppingItems).set({ isDone: !existing.isDone, updatedAt: new Date() }).where(eq(shoppingItems.id, id))
    return loadOne(id)
  },

  async remove(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Item não encontrado')
    await db.delete(shoppingItems).where(eq(shoppingItems.id, id))
  },
}

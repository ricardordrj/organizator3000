import { randomUUID } from 'node:crypto'
import { eq, max } from 'drizzle-orm'
import { db } from '../db/client.js'
import { upgradeItems } from '../db/schema.js'
import { notFound } from '../lib/errors.js'
import type { CreateUpgradeItemInput, UpdateUpgradeItemInput } from '../schemas.js'

type UpgradeItemRow = typeof upgradeItems.$inferSelect

function rowToUpgradeItem(row: UpgradeItemRow) {
  return {
    id: row.id,
    phaseId: row.phaseId,
    title: row.title,
    notes: row.notes ?? undefined,
    priceCents: row.priceCents ?? undefined,
    isDone: row.isDone,
    orderIndex: row.orderIndex,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(upgradeItems).where(eq(upgradeItems.id, id))
  return row ? rowToUpgradeItem(row) : undefined
}

export const upgradeItemService = {
  async list() {
    const rows = await db.select().from(upgradeItems)
    return rows.map(rowToUpgradeItem).sort((a, b) => a.orderIndex - b.orderIndex)
  },

  async create(input: CreateUpgradeItemInput) {
    const now = new Date()
    const id = randomUUID()
    const [row] = await db
      .select({ max: max(upgradeItems.orderIndex) })
      .from(upgradeItems)
      .where(eq(upgradeItems.phaseId, input.phaseId))
    const orderIndex = (row?.max ?? -1) + 1
    await db.insert(upgradeItems).values({
      id,
      phaseId: input.phaseId,
      title: input.title,
      notes: input.notes,
      priceCents: input.priceCents,
      isDone: false,
      orderIndex,
      createdAt: now,
      updatedAt: now,
    })
    return loadOne(id)
  },

  async update(id: string, patch: UpdateUpgradeItemInput) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Item não encontrado')

    await db
      .update(upgradeItems)
      .set({
        title: patch.title,
        notes: patch.notes,
        priceCents: patch.priceCents,
        orderIndex: patch.orderIndex,
        updatedAt: new Date(),
      })
      .where(eq(upgradeItems.id, id))
    return loadOne(id)
  },

  async toggleDone(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Item não encontrado')

    await db.update(upgradeItems).set({ isDone: !existing.isDone, updatedAt: new Date() }).where(eq(upgradeItems.id, id))
    return loadOne(id)
  },

  async remove(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Item não encontrado')
    await db.delete(upgradeItems).where(eq(upgradeItems.id, id))
  },
}

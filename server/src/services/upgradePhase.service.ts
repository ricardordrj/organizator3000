import { randomUUID } from 'node:crypto'
import { eq, max } from 'drizzle-orm'
import { db } from '../db/client.js'
import { upgradePhases } from '../db/schema.js'
import { notFound } from '../lib/errors.js'
import type { CreateUpgradePhaseInput, UpdateUpgradePhaseInput } from '../schemas.js'

type UpgradePhaseRow = typeof upgradePhases.$inferSelect

function rowToUpgradePhase(row: UpgradePhaseRow) {
  return {
    id: row.id,
    title: row.title,
    orderIndex: row.orderIndex,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(upgradePhases).where(eq(upgradePhases.id, id))
  return row ? rowToUpgradePhase(row) : undefined
}

export const upgradePhaseService = {
  async list() {
    const rows = await db.select().from(upgradePhases)
    return rows.map(rowToUpgradePhase).sort((a, b) => a.orderIndex - b.orderIndex)
  },

  async create(input: CreateUpgradePhaseInput) {
    const now = new Date()
    const id = randomUUID()
    const [row] = await db.select({ max: max(upgradePhases.orderIndex) }).from(upgradePhases)
    const orderIndex = (row?.max ?? -1) + 1
    await db.insert(upgradePhases).values({
      id,
      title: input.title,
      orderIndex,
      createdAt: now,
      updatedAt: now,
    })
    return loadOne(id)
  },

  async update(id: string, patch: UpdateUpgradePhaseInput) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Fase não encontrada')

    await db
      .update(upgradePhases)
      .set({
        title: patch.title,
        orderIndex: patch.orderIndex,
        updatedAt: new Date(),
      })
      .where(eq(upgradePhases.id, id))
    return loadOne(id)
  },

  async remove(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Fase não encontrada')
    await db.delete(upgradePhases).where(eq(upgradePhases.id, id))
  },
}

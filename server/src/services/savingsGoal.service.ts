import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { savingsGoals } from '../db/schema.js'
import { notFound } from '../lib/errors.js'
import type { CreateSavingsGoalInput, UpdateSavingsGoalInput, ContributeSavingsGoalInput } from '../schemas.js'

type SavingsGoalRow = typeof savingsGoals.$inferSelect

function rowToSavingsGoal(row: SavingsGoalRow) {
  return {
    id: row.id,
    profileId: row.profileId,
    name: row.name,
    targetCents: row.targetCents,
    currentCents: row.currentCents,
    deadline: row.deadline ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(savingsGoals).where(eq(savingsGoals.id, id))
  return row ? rowToSavingsGoal(row) : undefined
}

export const savingsGoalService = {
  async list() {
    const rows = await db.select().from(savingsGoals)
    return rows.map(rowToSavingsGoal)
  },

  async get(id: string) {
    return loadOne(id)
  },

  async create(input: CreateSavingsGoalInput) {
    const now = new Date()
    const id = randomUUID()
    await db.insert(savingsGoals).values({
      id,
      profileId: input.profileId,
      name: input.name,
      targetCents: input.targetCents,
      currentCents: 0,
      deadline: input.deadline,
      createdAt: now,
      updatedAt: now,
    })
    return loadOne(id)
  },

  async update(id: string, patch: UpdateSavingsGoalInput) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Meta não encontrada')

    await db
      .update(savingsGoals)
      .set({
        name: patch.name,
        targetCents: patch.targetCents,
        deadline: patch.deadline,
        updatedAt: new Date(),
      })
      .where(eq(savingsGoals.id, id))
    return loadOne(id)
  },

  async contribute(id: string, input: ContributeSavingsGoalInput) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Meta não encontrada')

    await db
      .update(savingsGoals)
      .set({ currentCents: existing.currentCents + input.amountCents, updatedAt: new Date() })
      .where(eq(savingsGoals.id, id))
    return loadOne(id)
  },

  async remove(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Meta não encontrada')
    await db.delete(savingsGoals).where(eq(savingsGoals.id, id))
  },
}

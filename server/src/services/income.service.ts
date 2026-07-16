import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { incomes } from '../db/schema.js'
import { notFound } from '../lib/errors.js'
import type { CreateIncomeInput, UpdateIncomeInput } from '../schemas.js'

type IncomeRow = typeof incomes.$inferSelect

function rowToIncome(row: IncomeRow) {
  return {
    id: row.id,
    description: row.description,
    amountCents: row.amountCents,
    kind: row.kind,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(incomes).where(eq(incomes.id, id))
  return row ? rowToIncome(row) : undefined
}

export const incomeService = {
  async list() {
    const rows = await db.select().from(incomes)
    return rows.map(rowToIncome)
  },

  async create(input: CreateIncomeInput) {
    const now = new Date()
    const id = randomUUID()
    await db.insert(incomes).values({
      id,
      description: input.description,
      amountCents: input.amountCents,
      kind: input.kind,
      createdAt: now,
      updatedAt: now,
    })
    return loadOne(id)
  },

  async update(id: string, patch: UpdateIncomeInput) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Renda não encontrada')

    await db
      .update(incomes)
      .set({
        description: patch.description,
        amountCents: patch.amountCents,
        kind: patch.kind,
        updatedAt: new Date(),
      })
      .where(eq(incomes.id, id))
    return loadOne(id)
  },

  async remove(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Renda não encontrada')
    await db.delete(incomes).where(eq(incomes.id, id))
  },
}

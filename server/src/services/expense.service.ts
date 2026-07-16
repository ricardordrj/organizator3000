import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { expenses } from '../db/schema.js'
import { notFound } from '../lib/errors.js'
import type { CreateExpenseInput, UpdateExpenseInput } from '../schemas.js'

type ExpenseRow = typeof expenses.$inferSelect

function isPaidThisCycle(lastPaidAt: Date | null): boolean {
  if (!lastPaidAt) return false
  const now = new Date()
  return lastPaidAt.getFullYear() === now.getFullYear() && lastPaidAt.getMonth() === now.getMonth()
}

function rowToExpense(row: ExpenseRow) {
  return {
    id: row.id,
    description: row.description,
    amountCents: row.amountCents,
    category: row.category,
    kind: row.kind,
    dueDay: row.dueDay,
    lastPaidAt: row.lastPaidAt ?? undefined,
    isPaidThisCycle: isPaidThisCycle(row.lastPaidAt),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(expenses).where(eq(expenses.id, id))
  return row ? rowToExpense(row) : undefined
}

export const expenseService = {
  async list() {
    const rows = await db.select().from(expenses)
    return rows.map(rowToExpense)
  },

  async get(id: string) {
    return loadOne(id)
  },

  async create(input: CreateExpenseInput) {
    const now = new Date()
    const id = randomUUID()
    await db.insert(expenses).values({
      id,
      description: input.description,
      amountCents: input.amountCents,
      category: input.category,
      kind: input.kind,
      dueDay: input.dueDay,
      createdAt: now,
      updatedAt: now,
    })
    return loadOne(id)
  },

  async update(id: string, patch: UpdateExpenseInput) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Despesa não encontrada')

    await db
      .update(expenses)
      .set({
        description: patch.description,
        amountCents: patch.amountCents,
        category: patch.category,
        kind: patch.kind,
        dueDay: patch.dueDay,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
    return loadOne(id)
  },

  async markPaid(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Despesa não encontrada')

    await db.update(expenses).set({ lastPaidAt: new Date(), updatedAt: new Date() }).where(eq(expenses.id, id))
    return loadOne(id)
  },

  async remove(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Despesa não encontrada')
    await db.delete(expenses).where(eq(expenses.id, id))
  },
}

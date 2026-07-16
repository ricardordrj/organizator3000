import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { financeProfiles, expenses, incomes, mealVoucherPurchases, savingsGoals } from '../db/schema.js'
import { conflict, notFound } from '../lib/errors.js'
import type { CreateFinanceProfileInput, UpdateFinanceProfileInput } from '../schemas.js'

type FinanceProfileRow = typeof financeProfiles.$inferSelect

function rowToFinanceProfile(row: FinanceProfileRow) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(financeProfiles).where(eq(financeProfiles.id, id))
  return row ? rowToFinanceProfile(row) : undefined
}

export const financeProfileService = {
  async list() {
    const rows = await db.select().from(financeProfiles)
    return rows.map(rowToFinanceProfile)
  },

  async create(input: CreateFinanceProfileInput) {
    const now = new Date()
    const id = randomUUID()
    await db.insert(financeProfiles).values({ id, name: input.name, createdAt: now, updatedAt: now })
    return loadOne(id)
  },

  async update(id: string, patch: UpdateFinanceProfileInput) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Perfil não encontrado')

    await db
      .update(financeProfiles)
      .set({ name: patch.name, updatedAt: new Date() })
      .where(eq(financeProfiles.id, id))
    return loadOne(id)
  },

  async remove(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Perfil não encontrado')

    const [[expenseRow], [incomeRow], [mealVoucherRow], [savingsGoalRow]] = await Promise.all([
      db.select({ id: expenses.id }).from(expenses).where(eq(expenses.profileId, id)).limit(1),
      db.select({ id: incomes.id }).from(incomes).where(eq(incomes.profileId, id)).limit(1),
      db
        .select({ id: mealVoucherPurchases.id })
        .from(mealVoucherPurchases)
        .where(eq(mealVoucherPurchases.profileId, id))
        .limit(1),
      db.select({ id: savingsGoals.id }).from(savingsGoals).where(eq(savingsGoals.profileId, id)).limit(1),
    ])
    if (expenseRow || incomeRow || mealVoucherRow || savingsGoalRow) {
      throw conflict('Não é possível excluir: existem lançamentos financeiros nesse perfil')
    }

    await db.delete(financeProfiles).where(eq(financeProfiles.id, id))
  },
}

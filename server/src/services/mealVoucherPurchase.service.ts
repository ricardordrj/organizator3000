import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { mealVoucherPurchases } from '../db/schema.js'
import { notFound } from '../lib/errors.js'
import type { CreateMealVoucherPurchaseInput } from '../schemas.js'

type MealVoucherPurchaseRow = typeof mealVoucherPurchases.$inferSelect

function rowToPurchase(row: MealVoucherPurchaseRow) {
  return {
    id: row.id,
    description: row.description,
    amountCents: row.amountCents,
    purchasedAt: row.purchasedAt,
    createdAt: row.createdAt,
  }
}

export const mealVoucherPurchaseService = {
  async list() {
    const rows = await db.select().from(mealVoucherPurchases)
    return rows.map(rowToPurchase)
  },

  async create(input: CreateMealVoucherPurchaseInput) {
    const now = new Date()
    const id = randomUUID()
    await db.insert(mealVoucherPurchases).values({
      id,
      description: input.description,
      amountCents: input.amountCents,
      purchasedAt: input.purchasedAt ?? now,
      createdAt: now,
    })
    const [row] = await db.select().from(mealVoucherPurchases).where(eq(mealVoucherPurchases.id, id))
    return rowToPurchase(row)
  },

  async remove(id: string) {
    const [row] = await db.select().from(mealVoucherPurchases).where(eq(mealVoucherPurchases.id, id))
    if (!row) throw notFound('Compra não encontrada')
    await db.delete(mealVoucherPurchases).where(eq(mealVoucherPurchases.id, id))
  },
}

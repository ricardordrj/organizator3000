import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { shoppingProfiles, shoppingItems } from '../db/schema.js'
import { conflict, notFound } from '../lib/errors.js'
import type { CreateShoppingProfileInput, UpdateShoppingProfileInput } from '../schemas.js'

type ShoppingProfileRow = typeof shoppingProfiles.$inferSelect

function rowToShoppingProfile(row: ShoppingProfileRow) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(shoppingProfiles).where(eq(shoppingProfiles.id, id))
  return row ? rowToShoppingProfile(row) : undefined
}

export const shoppingProfileService = {
  async list() {
    const rows = await db.select().from(shoppingProfiles)
    return rows.map(rowToShoppingProfile)
  },

  async create(input: CreateShoppingProfileInput) {
    const now = new Date()
    const id = randomUUID()
    await db.insert(shoppingProfiles).values({ id, name: input.name, createdAt: now, updatedAt: now })
    return loadOne(id)
  },

  async update(id: string, patch: UpdateShoppingProfileInput) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Perfil não encontrado')

    await db
      .update(shoppingProfiles)
      .set({ name: patch.name, updatedAt: new Date() })
      .where(eq(shoppingProfiles.id, id))
    return loadOne(id)
  },

  async remove(id: string) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Perfil não encontrado')

    const [itemRow] = await db
      .select({ id: shoppingItems.id })
      .from(shoppingItems)
      .where(eq(shoppingItems.profileId, id))
      .limit(1)
    if (itemRow) {
      throw conflict('Não é possível excluir: existem itens cadastrados nesse perfil')
    }

    await db.delete(shoppingProfiles).where(eq(shoppingProfiles.id, id))
  },
}

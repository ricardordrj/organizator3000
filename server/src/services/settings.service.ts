import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { settings } from '../db/schema.js'
import type { SettingsInput } from '../schemas.js'

const SETTINGS_ROW_ID = 1

export const settingsService = {
  async get() {
    const [row] = await db.select().from(settings).where(eq(settings.id, SETTINGS_ROW_ID))
    if (row) return row
    const defaults = { theme: 'system' as const, language: 'pt-BR' as const }
    await db.insert(settings).values({ id: SETTINGS_ROW_ID, ...defaults, updatedAt: new Date() })
    return { id: SETTINGS_ROW_ID, ...defaults, updatedAt: new Date() }
  },

  async save(input: SettingsInput) {
    const now = new Date()
    await db
      .insert(settings)
      .values({ id: SETTINGS_ROW_ID, ...input, updatedAt: now })
      .onConflictDoUpdate({
        target: settings.id,
        set: { theme: input.theme, language: input.language, updatedAt: now },
      })
    const [row] = await db.select().from(settings).where(eq(settings.id, SETTINGS_ROW_ID))
    return row
  },
}

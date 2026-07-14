import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { notes } from '../db/schema.js'
import { notFound } from '../lib/errors.js'
import type { CreateNoteInput, UpdateNoteInput } from '../schemas.js'

type NoteRow = typeof notes.$inferSelect

function rowToNote(row: NoteRow) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tags: row.tagsJson ?? [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(notes).where(eq(notes.id, id))
  return row ? rowToNote(row) : undefined
}

export const noteService = {
  async list() {
    const rows = await db.select().from(notes)
    return rows.map(rowToNote)
  },

  async create(input: CreateNoteInput) {
    const now = new Date()
    const id = randomUUID()
    await db.insert(notes).values({
      id,
      title: input.title,
      content: input.content ?? '',
      tagsJson: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
    })
    return loadOne(id)
  },

  async update(id: string, patch: UpdateNoteInput) {
    const existing = await loadOne(id)
    if (!existing) throw notFound('Nota não encontrada')

    await db
      .update(notes)
      .set({
        title: patch.title,
        content: patch.content,
        tagsJson: patch.tags,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id))

    return loadOne(id)
  },

  async remove(id: string) {
    await db.delete(notes).where(eq(notes.id, id))
  },
}

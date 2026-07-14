import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { tasks, blockRecords, historyEntries } from '../db/schema.js'
import { conflict, notFound } from '../lib/errors.js'
import type { CreateTaskInput, UpdateTaskInput } from '../schemas.js'

type TaskRow = typeof tasks.$inferSelect
type BlockRecordRow = typeof blockRecords.$inferSelect
type HistoryEntryRow = typeof historyEntries.$inferSelect
type HistoryAction = HistoryEntryRow['action']

function rowToTask(row: TaskRow, blocks: BlockRecordRow[], history: HistoryEntryRow[]) {
  const shared = {
    id: row.id,
    kind: row.kind,
    title: row.title,
    status: row.status,
    priority: row.priority,
    deadline: row.deadline ?? undefined,
    timeSpentHours: row.timeSpentHours ?? undefined,
    isBlocked: row.isBlocked,
    blockHistory: [...blocks]
      .sort((a, b) => a.blockedAt.getTime() - b.blockedAt.getTime())
      .map((b) => ({
        id: b.id,
        reason: b.reason,
        blockedAt: b.blockedAt,
        unblockedAt: b.unblockedAt ?? undefined,
      })),
    history: [...history]
      .sort((a, b) => a.at.getTime() - b.at.getTime())
      .map((h) => ({ id: h.id, action: h.action, description: h.description, at: h.at })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }

  if (row.kind === 'simple') {
    return shared
  }

  return {
    ...shared,
    description: row.description ?? '',
    assignee: row.assignee ?? undefined,
    reporter: row.reporter ?? undefined,
    estimatedHours: row.estimatedHours ?? undefined,
    externalRef: row.externalRef ?? undefined,
    links: row.linksJson ?? [],
    tags: row.tagsJson ?? [],
  }
}

function historyRow(taskId: string, action: HistoryAction, description: string) {
  return { id: randomUUID(), taskId, action, description, at: new Date() }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(tasks).where(eq(tasks.id, id))
  if (!row) return undefined
  const blocks = await db.select().from(blockRecords).where(eq(blockRecords.taskId, id))
  const history = await db.select().from(historyEntries).where(eq(historyEntries.taskId, id))
  return rowToTask(row, blocks, history)
}

export const taskService = {
  async list() {
    const rows = await db.select().from(tasks)
    const allBlocks = await db.select().from(blockRecords)
    const allHistory = await db.select().from(historyEntries)
    return rows.map((row) =>
      rowToTask(
        row,
        allBlocks.filter((b) => b.taskId === row.id),
        allHistory.filter((h) => h.taskId === row.id),
      ),
    )
  },

  async get(id: string) {
    return loadOne(id)
  },

  async create(input: CreateTaskInput) {
    const now = new Date()
    const id = randomUUID()

    await db.insert(tasks).values({
      id,
      kind: input.kind,
      title: input.title,
      priority: input.priority,
      deadline: input.deadline,
      description: input.kind === 'full' ? (input.description ?? '') : undefined,
      assignee: input.kind === 'full' ? input.assignee : undefined,
      reporter: input.kind === 'full' ? input.reporter : undefined,
      estimatedHours: input.kind === 'full' ? input.estimatedHours : undefined,
      externalRef: input.kind === 'full' ? input.externalRef : undefined,
      linksJson: input.kind === 'full' ? (input.links ?? []) : undefined,
      tagsJson: input.kind === 'full' ? (input.tags ?? []) : undefined,
      createdAt: now,
      updatedAt: now,
    })
    await db.insert(historyEntries).values(historyRow(id, 'created', 'Tarefa criada'))

    return loadOne(id)
  },

  async update(id: string, patch: UpdateTaskInput) {
    const current = await loadOne(id)
    if (!current) throw notFound('Tarefa não encontrada')

    const newHistory: (typeof historyEntries.$inferInsert)[] = []
    if (patch.status && patch.status !== current.status) {
      newHistory.push(
        historyRow(id, 'status_changed', `Status alterado de "${current.status}" para "${patch.status}"`),
      )
    }
    if (patch.priority && patch.priority !== current.priority) {
      newHistory.push(
        historyRow(id, 'priority_changed', `Prioridade alterada de "${current.priority}" para "${patch.priority}"`),
      )
    }
    if (patch.deadline && patch.deadline.getTime() !== current.deadline?.getTime()) {
      const reasonSuffix = patch.changeReason ? ` — Motivo: ${patch.changeReason}` : ''
      newHistory.push(historyRow(id, 'deadline_changed', `Prazo de entrega alterado${reasonSuffix}`))
    }

    await db
      .update(tasks)
      .set({
        title: patch.title,
        status: patch.status,
        priority: patch.priority,
        deadline: patch.deadline,
        timeSpentHours: patch.timeSpentHours,
        description: patch.description,
        assignee: patch.assignee,
        reporter: patch.reporter,
        estimatedHours: patch.estimatedHours,
        externalRef: patch.externalRef,
        linksJson: patch.links,
        tagsJson: patch.tags,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))

    if (newHistory.length > 0) {
      await db.insert(historyEntries).values(newHistory)
    }

    return loadOne(id)
  },

  async block(id: string, reason: string) {
    const current = await loadOne(id)
    if (!current) throw notFound('Tarefa não encontrada')

    await db.insert(blockRecords).values({
      id: randomUUID(),
      taskId: id,
      reason,
      blockedAt: new Date(),
    })
    await db.update(tasks).set({ isBlocked: true, updatedAt: new Date() }).where(eq(tasks.id, id))
    await db.insert(historyEntries).values(historyRow(id, 'blocked', `Bloqueada: ${reason}`))

    return loadOne(id)
  },

  async unblock(id: string) {
    const current = await loadOne(id)
    if (!current) throw notFound('Tarefa não encontrada')

    const activeBlock = current.blockHistory.find((b) => !b.unblockedAt)
    if (activeBlock) {
      await db
        .update(blockRecords)
        .set({ unblockedAt: new Date() })
        .where(eq(blockRecords.id, activeBlock.id))
    }
    await db.update(tasks).set({ isBlocked: false, updatedAt: new Date() }).where(eq(tasks.id, id))
    await db.insert(historyEntries).values(historyRow(id, 'unblocked', 'Bloqueio removido'))

    return loadOne(id)
  },

  async complete(id: string) {
    const current = await loadOne(id)
    if (!current) throw notFound('Tarefa não encontrada')
    if (current.isBlocked) throw conflict('Desbloqueie a tarefa antes de concluir')

    await db
      .update(tasks)
      .set({ status: 'done', updatedAt: new Date() })
      .where(eq(tasks.id, id))
    await db.insert(historyEntries).values(historyRow(id, 'completed', 'Tarefa concluída'))

    return loadOne(id)
  },

  async remove(id: string) {
    await db.delete(tasks).where(eq(tasks.id, id))
  },
}

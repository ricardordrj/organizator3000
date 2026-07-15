import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import { eq, inArray, isNull } from 'drizzle-orm'
import { db } from '../db/client.js'
import { tasks, blockRecords, historyEntries, attachments, people, tags, taskTags, responses } from '../db/schema.js'
import { conflict, notFound } from '../lib/errors.js'
import { attachmentService } from './attachment.service.js'
import type { CreateTaskInput, UpdateTaskInput } from '../schemas.js'

type TaskRow = typeof tasks.$inferSelect
type BlockRecordRow = typeof blockRecords.$inferSelect
type HistoryEntryRow = typeof historyEntries.$inferSelect
type AttachmentRow = typeof attachments.$inferSelect
type PersonRow = typeof people.$inferSelect
type TagRow = typeof tags.$inferSelect
type ResponseRow = typeof responses.$inferSelect
type HistoryAction = HistoryEntryRow['action']
type ResponseWithAttachments = { response: ResponseRow; attachments: AttachmentRow[] }

function rowToTask(
  row: TaskRow,
  blocks: BlockRecordRow[],
  history: HistoryEntryRow[],
  taskAttachments: AttachmentRow[],
  assigneePerson: PersonRow | undefined,
  reporterPerson: PersonRow | undefined,
  taskTagRows: TagRow[],
  taskResponses: ResponseWithAttachments[],
) {
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
    assignee: assigneePerson ? { id: assigneePerson.id, name: assigneePerson.name } : undefined,
    reporter: reporterPerson ? { id: reporterPerson.id, name: reporterPerson.name } : undefined,
    estimatedHours: row.estimatedHours ?? undefined,
    externalRef: row.externalRef ?? undefined,
    links: row.linksJson ?? [],
    tags: taskTagRows.map((t) => ({ id: t.id, name: t.name, color: t.color ?? undefined })),
    attachments: [...taskAttachments]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((a) => ({
        id: a.id,
        fileName: a.fileName,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes,
        kind: a.kind,
        createdAt: a.createdAt,
      })),
    responses: [...taskResponses]
      .sort((a, b) => a.response.createdAt.getTime() - b.response.createdAt.getTime())
      .map(({ response, attachments: responseAttachments }) => ({
        id: response.id,
        taskId: response.taskId,
        message: response.message,
        createdAt: response.createdAt,
        attachments: [...responseAttachments]
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .map((a) => ({
            id: a.id,
            fileName: a.fileName,
            mimeType: a.mimeType,
            sizeBytes: a.sizeBytes,
            kind: a.kind,
            createdAt: a.createdAt,
          })),
      })),
  }
}

function historyRow(taskId: string, action: HistoryAction, description: string) {
  return { id: randomUUID(), taskId, action, description, at: new Date() }
}

async function loadTagsForTasks(taskIds: string[]) {
  if (taskIds.length === 0) return new Map<string, TagRow[]>()
  const rows = await db
    .select({ taskId: taskTags.taskId, tag: tags })
    .from(taskTags)
    .innerJoin(tags, eq(taskTags.tagId, tags.id))
    .where(inArray(taskTags.taskId, taskIds))
  const map = new Map<string, TagRow[]>()
  for (const row of rows) {
    const list = map.get(row.taskId) ?? []
    list.push(row.tag)
    map.set(row.taskId, list)
  }
  return map
}

async function loadResponsesForTasks(taskIds: string[]) {
  if (taskIds.length === 0) return new Map<string, ResponseWithAttachments[]>()
  const rows = await db.select().from(responses).where(inArray(responses.taskId, taskIds))
  const responseIds = rows.map((r) => r.id)
  const responseAttachments =
    responseIds.length > 0
      ? await db.select().from(attachments).where(inArray(attachments.responseId, responseIds))
      : []
  const map = new Map<string, ResponseWithAttachments[]>()
  for (const row of rows) {
    const list = map.get(row.taskId) ?? []
    list.push({ response: row, attachments: responseAttachments.filter((a) => a.responseId === row.id) })
    map.set(row.taskId, list)
  }
  return map
}

async function syncTaskTags(taskId: string, tagIds: string[] | undefined) {
  if (tagIds === undefined) return
  await db.delete(taskTags).where(eq(taskTags.taskId, taskId))
  if (tagIds.length > 0) {
    await db.insert(taskTags).values(tagIds.map((tagId) => ({ taskId, tagId })))
  }
}

async function loadOne(id: string) {
  const [row] = await db.select().from(tasks).where(eq(tasks.id, id))
  if (!row) return undefined
  const blocks = await db.select().from(blockRecords).where(eq(blockRecords.taskId, id))
  const history = await db.select().from(historyEntries).where(eq(historyEntries.taskId, id))
  const taskAttachments = await db
    .select()
    .from(attachments)
    .where(eq(attachments.taskId, id))
  const [assigneePerson] = row.assigneeId
    ? await db.select().from(people).where(eq(people.id, row.assigneeId))
    : []
  const [reporterPerson] = row.reporterId
    ? await db.select().from(people).where(eq(people.id, row.reporterId))
    : []
  const tagsByTask = await loadTagsForTasks([id])
  const responsesByTask = await loadResponsesForTasks([id])

  return rowToTask(
    row,
    blocks,
    history,
    taskAttachments.filter((a) => a.responseId == null),
    assigneePerson,
    reporterPerson,
    tagsByTask.get(id) ?? [],
    responsesByTask.get(id) ?? [],
  )
}

export const taskService = {
  async list() {
    const rows = await db.select().from(tasks)
    const allBlocks = await db.select().from(blockRecords)
    const allHistory = await db.select().from(historyEntries)
    const allAttachments = await db.select().from(attachments).where(isNull(attachments.responseId))
    const allPeople = await db.select().from(people)
    const tagsByTask = await loadTagsForTasks(rows.map((r) => r.id))
    const responsesByTask = await loadResponsesForTasks(rows.map((r) => r.id))

    return rows.map((row) =>
      rowToTask(
        row,
        allBlocks.filter((b) => b.taskId === row.id),
        allHistory.filter((h) => h.taskId === row.id),
        allAttachments.filter((a) => a.taskId === row.id),
        allPeople.find((p) => p.id === row.assigneeId),
        allPeople.find((p) => p.id === row.reporterId),
        tagsByTask.get(row.id) ?? [],
        responsesByTask.get(row.id) ?? [],
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
      assigneeId: input.kind === 'full' ? input.assigneeId : undefined,
      reporterId: input.kind === 'full' ? input.reporterId : undefined,
      estimatedHours: input.kind === 'full' ? input.estimatedHours : undefined,
      externalRef: input.kind === 'full' ? input.externalRef : undefined,
      linksJson: input.kind === 'full' ? (input.links ?? []) : undefined,
      createdAt: now,
      updatedAt: now,
    })
    if (input.kind === 'full' && input.tagIds) {
      await syncTaskTags(id, input.tagIds)
    }
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
        assigneeId: patch.assigneeId,
        reporterId: patch.reporterId,
        estimatedHours: patch.estimatedHours,
        externalRef: patch.externalRef,
        linksJson: patch.links,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
    await syncTaskTags(id, patch.tagIds)

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
    const taskAttachments = await db.select().from(attachments).where(eq(attachments.taskId, id))
    await Promise.all(
      taskAttachments.map((a) => fs.rm(attachmentService.getFilePath(a.storedName), { force: true })),
    )
    await db.delete(tasks).where(eq(tasks.id, id))
  },
}

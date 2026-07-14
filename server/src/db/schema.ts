import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// ---------- tasks ----------
export const tasks = sqliteTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    kind: text('kind', { enum: ['simple', 'full'] }).notNull(),

    // shared fields
    title: text('title').notNull(),
    status: text('status', { enum: ['pending', 'in_progress', 'done'] })
      .notNull()
      .default('pending'),
    priority: text('priority', { enum: ['low', 'medium', 'high'] })
      .notNull()
      .default('medium'),
    deadline: integer('deadline', { mode: 'timestamp_ms' }),
    timeSpentHours: real('time_spent_hours'),
    isBlocked: integer('is_blocked', { mode: 'boolean' }).notNull().default(false),

    // full-only fields (nullable on simple rows)
    description: text('description'),
    assignee: text('assignee'),
    reporter: text('reporter'),
    estimatedHours: real('estimated_hours'),
    externalRef: text('external_ref'),
    linksJson: text('links_json', { mode: 'json' }).$type<
      { id: string; label?: string; url: string }[]
    >(),
    // Fase A: tags continuam como lista fechada (mesma semântica do front hoje).
    // Migra para a relação tags/task_tags quando a Fase D construir a tela de admin.
    tagsJson: text('tags_json', { mode: 'json' }).$type<string[]>(),

    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    statusIdx: index('tasks_status_idx').on(t.status),
    deadlineIdx: index('tasks_deadline_idx').on(t.deadline),
    blockedIdx: index('tasks_is_blocked_idx').on(t.isBlocked),
  }),
)

// ---------- block_records ----------
export const blockRecords = sqliteTable(
  'block_records',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    reason: text('reason').notNull(),
    blockedAt: integer('blocked_at', { mode: 'timestamp_ms' }).notNull(),
    unblockedAt: integer('unblocked_at', { mode: 'timestamp_ms' }),
  },
  (t) => ({
    taskIdx: index('block_records_task_idx').on(t.taskId),
    activeIdx: index('block_records_active_idx').on(t.taskId, t.unblockedAt),
  }),
)

// ---------- history_entries ----------
export const historyEntries = sqliteTable(
  'history_entries',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    action: text('action', {
      enum: [
        'created',
        'status_changed',
        'priority_changed',
        'deadline_changed',
        'blocked',
        'unblocked',
        'edited',
        'completed',
        'responded',
      ],
    }).notNull(),
    description: text('description').notNull(),
    at: integer('at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    taskIdx: index('history_entries_task_idx').on(t.taskId),
  }),
)

// ---------- responses (thread de respostas — Fase C) ----------
export const responses = sqliteTable(
  'responses',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    taskIdx: index('responses_task_idx').on(t.taskId),
  }),
)

// ---------- attachments (Fase B) ----------
export const attachments = sqliteTable(
  'attachments',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    // null = anexo direto na task; preenchido = anexo de uma resposta específica
    responseId: text('response_id').references(() => responses.id, { onDelete: 'cascade' }),
    fileName: text('file_name').notNull(),
    storedName: text('stored_name').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    kind: text('kind', { enum: ['image', 'code'] }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    taskIdx: index('attachments_task_idx').on(t.taskId),
    responseIdx: index('attachments_response_idx').on(t.responseId),
  }),
)

// ---------- tags (Fase D) ----------
export const tags = sqliteTable(
  'tags',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    color: text('color'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    nameUnique: uniqueIndex('tags_name_unique').on(t.name),
  }),
)

// ---------- task_tags (join N:N — Fase D) ----------
export const taskTags = sqliteTable(
  'task_tags',
  {
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: uniqueIndex('task_tags_pk').on(t.taskId, t.tagId),
  }),
)

// ---------- notes ----------
export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  tagsJson: text('tags_json', { mode: 'json' }).$type<string[]>().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

// ---------- settings (linha única, id=1, sem auth) ----------
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),
  theme: text('theme', { enum: ['light', 'dark', 'system'] })
    .notNull()
    .default('system'),
  language: text('language', { enum: ['pt-BR', 'en-US'] })
    .notNull()
    .default('pt-BR'),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

// ---------- relations ----------
export const tasksRelations = relations(tasks, ({ many }) => ({
  blockRecords: many(blockRecords),
  historyEntries: many(historyEntries),
  responses: many(responses),
  attachments: many(attachments),
  taskTags: many(taskTags),
}))

export const blockRecordsRelations = relations(blockRecords, ({ one }) => ({
  task: one(tasks, { fields: [blockRecords.taskId], references: [tasks.id] }),
}))

export const historyEntriesRelations = relations(historyEntries, ({ one }) => ({
  task: one(tasks, { fields: [historyEntries.taskId], references: [tasks.id] }),
}))

export const responsesRelations = relations(responses, ({ one, many }) => ({
  task: one(tasks, { fields: [responses.taskId], references: [tasks.id] }),
  attachments: many(attachments),
}))

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  task: one(tasks, { fields: [attachments.taskId], references: [tasks.id] }),
  response: one(responses, { fields: [attachments.responseId], references: [responses.id] }),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  taskTags: many(taskTags),
}))

export const taskTagsRelations = relations(taskTags, ({ one }) => ({
  task: one(tasks, { fields: [taskTags.taskId], references: [tasks.id] }),
  tag: one(tags, { fields: [taskTags.tagId], references: [tags.id] }),
}))

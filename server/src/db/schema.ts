import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// ---------- people (devs/POs — Fase D) ----------
export const people = sqliteTable(
  'people',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    role: text('role', { enum: ['dev', 'po'] }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    nameUnique: uniqueIndex('people_name_unique').on(t.name),
  }),
)

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
    assigneeId: text('assignee_id').references(() => people.id, { onDelete: 'restrict' }),
    reporterId: text('reporter_id').references(() => people.id, { onDelete: 'restrict' }),
    estimatedHours: real('estimated_hours'),
    externalRef: text('external_ref'),
    linksJson: text('links_json', { mode: 'json' }).$type<
      { id: string; label?: string; url: string }[]
    >(),

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

// ---------- finance_profiles (perfis isolados — Ricardo, mãe, etc.) ----------
export const financeProfiles = sqliteTable('finance_profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

// ---------- expenses (contas a pagar + assinaturas — Fase Finanças) ----------
export const expenses = sqliteTable(
  'expenses',
  {
    id: text('id').primaryKey(),
    profileId: text('profile_id')
      .notNull()
      .references(() => financeProfiles.id, { onDelete: 'restrict' }),
    description: text('description').notNull(),
    amountCents: integer('amount_cents').notNull(),
    category: text('category', {
      enum: ['moradia', 'mercado', 'transporte', 'lazer', 'saude', 'assinatura', 'outros'],
    }).notNull(),
    kind: text('kind', { enum: ['bill', 'subscription'] }).notNull(),
    dueDay: integer('due_day').notNull(),
    // preenchido quando marcada como paga; comparado ao mês atual pra saber se já foi paga neste ciclo
    lastPaidAt: integer('last_paid_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    categoryIdx: index('expenses_category_idx').on(t.category),
    profileIdx: index('expenses_profile_idx').on(t.profileId),
  }),
)

// ---------- incomes (salário, vale alimentação etc. — Fase Finanças) ----------
export const incomes = sqliteTable(
  'incomes',
  {
    id: text('id').primaryKey(),
    profileId: text('profile_id')
      .notNull()
      .references(() => financeProfiles.id, { onDelete: 'restrict' }),
    description: text('description').notNull(),
    amountCents: integer('amount_cents').notNull(),
    kind: text('kind', { enum: ['salary', 'meal_voucher', 'other'] }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    profileIdx: index('incomes_profile_idx').on(t.profileId),
  }),
)

// ---------- meal_voucher_purchases (gasto rápido de supermercado, descontado do vale — Fase Finanças) ----------
export const mealVoucherPurchases = sqliteTable(
  'meal_voucher_purchases',
  {
    id: text('id').primaryKey(),
    profileId: text('profile_id')
      .notNull()
      .references(() => financeProfiles.id, { onDelete: 'restrict' }),
    description: text('description').notNull(),
    amountCents: integer('amount_cents').notNull(),
    purchasedAt: integer('purchased_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    purchasedAtIdx: index('meal_voucher_purchases_purchased_at_idx').on(t.purchasedAt),
    profileIdx: index('meal_voucher_purchases_profile_idx').on(t.profileId),
  }),
)

// ---------- savings_goals (metas de economia — Fase Finanças) ----------
export const savingsGoals = sqliteTable(
  'savings_goals',
  {
    id: text('id').primaryKey(),
    profileId: text('profile_id')
      .notNull()
      .references(() => financeProfiles.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    targetCents: integer('target_cents').notNull(),
    currentCents: integer('current_cents').notNull().default(0),
    deadline: integer('deadline', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    profileIdx: index('savings_goals_profile_idx').on(t.profileId),
  }),
)

// ---------- upgrade_phases (fases do planejamento de upgrade do PC) ----------
export const upgradePhases = sqliteTable(
  'upgrade_phases',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    orderIndex: integer('order_index').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    orderIdx: index('upgrade_phases_order_idx').on(t.orderIndex),
  }),
)

// ---------- upgrade_items (itens/tarefas de cada fase) ----------
export const upgradeItems = sqliteTable(
  'upgrade_items',
  {
    id: text('id').primaryKey(),
    phaseId: text('phase_id')
      .notNull()
      .references(() => upgradePhases.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    notes: text('notes'),
    priceCents: integer('price_cents'),
    isDone: integer('is_done', { mode: 'boolean' }).notNull().default(false),
    orderIndex: integer('order_index').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    phaseIdx: index('upgrade_items_phase_idx').on(t.phaseId),
    orderIdx: index('upgrade_items_order_idx').on(t.orderIndex),
  }),
)

// ---------- lore_categories (seções do wiki de world-building — Dark Fantasy — e projetos pessoais, mesmo schema) ----------
export const loreCategories = sqliteTable(
  'lore_categories',
  {
    id: text('id').primaryKey(),
    kind: text('kind', { enum: ['dark_fantasy', 'personal_project'] })
      .notNull()
      .default('dark_fantasy'),
    title: text('title').notNull(),
    orderIndex: integer('order_index').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    orderIdx: index('lore_categories_order_idx').on(t.orderIndex),
    kindIdx: index('lore_categories_kind_idx').on(t.kind),
  }),
)

// ---------- lore_entries (páginas dentro de cada categoria do wiki) ----------
export const loreEntries = sqliteTable(
  'lore_entries',
  {
    id: text('id').primaryKey(),
    categoryId: text('category_id')
      .notNull()
      .references(() => loreCategories.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    imagesJson: text('images_json', { mode: 'json' }).$type<string[]>().notNull(),
    orderIndex: integer('order_index').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    categoryIdx: index('lore_entries_category_idx').on(t.categoryId),
    orderIdx: index('lore_entries_order_idx').on(t.orderIndex),
  }),
)

// ---------- shopping_profiles (perfis por modalidade de compra — Peças, Utensílios domésticos, Roupas, Produtos) ----------
export const shoppingProfiles = sqliteTable('shopping_profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

// ---------- shopping_items (itens a comprar dentro de um perfil, com urgência e valor) ----------
export const shoppingItems = sqliteTable(
  'shopping_items',
  {
    id: text('id').primaryKey(),
    profileId: text('profile_id')
      .notNull()
      .references(() => shoppingProfiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    notes: text('notes'),
    priceCents: integer('price_cents'),
    urgency: text('urgency', { enum: ['baixa', 'media', 'alta'] })
      .notNull()
      .default('media'),
    isDone: integer('is_done', { mode: 'boolean' }).notNull().default(false),
    orderIndex: integer('order_index').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    profileIdx: index('shopping_items_profile_idx').on(t.profileId),
    orderIdx: index('shopping_items_order_idx').on(t.orderIndex),
    urgencyIdx: index('shopping_items_urgency_idx').on(t.urgency),
  }),
)

// ---------- commander_players (perfis fixos do mesão de Commander) ----------
export const commanderPlayers = sqliteTable(
  'commander_players',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    colorHex: text('color_hex'),
    avatarStoredName: text('avatar_stored_name'),
    avatarMimeType: text('avatar_mime_type'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    nameUnique: uniqueIndex('commander_players_name_unique').on(t.name),
  }),
)

// ---------- commander_games (um mesão/sessão de jogo) ----------
export const commanderGames = sqliteTable(
  'commander_games',
  {
    id: text('id').primaryKey(),
    status: text('status', { enum: ['active', 'ended'] }).notNull().default('active'),
    startingLife: integer('starting_life').notNull().default(40),
    startedAt: integer('started_at', { mode: 'timestamp_ms' }).notNull(),
    endedAt: integer('ended_at', { mode: 'timestamp_ms' }),
  },
  (t) => ({
    statusIdx: index('commander_games_status_idx').on(t.status),
  }),
)

// ---------- commander_game_players (jogadores sentados numa mesa + vida atual) ----------
export const commanderGamePlayers = sqliteTable(
  'commander_game_players',
  {
    id: text('id').primaryKey(),
    gameId: text('game_id')
      .notNull()
      .references(() => commanderGames.id, { onDelete: 'cascade' }),
    playerId: text('player_id')
      .notNull()
      .references(() => commanderPlayers.id, { onDelete: 'restrict' }),
    life: integer('life').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => ({
    gamePlayerUnique: uniqueIndex('commander_game_players_game_player_unique').on(t.gameId, t.playerId),
    gameIdx: index('commander_game_players_game_idx').on(t.gameId),
  }),
)

// ---------- commander_damage_requests (solicitação de dano/ajuste de vida; auto-aplicada quando from === to) ----------
export const commanderDamageRequests = sqliteTable(
  'commander_damage_requests',
  {
    id: text('id').primaryKey(),
    gameId: text('game_id')
      .notNull()
      .references(() => commanderGames.id, { onDelete: 'cascade' }),
    fromPlayerId: text('from_player_id')
      .notNull()
      .references(() => commanderPlayers.id, { onDelete: 'restrict' }),
    toPlayerId: text('to_player_id')
      .notNull()
      .references(() => commanderPlayers.id, { onDelete: 'restrict' }),
    // delta aplicado à vida (negativo = dano, positivo = ganho/cura)
    amount: integer('amount').notNull(),
    type: text('type', { enum: ['combat', 'commander', 'life_adjust', 'other'] }).notNull(),
    commanderName: text('commander_name'),
    status: text('status', { enum: ['pending', 'applied', 'dismissed'] }).notNull().default('pending'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    resolvedAt: integer('resolved_at', { mode: 'timestamp_ms' }),
  },
  (t) => ({
    gameIdx: index('commander_damage_requests_game_idx').on(t.gameId),
    gameStatusIdx: index('commander_damage_requests_game_status_idx').on(t.gameId, t.status),
    toPlayerIdx: index('commander_damage_requests_to_player_idx').on(t.toPlayerId),
  }),
)

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
export const tasksRelations = relations(tasks, ({ many, one }) => ({
  blockRecords: many(blockRecords),
  historyEntries: many(historyEntries),
  responses: many(responses),
  attachments: many(attachments),
  taskTags: many(taskTags),
  assigneePerson: one(people, {
    fields: [tasks.assigneeId],
    references: [people.id],
    relationName: 'task_assignee',
  }),
  reporterPerson: one(people, {
    fields: [tasks.reporterId],
    references: [people.id],
    relationName: 'task_reporter',
  }),
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

export const financeProfilesRelations = relations(financeProfiles, ({ many }) => ({
  expenses: many(expenses),
  incomes: many(incomes),
  mealVoucherPurchases: many(mealVoucherPurchases),
  savingsGoals: many(savingsGoals),
}))

export const expensesRelations = relations(expenses, ({ one }) => ({
  profile: one(financeProfiles, { fields: [expenses.profileId], references: [financeProfiles.id] }),
}))

export const incomesRelations = relations(incomes, ({ one }) => ({
  profile: one(financeProfiles, { fields: [incomes.profileId], references: [financeProfiles.id] }),
}))

export const mealVoucherPurchasesRelations = relations(mealVoucherPurchases, ({ one }) => ({
  profile: one(financeProfiles, { fields: [mealVoucherPurchases.profileId], references: [financeProfiles.id] }),
}))

export const savingsGoalsRelations = relations(savingsGoals, ({ one }) => ({
  profile: one(financeProfiles, { fields: [savingsGoals.profileId], references: [financeProfiles.id] }),
}))

export const upgradePhasesRelations = relations(upgradePhases, ({ many }) => ({
  items: many(upgradeItems),
}))

export const upgradeItemsRelations = relations(upgradeItems, ({ one }) => ({
  phase: one(upgradePhases, { fields: [upgradeItems.phaseId], references: [upgradePhases.id] }),
}))

export const loreCategoriesRelations = relations(loreCategories, ({ many }) => ({
  entries: many(loreEntries),
}))

export const loreEntriesRelations = relations(loreEntries, ({ one }) => ({
  category: one(loreCategories, { fields: [loreEntries.categoryId], references: [loreCategories.id] }),
}))

export const shoppingProfilesRelations = relations(shoppingProfiles, ({ many }) => ({
  items: many(shoppingItems),
}))

export const shoppingItemsRelations = relations(shoppingItems, ({ one }) => ({
  profile: one(shoppingProfiles, { fields: [shoppingItems.profileId], references: [shoppingProfiles.id] }),
}))

export const commanderPlayersRelations = relations(commanderPlayers, ({ many }) => ({
  gamePlayers: many(commanderGamePlayers),
}))

export const commanderGamesRelations = relations(commanderGames, ({ many }) => ({
  gamePlayers: many(commanderGamePlayers),
  damageRequests: many(commanderDamageRequests),
}))

export const commanderGamePlayersRelations = relations(commanderGamePlayers, ({ one }) => ({
  game: one(commanderGames, { fields: [commanderGamePlayers.gameId], references: [commanderGames.id] }),
  player: one(commanderPlayers, { fields: [commanderGamePlayers.playerId], references: [commanderPlayers.id] }),
}))

export const commanderDamageRequestsRelations = relations(commanderDamageRequests, ({ one }) => ({
  game: one(commanderGames, { fields: [commanderDamageRequests.gameId], references: [commanderGames.id] }),
  fromPlayer: one(commanderPlayers, {
    fields: [commanderDamageRequests.fromPlayerId],
    references: [commanderPlayers.id],
    relationName: 'damage_from_player',
  }),
  toPlayer: one(commanderPlayers, {
    fields: [commanderDamageRequests.toPlayerId],
    references: [commanderPlayers.id],
    relationName: 'damage_to_player',
  }),
}))

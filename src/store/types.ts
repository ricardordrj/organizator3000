import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  AppSettings,
  Theme,
  Person,
  CreatePersonInput,
  UpdatePersonInput,
  Tag,
  CreateTagInput,
  UpdateTagInput,
  TaskResponse,
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  SavingsGoal,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
  Income,
  CreateIncomeInput,
  UpdateIncomeInput,
  MealVoucherPurchase,
  CreateMealVoucherPurchaseInput,
  FinanceProfile,
  CreateFinanceProfileInput,
  UpdateFinanceProfileInput,
  UpgradePhase,
  CreateUpgradePhaseInput,
  UpdateUpgradePhaseInput,
  UpgradeItem,
  CreateUpgradeItemInput,
  UpdateUpgradeItemInput,
  LoreCategory,
  CreateLoreCategoryInput,
  UpdateLoreCategoryInput,
  LoreEntry,
  CreateLoreEntryInput,
  UpdateLoreEntryInput,
  ShoppingProfile,
  CreateShoppingProfileInput,
  UpdateShoppingProfileInput,
  ShoppingItem,
  CreateShoppingItemInput,
  UpdateShoppingItemInput,
  CommanderPlayer,
  CreateCommanderPlayerInput,
  UpdateCommanderPlayerInput,
} from '@/models'

export interface UiSlice {
  settings: AppSettings
  isHydrated: boolean
  notificationsEnabled: boolean
  activeFinanceProfileId: string | null
  activeShoppingProfileId: string | null
  setTheme: (theme: Theme) => Promise<void>
  setNotificationsEnabled: (enabled: boolean) => Promise<void>
  setActiveFinanceProfileId: (id: string | null) => void
  setActiveShoppingProfileId: (id: string | null) => void
}

export interface TaskSlice {
  tasks: Task[]
  addTask: (input: CreateTaskInput) => Promise<Task>
  editTask: (id: string, patch: UpdateTaskInput) => Promise<void>
  blockTask: (id: string, reason: string) => Promise<void>
  unblockTask: (id: string) => Promise<void>
  completeTask: (id: string) => Promise<void>
  removeTask: (id: string) => Promise<void>
  uploadAttachment: (taskId: string, file: File, responseId?: string) => Promise<void>
  removeAttachment: (taskId: string, attachmentId: string) => Promise<void>
  addResponse: (taskId: string, message: string) => Promise<TaskResponse>
  removeResponse: (taskId: string, responseId: string) => Promise<void>
}

export interface PersonSlice {
  people: Person[]
  addPerson: (input: CreatePersonInput) => Promise<Person>
  editPerson: (id: string, patch: UpdatePersonInput) => Promise<void>
  removePerson: (id: string) => Promise<void>
}

export interface TagSlice {
  tags: Tag[]
  addTag: (input: CreateTagInput) => Promise<Tag>
  editTag: (id: string, patch: UpdateTagInput) => Promise<void>
  removeTag: (id: string) => Promise<void>
}

export interface ExpenseSlice {
  expenses: Expense[]
  addExpense: (input: CreateExpenseInput) => Promise<Expense>
  editExpense: (id: string, patch: UpdateExpenseInput) => Promise<void>
  markExpensePaid: (id: string) => Promise<void>
  removeExpense: (id: string) => Promise<void>
}

export interface SavingsGoalSlice {
  savingsGoals: SavingsGoal[]
  addSavingsGoal: (input: CreateSavingsGoalInput) => Promise<SavingsGoal>
  editSavingsGoal: (id: string, patch: UpdateSavingsGoalInput) => Promise<void>
  contributeSavingsGoal: (id: string, amountCents: number) => Promise<void>
  removeSavingsGoal: (id: string) => Promise<void>
}

export interface IncomeSlice {
  incomes: Income[]
  addIncome: (input: CreateIncomeInput) => Promise<Income>
  editIncome: (id: string, patch: UpdateIncomeInput) => Promise<void>
  removeIncome: (id: string) => Promise<void>
}

export interface MealVoucherPurchaseSlice {
  mealVoucherPurchases: MealVoucherPurchase[]
  addMealVoucherPurchase: (input: CreateMealVoucherPurchaseInput) => Promise<MealVoucherPurchase>
  removeMealVoucherPurchase: (id: string) => Promise<void>
}

export interface FinanceProfileSlice {
  financeProfiles: FinanceProfile[]
  addFinanceProfile: (input: CreateFinanceProfileInput) => Promise<FinanceProfile>
  editFinanceProfile: (id: string, patch: UpdateFinanceProfileInput) => Promise<void>
  removeFinanceProfile: (id: string) => Promise<void>
}

export interface UpgradePhaseSlice {
  upgradePhases: UpgradePhase[]
  addUpgradePhase: (input: CreateUpgradePhaseInput) => Promise<UpgradePhase>
  editUpgradePhase: (id: string, patch: UpdateUpgradePhaseInput) => Promise<void>
  removeUpgradePhase: (id: string) => Promise<void>
}

export interface UpgradeItemSlice {
  upgradeItems: UpgradeItem[]
  addUpgradeItem: (input: CreateUpgradeItemInput) => Promise<UpgradeItem>
  editUpgradeItem: (id: string, patch: UpdateUpgradeItemInput) => Promise<void>
  toggleUpgradeItem: (id: string) => Promise<void>
  removeUpgradeItem: (id: string) => Promise<void>
}

export interface LoreCategorySlice {
  loreCategories: LoreCategory[]
  addLoreCategory: (input: CreateLoreCategoryInput) => Promise<LoreCategory>
  editLoreCategory: (id: string, patch: UpdateLoreCategoryInput) => Promise<void>
  removeLoreCategory: (id: string) => Promise<void>
}

export interface LoreEntrySlice {
  loreEntries: LoreEntry[]
  addLoreEntry: (input: CreateLoreEntryInput) => Promise<LoreEntry>
  editLoreEntry: (id: string, patch: UpdateLoreEntryInput) => Promise<void>
  removeLoreEntry: (id: string) => Promise<void>
}

export interface ShoppingProfileSlice {
  shoppingProfiles: ShoppingProfile[]
  addShoppingProfile: (input: CreateShoppingProfileInput) => Promise<ShoppingProfile>
  editShoppingProfile: (id: string, patch: UpdateShoppingProfileInput) => Promise<void>
  removeShoppingProfile: (id: string) => Promise<void>
}

export interface ShoppingItemSlice {
  shoppingItems: ShoppingItem[]
  addShoppingItem: (input: CreateShoppingItemInput) => Promise<ShoppingItem>
  editShoppingItem: (id: string, patch: UpdateShoppingItemInput) => Promise<void>
  toggleShoppingItem: (id: string) => Promise<void>
  removeShoppingItem: (id: string) => Promise<void>
}

export interface CommanderPlayerSlice {
  commanderPlayers: CommanderPlayer[]
  commanderPlayersLoaded: boolean
  myCommanderPlayerId: string | null
  setMyCommanderPlayerId: (id: string | null) => void
  loadCommanderPlayers: () => Promise<void>
  addCommanderPlayer: (input: CreateCommanderPlayerInput) => Promise<CommanderPlayer>
  editCommanderPlayer: (id: string, patch: UpdateCommanderPlayerInput) => Promise<void>
  removeCommanderPlayer: (id: string) => Promise<void>
  uploadCommanderPlayerAvatar: (id: string, file: File) => Promise<void>
}

export interface AppState
  extends UiSlice,
    TaskSlice,
    PersonSlice,
    TagSlice,
    ExpenseSlice,
    SavingsGoalSlice,
    IncomeSlice,
    MealVoucherPurchaseSlice,
    FinanceProfileSlice,
    UpgradePhaseSlice,
    UpgradeItemSlice,
    LoreCategorySlice,
    LoreEntrySlice,
    ShoppingProfileSlice,
    ShoppingItemSlice,
    CommanderPlayerSlice {
  hydrate: () => Promise<void>
}

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
} from '@/models'

export interface UiSlice {
  settings: AppSettings
  isHydrated: boolean
  setTheme: (theme: Theme) => Promise<void>
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

export interface AppState extends UiSlice, TaskSlice, PersonSlice, TagSlice {
  hydrate: () => Promise<void>
}

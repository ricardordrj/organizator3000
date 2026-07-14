import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  AppSettings,
  Theme,
} from '@/models'

export interface UiSlice {
  settings: AppSettings
  isHydrated: boolean
  setTheme: (theme: Theme) => Promise<void>
}

export interface TaskSlice {
  tasks: Task[]
  addTask: (input: CreateTaskInput) => Promise<void>
  editTask: (id: string, patch: UpdateTaskInput) => Promise<void>
  blockTask: (id: string, reason: string) => Promise<void>
  unblockTask: (id: string) => Promise<void>
  completeTask: (id: string) => Promise<void>
  removeTask: (id: string) => Promise<void>
}

export interface NoteSlice {
  notes: Note[]
  addNote: (input: CreateNoteInput) => Promise<void>
  editNote: (id: string, patch: UpdateNoteInput) => Promise<void>
  removeNote: (id: string) => Promise<void>
}

export interface AppState extends UiSlice, TaskSlice, NoteSlice {
  hydrate: () => Promise<void>
}

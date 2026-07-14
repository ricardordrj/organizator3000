import type { StateCreator } from 'zustand'
import { taskService } from '@/services'
import type { AppState, TaskSlice } from '../types'

export const createTaskSlice: StateCreator<AppState, [], [], TaskSlice> = (set, get) => ({
  tasks: [],
  addTask: async (input) => {
    const task = await taskService.create(input)
    set({ tasks: [...get().tasks, task] })
  },
  editTask: async (id, patch) => {
    const updated = await taskService.update(id, patch)
    if (!updated) return
    set({ tasks: get().tasks.map((task) => (task.id === id ? updated : task)) })
  },
  blockTask: async (id, reason) => {
    const updated = await taskService.block(id, reason)
    if (!updated) return
    set({ tasks: get().tasks.map((task) => (task.id === id ? updated : task)) })
  },
  unblockTask: async (id) => {
    const updated = await taskService.unblock(id)
    if (!updated) return
    set({ tasks: get().tasks.map((task) => (task.id === id ? updated : task)) })
  },
  completeTask: async (id) => {
    const updated = await taskService.complete(id)
    if (!updated) return
    set({ tasks: get().tasks.map((task) => (task.id === id ? updated : task)) })
  },
  removeTask: async (id) => {
    await taskService.remove(id)
    set({ tasks: get().tasks.filter((task) => task.id !== id) })
  },
})

import type { StateCreator } from 'zustand'
import { taskService, attachmentService, responseService } from '@/services'
import type { AppState, TaskSlice } from '../types'

export const createTaskSlice: StateCreator<AppState, [], [], TaskSlice> = (set, get) => ({
  tasks: [],
  addTask: async (input) => {
    const task = await taskService.create(input)
    set({ tasks: [...get().tasks, task] })
    return task
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
  uploadAttachment: async (taskId, file, responseId) => {
    await attachmentService.upload(taskId, file, responseId)
    const updated = await taskService.get(taskId)
    if (!updated) return
    set({ tasks: get().tasks.map((task) => (task.id === taskId ? updated : task)) })
  },
  removeAttachment: async (taskId, attachmentId) => {
    await attachmentService.remove(attachmentId)
    const updated = await taskService.get(taskId)
    if (!updated) return
    set({ tasks: get().tasks.map((task) => (task.id === taskId ? updated : task)) })
  },
  addResponse: async (taskId, message) => {
    const response = await responseService.create(taskId, { message })
    const updated = await taskService.get(taskId)
    if (updated) {
      set({ tasks: get().tasks.map((task) => (task.id === taskId ? updated : task)) })
    }
    return response
  },
  removeResponse: async (taskId, responseId) => {
    await responseService.remove(responseId)
    const updated = await taskService.get(taskId)
    if (!updated) return
    set({ tasks: get().tasks.map((task) => (task.id === taskId ? updated : task)) })
  },
})

import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getTaskUrgency, compareTaskUrgency } from '@/utils/date.utils'
import type { TaskUrgencyInfo } from '@/utils/date.utils'
import type { Task } from '@/models'

export interface TaskWithUrgency {
  task: Task
  urgency: TaskUrgencyInfo
}

export function useTasks() {
  const tasks = useAppStore((state) => state.tasks)
  const addTask = useAppStore((state) => state.addTask)
  const editTask = useAppStore((state) => state.editTask)
  const blockTask = useAppStore((state) => state.blockTask)
  const unblockTask = useAppStore((state) => state.unblockTask)
  const completeTask = useAppStore((state) => state.completeTask)
  const removeTask = useAppStore((state) => state.removeTask)

  const sortedTasks = useMemo<TaskWithUrgency[]>(() => {
    const withUrgency = tasks.map((task) => ({
      task,
      urgency: getTaskUrgency(task.createdAt, task.deadline, task.status === 'done'),
    }))
    return withUrgency.sort((a, b) => compareTaskUrgency(a.urgency, b.urgency))
  }, [tasks])

  return { tasks: sortedTasks, addTask, editTask, blockTask, unblockTask, completeTask, removeTask }
}

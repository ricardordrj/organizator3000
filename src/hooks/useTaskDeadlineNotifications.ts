import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getTaskUrgency } from '@/utils/date.utils'
import type { TaskUrgencyLevel } from '@/models'

const CHECK_INTERVAL_MS = 60_000
const NOTIFIED_STORAGE_KEY = 'notified-task-deadlines'

type NotifiedMap = Record<string, TaskUrgencyLevel>

function loadNotified(): NotifiedMap {
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveNotified(map: NotifiedMap) {
  localStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(map))
}

export function useTaskDeadlineNotifications() {
  const enabled = useAppStore((state) => state.notificationsEnabled)

  useEffect(() => {
    if (!enabled || typeof Notification === 'undefined') return

    function checkDeadlines() {
      if (Notification.permission !== 'granted') return

      const notified = loadNotified()
      const now = new Date()
      let changed = false

      for (const task of useAppStore.getState().tasks) {
        if (task.status === 'done' || !task.deadline) continue
        const urgency = getTaskUrgency(task.createdAt, task.deadline, false, now)
        if (urgency.level !== 'warning' && urgency.level !== 'overdue') continue
        if (notified[task.id] === urgency.level) continue

        new Notification(urgency.level === 'overdue' ? 'Tarefa atrasada' : 'Prazo se aproximando', {
          body: task.title,
          tag: `task-deadline-${task.id}`,
        })
        notified[task.id] = urgency.level
        changed = true
      }

      if (changed) saveNotified(notified)
    }

    checkDeadlines()
    const interval = setInterval(checkDeadlines, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [enabled])
}

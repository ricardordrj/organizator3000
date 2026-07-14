import { useMemo, useState } from 'react'
import { useTasks, useDebouncedValue } from '@/hooks'
import { Input } from '@/components/ui/input'
import { CreateTaskForm } from '@/components/tasks/CreateTaskForm'
import { TaskListItem } from '@/components/tasks/TaskListItem'
import { TaskDetailsDialog } from '@/components/tasks/TaskDetailsDialog'
import { ConfirmCompleteDialog } from '@/components/tasks/ConfirmCompleteDialog'

export function TasksPage() {
  const { tasks, editTask, blockTask, unblockTask, completeTask, removeTask } = useTasks()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [completeId, setCompleteId] = useState<string | null>(null)

  const filteredTasks = useMemo(
    () =>
      tasks.filter(({ task }) => task.title.toLowerCase().includes(debouncedSearch.toLowerCase())),
    [tasks, debouncedSearch],
  )

  const detailsTask = tasks.find(({ task }) => task.id === detailsId)?.task ?? null
  const completeTaskTarget = tasks.find(({ task }) => task.id === completeId)?.task ?? null

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Tarefas</h2>

      <CreateTaskForm />

      <Input
        type="search"
        placeholder="Buscar tarefas..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <ul className="space-y-2">
        {filteredTasks.map(({ task, urgency }) => (
          <TaskListItem
            key={task.id}
            task={task}
            urgency={urgency}
            expanded={expandedIds.has(task.id)}
            onToggleExpand={() => toggleExpand(task.id)}
            onOpenDetails={() => setDetailsId(task.id)}
            onOpenComplete={() => setCompleteId(task.id)}
            onRemove={() => removeTask(task.id)}
          />
        ))}
        {filteredTasks.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma tarefa encontrada.</p>
        )}
      </ul>

      <TaskDetailsDialog
        task={detailsTask}
        onOpenChange={(open) => {
          if (!open) setDetailsId(null)
        }}
        onSave={(patch) => detailsTask && editTask(detailsTask.id, patch)}
        onBlock={(reason) => detailsTask && blockTask(detailsTask.id, reason)}
        onUnblock={() => detailsTask && unblockTask(detailsTask.id)}
        onOpenComplete={() => detailsTask && setCompleteId(detailsTask.id)}
      />

      <ConfirmCompleteDialog
        task={completeTaskTarget}
        onOpenChange={(open) => {
          if (!open) setCompleteId(null)
        }}
        onConfirm={() => {
          if (!completeTaskTarget) return
          completeTask(completeTaskTarget.id)
          setCompleteId(null)
        }}
      />
    </section>
  )
}

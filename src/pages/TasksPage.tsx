import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, ListTodoIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useTasks, useDebouncedValue } from '@/hooks'
import { ApiError } from '@/services/apiClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog'
import { TaskListItem } from '@/components/tasks/TaskListItem'
import { ConfirmCompleteDialog } from '@/components/tasks/ConfirmCompleteDialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

export function TasksPage() {
  const navigate = useNavigate()
  const { tasks, completeTask, removeTask } = useTasks()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [completeId, setCompleteId] = useState<string | null>(null)
  const [removeId, setRemoveId] = useState<string | null>(null)

  const filteredTasks = useMemo(
    () =>
      tasks.filter(({ task }) => task.title.toLowerCase().includes(debouncedSearch.toLowerCase())),
    [tasks, debouncedSearch],
  )

  const completeTaskTarget = tasks.find(({ task }) => task.id === completeId)?.task ?? null
  const removeTaskTarget = tasks.find(({ task }) => task.id === removeId)?.task ?? null

  async function handleComplete() {
    if (!completeTaskTarget) return
    try {
      await completeTask(completeTaskTarget.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao concluir a tarefa')
    } finally {
      setCompleteId(null)
    }
  }

  async function handleRemove() {
    if (!removeTaskTarget) return
    try {
      await removeTask(removeTaskTarget.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover a tarefa')
    } finally {
      setRemoveId(null)
    }
  }

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <ListTodoIcon className="size-5 text-primary" />
          Tarefas
        </h2>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon className="size-4" />
          Nova tarefa
        </Button>
      </div>

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
            onOpenDetails={() => navigate(`/tasks/${task.id}`)}
            onOpenComplete={() => setCompleteId(task.id)}
            onRemove={() => setRemoveId(task.id)}
          />
        ))}
        {filteredTasks.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma tarefa encontrada.</p>
        )}
      </ul>

      <TaskFormDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmCompleteDialog
        task={completeTaskTarget}
        onOpenChange={(open) => {
          if (!open) setCompleteId(null)
        }}
        onConfirm={handleComplete}
      />

      <ConfirmDialog
        open={removeTaskTarget != null}
        onOpenChange={(open) => {
          if (!open) setRemoveId(null)
        }}
        title="Remover tarefa"
        description={`Tem certeza que deseja remover "${removeTaskTarget?.title}"? Esta ação também apaga anexos, respostas e histórico.`}
        confirmLabel="Remover"
        onConfirm={handleRemove}
      />
    </section>
  )
}

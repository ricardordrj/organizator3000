import { useState } from 'react'
import { AlertTriangleIcon, BanIcon, ClockIcon, ListTodoIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useTasks } from '@/hooks'
import type { Task } from '@/models'
import { ApiError } from '@/services/apiClient'
import { formatTimeRemaining } from '@/utils/date.utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RescheduleDeadlineDialog } from '@/components/tasks/RescheduleDeadlineDialog'

export function DashboardPage() {
  const { tasks, editTask } = useTasks()
  const [rescheduleTask, setRescheduleTask] = useState<Task | null>(null)

  const pendingCount = tasks.filter(({ task }) => task.status !== 'done').length
  const blockedCount = tasks.filter(({ task }) => task.isBlocked).length
  const overdueTasks = tasks.filter(({ urgency }) => urgency.level === 'overdue')
  const warningTasks = tasks.filter(({ urgency }) => urgency.level === 'warning')

  const stats = [
    { label: 'Tarefas', value: tasks.length, icon: ListTodoIcon },
    { label: 'Pendentes', value: pendingCount, icon: ClockIcon },
    { label: 'Atrasadas', value: overdueTasks.length, icon: AlertTriangleIcon },
    { label: 'Bloqueadas', value: blockedCount, icon: BanIcon },
  ]

  async function handleReschedule(newDeadline: Date, justification: string) {
    if (!rescheduleTask) return
    try {
      await editTask(rescheduleTask.id, { deadline: newDeadline, changeReason: justification })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao adiar o prazo')
    } finally {
      setRescheduleTask(null)
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Visão geral</h2>

      {overdueTasks.length > 0 && (
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 font-medium text-red-600 dark:text-red-400">
              <AlertTriangleIcon className="size-4" />
              {overdueTasks.length} tarefa(s) com prazo estourado
            </div>
            <ul className="space-y-1.5">
              {overdueTasks.map(({ task, urgency }) => (
                <li key={task.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>
                    {task.title}
                    {urgency.msRemaining !== null && (
                      <span className="text-muted-foreground"> ({formatTimeRemaining(urgency.msRemaining)})</span>
                    )}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setRescheduleTask(task)}>
                    Adiar prazo
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {warningTasks.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/10">
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 font-medium text-amber-600 dark:text-amber-400">
              <AlertTriangleIcon className="size-4" />
              {warningTasks.length} tarefa(s) próximas do prazo
            </div>
            <ul className="space-y-1.5">
              {warningTasks.map(({ task, urgency }) => (
                <li key={task.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>
                    {task.title}
                    {urgency.msRemaining !== null && (
                      <span className="text-muted-foreground"> ({formatTimeRemaining(urgency.msRemaining)})</span>
                    )}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setRescheduleTask(task)}>
                    Adiar prazo
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
                <stat.icon className="size-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{stat.label}</CardContent>
          </Card>
        ))}
      </div>

      <RescheduleDeadlineDialog
        task={rescheduleTask}
        onOpenChange={(open) => {
          if (!open) setRescheduleTask(null)
        }}
        onConfirm={handleReschedule}
      />
    </section>
  )
}

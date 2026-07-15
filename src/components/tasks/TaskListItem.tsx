import { ChevronDownIcon, LinkIcon } from 'lucide-react'
import type { Task } from '@/models'
import type { TaskUrgencyInfo } from '@/utils/date.utils'
import { formatDate, formatHours, formatTimeRemaining } from '@/utils/date.utils'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  kindLabels,
  priorityBadgeVariant,
  priorityLabels,
  urgencyColorClass,
  urgencyLabels,
} from './taskLabels'

interface TaskListItemProps {
  task: Task
  urgency: TaskUrgencyInfo
  expanded: boolean
  onToggleExpand: () => void
  onOpenDetails: () => void
  onOpenComplete: () => void
  onRemove: () => void
}

export function TaskListItem({
  task,
  urgency,
  expanded,
  onToggleExpand,
  onOpenDetails,
  onOpenComplete,
  onRemove,
}: TaskListItemProps) {
  const isDone = task.status === 'done'

  return (
    <Card size="sm" className="gap-0 py-0">
      <div className="flex flex-col gap-2 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex flex-1 items-center gap-2 text-left"
          >
            <ChevronDownIcon
              className={cn('size-4 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-180')}
            />
            <span className={cn('min-w-0 flex-1 truncate', isDone && 'text-muted-foreground line-through')}>
              {task.title}
            </span>
            {task.kind === 'full' && task.externalRef && (
              <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">#{task.externalRef}</span>
            )}
          </button>
          {isDone ? (
            <Badge variant="secondary">Concluída</Badge>
          ) : (
            <Badge className={urgencyColorClass[urgency.level]}>{urgencyLabels[urgency.level]}</Badge>
          )}
          <Badge variant={priorityBadgeVariant[task.priority]}>{priorityLabels[task.priority]}</Badge>
          {task.isBlocked && <Badge variant="destructive">Bloqueada</Badge>}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isDone || task.isBlocked}
            onClick={onOpenComplete}
          >
            Concluir
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenDetails}>
            Detalhes
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remover
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-1 border-t px-3 py-2 text-sm text-muted-foreground">
          <p>Tipo: {kindLabels[task.kind]}</p>
          {task.deadline && (
            <p>
              Prazo: {formatDate(task.deadline)}
              {urgency.msRemaining !== null && ` (${formatTimeRemaining(urgency.msRemaining)})`}
            </p>
          )}
          {task.timeSpentHours != null && <p>Tempo executado: {formatHours(task.timeSpentHours)}</p>}
          {task.kind === 'full' && task.assignee && <p>Responsável: {task.assignee.name}</p>}
          {task.kind === 'full' && task.reporter && <p>Aberto por: {task.reporter.name}</p>}
          {task.kind === 'full' && task.estimatedHours != null && (
            <p>Estimativa: {formatHours(task.estimatedHours)}</p>
          )}
          {task.kind === 'full' && task.tags.length > 0 && (
            <p>Tags: {task.tags.map((tag) => tag.name).join(', ')}</p>
          )}
          {task.kind === 'full' && task.description && <p>{task.description}</p>}
          {task.kind === 'full' && task.links.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {task.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <LinkIcon className="size-3.5" />
                  {link.label || link.url}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

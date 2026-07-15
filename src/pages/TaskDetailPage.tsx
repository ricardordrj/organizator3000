import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useTasks } from '@/hooks'
import { ApiError } from '@/services/apiClient'
import { formatDateTime, formatHours } from '@/utils/date.utils'
import { resolveTagColorClass } from '@/lib/tagColors'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { TaskAttachments } from '@/components/tasks/TaskAttachments'
import { TaskResponses } from '@/components/tasks/TaskResponses'
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog'
import { ConfirmCompleteDialog } from '@/components/tasks/ConfirmCompleteDialog'
import {
  historyActionLabels,
  kindLabels,
  priorityBadgeVariant,
  priorityLabels,
  statusLabels,
} from '@/components/tasks/taskLabels'

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tasks, blockTask, unblockTask, uploadAttachment, removeAttachment, completeTask } = useTasks()
  const [blockReason, setBlockReason] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)

  const task = tasks.find(({ task }) => task.id === id)?.task ?? null

  if (!task) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-muted-foreground">Tarefa não encontrada.</p>
        <Button variant="outline" onClick={() => navigate('/tasks')}>
          <ArrowLeftIcon className="size-4" />
          Voltar para a listagem
        </Button>
      </section>
    )
  }

  async function handleBlock() {
    if (!blockReason.trim()) return
    try {
      await blockTask(task!.id, blockReason.trim())
      setBlockReason('')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao bloquear a tarefa')
    }
  }

  async function handleUnblock() {
    try {
      await unblockTask(task!.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao desbloquear a tarefa')
    }
  }

  async function handleComplete() {
    try {
      await completeTask(task!.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao concluir a tarefa')
    } finally {
      setCompleteOpen(false)
    }
  }

  async function handleUploadAttachment(file: File) {
    try {
      await uploadAttachment(task!.id, file)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao enviar o anexo')
    }
  }

  async function handleRemoveAttachment(attachmentId: string) {
    try {
      await removeAttachment(task!.id, attachmentId)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover o anexo')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
          <ArrowLeftIcon className="size-4" />
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={task.status === 'done' || task.isBlocked}
            onClick={() => setCompleteOpen(true)}
          >
            Concluir
          </Button>
          <Button size="sm" onClick={() => setEditOpen(true)}>
            Editar
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold">{task.title}</h2>
        <Badge variant="outline">{kindLabels[task.kind]}</Badge>
        {task.kind === 'full' && task.externalRef && <Badge variant="outline">#{task.externalRef}</Badge>}
        {task.isBlocked && <Badge variant="destructive">Bloqueada</Badge>}
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Status</p>
            <p>{statusLabels[task.status]}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Prioridade</p>
            <Badge variant={priorityBadgeVariant[task.priority]}>{priorityLabels[task.priority]}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Prazo limite</p>
            <p>{task.deadline ? formatDateTime(task.deadline) : 'Sem prazo'}</p>
          </div>
          {task.timeSpentHours != null && (
            <div>
              <p className="text-muted-foreground">Tempo executado</p>
              <p>{formatHours(task.timeSpentHours)}</p>
            </div>
          )}
          {task.kind === 'full' && task.assignee && (
            <div>
              <p className="text-muted-foreground">Responsável</p>
              <p>{task.assignee.name}</p>
            </div>
          )}
          {task.kind === 'full' && task.reporter && (
            <div>
              <p className="text-muted-foreground">Aberto por</p>
              <p>{task.reporter.name}</p>
            </div>
          )}
          {task.kind === 'full' && task.estimatedHours != null && (
            <div>
              <p className="text-muted-foreground">Estimativa</p>
              <p>{formatHours(task.estimatedHours)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {task.kind === 'full' && (task.description || task.tags.length > 0 || task.links.length > 0) && (
        <Card>
          <CardContent className="space-y-3 text-sm">
            {task.description && (
              <div>
                <p className="text-muted-foreground">Descrição</p>
                <p className="whitespace-pre-wrap">{task.description}</p>
              </div>
            )}
            {task.tags.length > 0 && (
              <div>
                <p className="text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <Badge key={tag.id} className={resolveTagColorClass(tag.color)}>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {task.links.length > 0 && (
              <div>
                <p className="text-muted-foreground">Links úteis</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {task.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {link.label || link.url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-2">
          <h3 className="text-sm font-medium">Bloqueio</h3>
          {task.isBlocked ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-destructive/10 p-2 text-sm">
              <span>{task.blockHistory.at(-1)?.reason}</span>
              <Button type="button" variant="outline" size="sm" onClick={handleUnblock}>
                Desbloquear
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Textarea
                placeholder="Motivo do bloqueio"
                value={blockReason}
                onChange={(event) => setBlockReason(event.target.value)}
                className="min-h-9 flex-1"
              />
              <Button type="button" variant="outline" onClick={handleBlock}>
                Bloquear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {task.kind === 'full' && (
        <Card>
          <CardContent className="space-y-2">
            <h3 className="text-sm font-medium">Anexos</h3>
            <TaskAttachments
              attachments={task.attachments}
              onUpload={handleUploadAttachment}
              onRemove={handleRemoveAttachment}
            />
          </CardContent>
        </Card>
      )}

      {task.kind === 'full' && (
        <Card>
          <CardContent className="space-y-2">
            <h3 className="text-sm font-medium">Respostas</h3>
            <TaskResponses taskId={task.id} responses={task.responses} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-2">
          <h3 className="text-sm font-medium">Histórico</h3>
          <ul className="max-h-64 space-y-1 overflow-y-auto text-sm text-muted-foreground">
            {[...task.history].reverse().map((entry) => (
              <li key={entry.id} className="flex flex-wrap justify-between gap-2">
                <span>
                  <span className="font-medium text-foreground">{historyActionLabels[entry.action]}:</span>{' '}
                  {entry.description}
                </span>
                <span className="shrink-0">{formatDateTime(entry.at)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <TaskFormDialog mode="edit" task={task} open={editOpen} onOpenChange={setEditOpen} />
      <ConfirmCompleteDialog
        task={completeOpen ? task : null}
        onOpenChange={setCompleteOpen}
        onConfirm={handleComplete}
      />
    </section>
  )
}
